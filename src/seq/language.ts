import { any, discard, eof, filter_nulls, many, map, optional, pair, regex, sequence, str, terminated } from './parse';

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
}

// parse a SequenceDiagram from a string
export function parseDiagram(code: string): ParsedDiagram | null {
    if (code.slice(-1) != '\n') {
        code += '\n';
    }

    const result = diagram({ code, index: 0 });
    if (result.success) {
        return result.value;
    }

    let error = result.description;
    let fail = result.cause;
    while (fail !== null) {
        error += ` caused by: ${fail.description}`;
        fail = fail.cause;
    }
    console.log(`parse error: ${error}`);
    console.log(`position: ${result.ctx.index}`);

    return null;
}

const newParsedDiagram = (participants: Participant[], messages: Message[]): ParsedDiagram => {
    return {
        participants: participants,
        messages: messages,
    };
};

const newParticipant = (name: string): Participant => {
    return {
        name
    };
};

const newMessage = (from: string, to: string): Message => {
    return {
        from,
        to,
    };
};

const simpleParticipantName = regex(/[a-zA-Z0-9]+/g, 'participant name');
const ws = regex(/[ \t]+/g, 'ws');
const lineEnd = regex(/\n/g, 'line ending');

const comment = discard(
    sequence([
        str('#'),
        regex(/[^\n]*/g, 'many not newline'),
        lineEnd
    ])
);

const restOfLine = sequence([
    optional(ws),
    any([comment, lineEnd])
]);


const participant = map(
    terminated(
        filter_nulls(
            sequence([
                discard(str('participant')),
                discard(ws),
                simpleParticipantName,
            ])
        ),
        restOfLine
    ),
    ([participantName]) => { return newParticipant(participantName); }
);

const message = map(
    terminated(
        filter_nulls(
            sequence([
                simpleParticipantName,
                discard(optional(ws)),
                str('->'),
                discard(optional(ws)),
                simpleParticipantName,
            ])
        ),
        restOfLine
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([from, _, to]: string[]) => { return newMessage(from, to); }
);

const diagram = map(
    pair(
        // participants must come before messages
        filter_nulls(
            many(any([
                comment,
                participant,
                discard(lineEnd),
            ]))
        ),
        // messages terminated with an empty eof line
        terminated(
            filter_nulls(
                many(any([
                    comment,
                    message,
                    discard(lineEnd)
                ])),
            ),
            eof()
        ),
    ),
    ({ first, second }) => makeDiagram(first, second)
);

const makeDiagram = (participants: Participant[], messages: Message[]): ParsedDiagram => {
    const resolvedParticipants = extractParticipants(participants, messages);
    return newParsedDiagram(resolvedParticipants, messages);
};

const extractParticipants = (participants: Participant[], messages: Message[]): Participant[] => {
    for (const message of messages) {
        if (participants.findIndex(p => p.name === message.from) === -1) {
            participants.push({ name: message.from });
        }

        if (participants.findIndex(p => p.name === message.to) === -1) {
            participants.push({ name: message.to });
        }
    }

    return participants;
};
