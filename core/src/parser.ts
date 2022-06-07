import {
   clean,
   context,
   discard,
   eof,
   expect,
   fail,
   Failure,
   filterNull,
   many,
   manyZero,
   map,
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
   if (code.slice(-1) !== '\n') {
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
const ws = regex(/[ \t]+/g, 'ws');

/**
 * consumes a space, tab, or newline
 */
const wsZero = regex(/[ \t]*/g, 'zero or more ws');

/**
 * consumes a space, tab, or newline
 */
const nl = str('\n');

/**
 * consumes from a comment marker to a newline, discarding the contents
 */
const comment = discard(sequence([str('#'), regex(/[^\n]*/g, 'comment')]));

/**
 * consumes input until a comment or newline
 */
const lineContent = regex(/[^#^\n]*/g, 'line content');

/**
 * skips zero or more whitespaces, discarding them
 *
 * used between tokens on a line command
 *
 */
const skipWsZero = discard(wsZero);

/**
 * skips whitespace then comment up to and including a newline
 *
 * used to terminate lines
 */
const skipLine = discard(
   sequence([skipWsZero, discard(optional(comment)), discard(nl)])
);

/**
 * skips skips one or more lines of whitespace and comments
 *
 * used between lines
 */
const skipLines = discard(many(skipLine));

/**
 * skips zero or more lines of whitespace and comments
 *
 * used between lines
 */
const skipLinesZero = discard(manyZero(skipLine));

/**
 * parses a line with the tag then a colon then the captured text
 */
const taggedLine = (tag: string) =>
   context(
      map(
         clean(
            sequence([
               skipWsZero,
               discard(str(tag)),
               skipWsZero,
               expect(discard(str(':')), tag + ' separator'),
               skipWsZero,
               expect(lineContent, tag + ' content'),
               expect(discard(skipLines), 'end of line'),
            ])
         ),
         ([line]) => line
      ),
      'expected ' + tag
   );

/**
 * parses a title
 */
const titleLine = taggedLine('title');

/**
 * parses out the participant name and creates a Participant
 */
const participantLine = map(taggedLine('participant'), (name) => ({
   name,
}));

/**
 * parses a string containing the extra characters
 */
const arrow = map(
   clean(
      sequence([
         discard(str('-')),
         optional(str('-')),
         optional(str('-')),
         expect(discard(str('>')), 'arrowhead'),
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
         discard(skipWsZero),
         expect(regex(/[0-9]+(\.[0-9]*)?/g, 'number'), 'value'),
         discard(skipWsZero),
         expect(discard(str(')')), 'closing delimiter'),
      ])
   ),
   ([delay]) => delay
);

/**
 * parses out a message's participants as from and to
 */
const fromToLine = map(
   filterNull(
      sequence([
         skipWsZero,
         simpleParticipant,
         skipWsZero,
         expect(arrow, 'arrow'),
         skipWsZero,
         optional(delay),
         skipWsZero,
         expect(simpleParticipant, 'destination participant alias'),
         expect(discard(skipLines), 'end of line'),
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
const labelLine = taggedLine('label');

/**
 * assembles a message from fromTo and label
 */
const messageLines = context(
   map(
      pair(fromToLine, optional(labelLine)),
      ({ first: { from, to, arrow, delay }, second: label }) =>
         processMessage(from, to, arrow, delay, label)
   ),
   'expected signal'
);

/**
 * parse a diagram from a title, participants, and messages
 */
const diagram = map(
   terminated(
      pair(
         preceded(skipLinesZero, optional(titleLine)),
         pair(manyZero(participantLine), manyZero(messageLines))
      ),
      eof()
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
      delay,
   };
};
