import {
   any,
   Context,
   discard,
   eof,
   Error,
   Failure,
   filterNull,
   manyZero,
   many,
   map,
   must,
   optional,
   pair,
   regex,
   sequence,
   str,
   terminated,
} from './combi';

// A parsed sequence diagram with ordered lists of participants and messages
export interface ParsedDiagram {
   readonly participants: Participant[];
   readonly messages: Message[];
}

// A named participant
export interface Participant {
   readonly name: string;
}

// A message with a sender and a receiver
export interface Message {
   readonly from: string;
   readonly to: string;
   readonly label?: string;
}

// parse a SequenceDiagram from a string
export const parseDiagram = (code: string): ParsedDiagram | null => {
   if (code.slice(-1) != '\n') {
      code += '\n';
   }

   const result = diagram(new Context(code));
   if (result.type === 'success') {
      return result.value;
   }

   const cause: (err: Error | Failure) => string = (err) => {
      if (err.cause) {
         return cause(err.cause) + `  then "${err.description}"\n`;
      }

      return `cause: ${err.description}\n`;
   };

   const error = cause(result);

   const idx = result.ctx.index;
   let line = 1;
   let char = 0;
   for (const ch of result.ctx.input.slice(0, idx)) {
      char += 1;
      if (ch == '\n') {
         char = 0;
         line += 1;
      }
   }

   const sample = result.ctx.rest().slice(0, 40);

   console.log(`parse error: "${error}"`);
   console.log(`remaining: "${sample}"`);
   console.log(`Ln ${line}, Col ${char}`);

   return null;
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
 * parses out the participant name and creates a Participant
 */
const participant = map(
   filterNull(
      sequence([discard(str('participant')), skip, must(simpleParticipant)])
   ),
   ([participantName]) => {
      return newParticipant(participantName);
   }
);

/**
 * parses out a message's participants as from and to
 */
const fromTo = map(
   filterNull(
      sequence([
         simpleParticipant,
         skipZero,
         must(discard(str('->'))),
         skipZero,
         must(simpleParticipant),
      ])
   ),
   ([from, to]) => ({ from, to })
);

/**
 * parses a message label as a string
 */
const label = map(
   filterNull(sequence([discard(str('label:')), skipZero, must(restOfLine)])),
   ([label]) => label
);

/**
 * assembles a message from fromTo and label
 */
const message = map(
   pair(terminated(fromTo, skip), optional(label)),
   ({ first: { from, to }, second: label }) => newMessage(from, to, label)
);

/**
 * parse zero or more participants and zero or more messages into a diagram
 */
const diagram = map(
   terminated(
      pair(
         // participants must come before messages
         filterNull(manyZero(any([participant, skip]))),
         // messages terminated with an empty eof line
         filterNull(manyZero(any([message, skip])))
      ),
      eof()
   ),
   ({ first: participants, second: messages }) =>
      makeDiagram(participants, messages)
);

const newParsedDiagram = (
   participants: Participant[],
   messages: Message[]
): ParsedDiagram => ({ participants, messages });

const newParticipant = (name: string): Participant => ({ name });

const newMessage = (from: string, to: string, label?: string): Message => ({
   from,
   to,
   label,
});

const makeDiagram = (
   participants: Participant[],
   messages: Message[]
): ParsedDiagram => {
   const resolvedParticipants = extractParticipants(participants, messages);
   return newParsedDiagram(resolvedParticipants, messages);
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
