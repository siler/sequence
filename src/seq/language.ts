import { any, discard, eof, filter_nulls, many, map, optional, pair, regex, sequence, str, terminated } from "./parse";

// A parsed sequence diagram with ordered lists of participants and messages
export interface ParsedDiagram {
    readonly participants: Participant[];
    readonly messages: Message[];
}

const newParsedDiagram = (participants: Participant[], messages: Message[]) => {
    return {
        participants: participants,
        messages: messages,
    }
}

// A named participant
export interface Participant {
    readonly name: string;
}

const newParticipant = (name: string): Participant => {
    return {
        name
    }
}

// A message with a sender and a receiver
export interface Message {
    readonly from: string;
    readonly to: string;
}

const newMessage = (from: string, to: string): Message => {
    return {
        from,
        to,
    }
}

// parse a SequenceDiagram from a string
export const parse = (text: string): ParsedDiagram | null => {
    const d = diagram({ text: text, index: 0 });
    if (d.success) {
        return d.value
    }

    console.log(d.description)

    return null
}

const simpleParticipantName = regex(/[a-zA-Z0-9]+/g, "participant name");
const ws = regex(/[ \t]+/g, "ws");
const lineEnd = regex(/\n/g, "line ending");

const comment = discard(
    sequence([
        str('#'),
        regex(/[^\n]*/g, 'many not newline'),
        lineEnd
    ])
)

const participant = map(
    terminated(
        filter_nulls(
            sequence([

            ])
        ),
        discard(lineEnd)
    ),
    ([participantName]) => { return newParticipant(participantName!); }
)

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
        any([
            discard(sequence([optional(ws), comment])),
            lineEnd
        ])
    ),
    ([from, _sep, to]: string[]) => { return newMessage(from!, to!); }
)

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
}

const extractParticipants = (participants: Participant[], messages: Message[]): Participant[] => {
    for (const message of messages) {
        if (participants.findIndex(p => p.name === message.from) === -1) {
            participants.push({ name: message.from });
        }

        if (participants.findIndex(p => p.name === message.to) === -1) {
            participants.push({ name: message.to })
        }
    }

    return participants;
}
