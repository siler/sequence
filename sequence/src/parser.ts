import {
   any,
   clean,
   discard,
   eof,
   fail,
   Failure,
   filterNull,
   many,
   manyZero,
   map,
   must,
   optional,
   pair,
   preceded,
   regex,
   sequence,
   str,
   terminated,
} from './combi';

// A parsed sequence diagram with ordered lists of participants and messages
export interface ParsedDiagram {
   readonly title?: string;
   readonly participants: Participant[];
   readonly messages: Message[];
}

export const newEmptyDiagram = (): ParsedDiagram => ({
   participants: [],
   messages: [],
});

// A named participant
export interface Participant {
   readonly name: string;
}

export type ArrowEnd = 'filled' | 'empty';
export type LineStyle = 'solid' | 'dashed' | 'dotted';

export interface MessageProperties {
   readonly label?: string;
   readonly arrow: ArrowEnd;
   readonly line: LineStyle;
   readonly delay: number;
}

// A message with a sender and a receiver
export interface Message extends MessageProperties {
   readonly from: string;
   readonly to: string;
}

export type ParseResult = ParseSuccess | ParseFailure;
export interface ParseSuccess {
   type: 'success';
   diagram: ParsedDiagram;
}

export interface ParseFailure {
   type: 'failure';
   reason: Failure;
}

// parse a SequenceDiagram from a string
export const parseDiagram = (code: string): ParseResult => {
   if (code.slice(-1) != '\n') {
      code += '\n';
   }

   const result = diagram({ input: code, index: 0 });
   if (result.type === 'success') {
      return { type: 'success', diagram: result.value };
   } else if (result.type === 'error') {
      return { type: 'failure', reason: fail(result) };
   }

   return { type: 'failure', reason: result };
};

/**
 * consumes a simple alphanumeric identifier
 */
const simpleParticipant = regex(/[a-zA-Z0-9]+/g, 'participant name');

/**
 * consumes a space, tab, or newline
 */
const ws = regex(/[ \t\n]+/g, 'ws');

/**
 * consumes from a comment marker to a newline, discarding the contents
 */
const comment = discard(
   sequence([str('#'), regex(/[^\n]*/g, 'many not newline')])
);

/**
 * consumes input until a comment or newline
 */
const restOfLine = regex(/[^#^\n]*/g, 'not comment or newline');

/**
 * skips one or more whitespace or comments, discarding them
 */
const skip = discard(many(any([ws, comment])));

/**
 * skips zero or more whitespace or comments, discarding them
 */
const skipZero = discard(manyZero(any([ws, comment])));

/**
 * parses a title
 */
const title = map(
   clean(
      sequence([
         discard(str('title:')),
         skipZero,
         must(restOfLine, 'expected title content'),
      ])
   ),
   ([title]) => title
);

/**
 * parses out the participant name and creates a Participant
 */
const participant = map(
   clean(
      sequence([
         discard(str('participant:')),
         skip,
         must(simpleParticipant, 'expected participant name'),
      ])
   ),
   ([name]) => ({ name })
);

/**
 * parses a string containing the extra characters
 */
const arrow = map(
   clean(
      sequence([
         discard(str('-')),
         optional(str('-')),
         optional(str('-')),
         discard(str('>')),
         optional(str('>')),
      ])
   ),
   (strs) => strs.reduce((val, curr) => val + curr, '')
);

/**
 * parses a string representing the numeric amount of the delay
 */
const delay = map(
   clean(
      sequence([
         discard(str('(')),
         regex(/[0-9]+(\.[0-9]*)?/g, 'number'),
         discard(str(')')),
      ])
   ),
   ([delay]) => delay
);

/**
 * parses out a message's participants as from and to
 */
const fromTo = map(
   filterNull(
      sequence([
         simpleParticipant,
         skipZero,
         must(arrow, 'expected signal arrow'),
         optional(delay),
         skipZero,
         must(simpleParticipant, 'expected signal "to" participant'),
      ])
   ),
   ([from, arrow, delay, to]) => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      from: from!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      to: to!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      arrow: arrow!,
      delay,
   })
);

/**
 * parses a message label as a string
 */
const label = map(
   clean(
      sequence([
         discard(str('label:')),
         skipZero,
         must(restOfLine, 'expected label content'),
      ])
   ),
   ([label]) => label
);

/**
 * assembles a message from fromTo and label
 */
const message = map(
   pair(terminated(fromTo, skip), optional(label)),
   ({ first: { from, to, arrow, delay }, second: label }) =>
      processMessage(from, to, arrow, delay, label)
);

/**
 * parse zero or more participants and zero or more messages into a diagram
 */
const diagram = map(
   terminated(
      pair(
         preceded(skipZero, optional(title)),
         pair(
            // participants must come before messages
            clean(manyZero(any([participant, skip]))),
            // messages terminated with an empty eof line
            clean(manyZero(any([message, skip])))
         )
      ),
      must(eof(), 'expected signal')
   ),
   ({ first: title, second: { first: participants, second: messages } }) =>
      makeDiagram(participants, messages, title)
);

const makeDiagram = (
   participants: Participant[],
   messages: Message[],
   title?: string
): ParsedDiagram => {
   const resolvedParticipants = extractParticipants(participants, messages);
   return { participants: resolvedParticipants, messages, title };
};

const extractParticipants = (
   participants: Participant[],
   messages: Message[]
): Participant[] => {
   const nameIs = (str: string) => (p: Participant) => p.name == str;
   for (const message of messages) {
      if (participants.findIndex(nameIs(message.from)) === -1) {
         participants.push({ name: message.from });
      }

      if (participants.findIndex(nameIs(message.to)) === -1) {
         participants.push({ name: message.to });
      }
   }

   return participants;
};

const processMessage = (
   from: string,
   to: string,
   arrowStr: string,
   delayStr?: string,
   label?: string
): Message => {
   let delay = 0;

   if (delayStr) {
      delay = parseFloat(delayStr);
      if (isNaN(delay) || delay < 0) {
         delay = 0;
      } else if (delay > 50) {
         delay = 50;
      }
   }

   let arrow: ArrowEnd = 'filled';
   let dashes = 0;
   for (const ch of arrowStr) {
      if (ch === '>') {
         arrow = 'empty';
      } else if (ch === '-') {
         dashes += 1;
      }
   }

   let line: LineStyle;
   if (dashes === 1) {
      line = 'dashed';
   } else if (dashes === 2) {
      line = 'dotted';
   } else {
      line = 'solid';
   }

   return {
      from,
      to,
      label,
      arrow,
      line,
      delay: delay,
   };
};
