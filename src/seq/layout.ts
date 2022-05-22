import { Message, ParsedDiagram, Participant } from './language';
import { Lifeline, Diagram, Signal, Direction } from './model';
import { defaultStyle, LifelineStyle, MessageStyle, Padding, Style, } from './style';
import { fromHtmlCanvas } from './measurer';

export interface Point {
    readonly x: number,
    readonly y: number
}

export const newPoint = (x: number, y: number) => {
    return { x, y };
};

export interface Extent {
    readonly width: number,
    readonly height: number
}

export const newExtent = (width: number, height: number) => {
    return { width, height };
};

export class Box {
    constructor(public position: Point, public extent: Extent) { }

    // right X position of the box
    right = (): number => {
        return this.position.x + this.extent.width;
    };

    // bottom Y position of the lifeline box
    bottom = (): number => {
        return this.position.y + this.extent.height;
    };

    // bottom right point of the lifeline box
    bottomRight = (): Point => {
        return newPoint(this.right(), this.bottom());
    };

    // calculate a new box with the specified padding removed
    depad = (padding: Padding) => {
        const point = newPoint(
            this.position.x + padding.left,
            this.position.y + padding.top
        );

        const extent = newExtent(
            this.extent.width - padding.horizontal(),
            this.extent.height - padding.vertical()
        );

        return new Box(point, extent);
    };

    xywh = (): number[] => {
        return [
            this.position.x,
            this.position.y,
            this.extent.width,
            this.extent.height
        ];
    };
}

export const layout = (
    parsed: ParsedDiagram,
    measuringCanvas: HTMLCanvasElement,
    style: Style = defaultStyle()
): Diagram => {
    const measurer = fromHtmlCanvas(measuringCanvas);
    const topLeft = newPoint(style.frame.padding.left, style.frame.padding.top);

    /**
     * generates a list of lifelines laid out left to right in order.
     * 
     * each lifeline box should have the same height, width will vary
     * by text length. they should start with consistent spacing between
     * them, though that will be modified later depending on message text
     * length among other things.
     */
    const processLifelines = (style: LifelineStyle, participants: Participant[]): Lifeline[] => {
        let lastRightExtent = topLeft.x;

        return participants.map((p) => {
            const position = newPoint(lastRightExtent, topLeft.y);
            const width = measurer.ascentExtent(p.name, style.font).width;
            const extent = style.margin.pad(
                style.padding.pad(
                    newExtent(width, style.font.size)
                )
            );
            const box = new Box(position, extent);
            const lifeline = new Lifeline(
                p.name,
                box,
                style
            );

            lastRightExtent = lifeline.box.right();

            return lifeline;
        });
    };

    const processMessages = (lifelines: Lifeline[], messages: Message[], style: MessageStyle): Signal[] => {
        if (lifelines.length === 0) {
            return [];
        }

        const nameIs = (str: string) => { return (lifeline: Lifeline) => lifeline.name === str; };

        const messageSpan = (message: Message): Span => {
            const from = lifelines.findIndex(nameIs(message.from));
            const to = lifelines.findIndex(nameIs(message.to));

            if (from < to) {
                const leftX = lifelines[from].centerX();
                return {
                    direction : 'ltr',
                    leftX,
                    width : lifelines[to].centerX() - leftX,
                };
            } else if (from > to) {
                const leftX = lifelines[to].centerX();
                return {
                    direction : 'rtl',
                    leftX,
                    width : lifelines[from].centerX() - leftX,
                };
            } else {
                return {
                    direction : 'none',
                    width : 0,
                    leftX : lifelines[from].centerX(),
                };
            }
        };

        let newHeight = lifelines.reduce(
            (max, curr) => max > curr.bottom() ? max : curr.bottom(),
            0
        );

        const signals = [];
        for (const message of messages) {
            const {direction, leftX, width} = messageSpan(message);

            let contentWidth = width;
            if (contentWidth > 0) {
                contentWidth -= style.margin.horizontal();
                contentWidth -= style.padding.horizontal();

                if (contentWidth < 0) {
                    contentWidth = 0;
                }
            }

            const lineHeight = newHeight;
            const position = newPoint(leftX, lineHeight);
            const extent = style.margin.pad(style.padding.pad(newExtent(contentWidth, 0)));
            const box = new Box(position, extent);
            signals.push(
                new Signal(
                    box,
                    direction,
                    style,
                )
            );

            newHeight += box.extent.height;
        }

        lifelines.forEach((lifeline) => lifeline.height = newHeight);

        return signals;
    };

    const computeSize = (lifelines: Lifeline[]): Extent => {
        const rightmost = lifelines.slice(-1)[0];
        if (rightmost) {
            return newExtent(
                style.frame.padding.horizontal() + rightmost.box.right(),
                style.frame.padding.vertical() + rightmost.box.bottom() + rightmost.height
            );
        } else {
            return newExtent(
                style.frame.padding.horizontal(),
                style.frame.padding.vertical()
            );
        }
    };

    const lifelines = processLifelines(style.lifeline, parsed.participants);
    const signals = processMessages(lifelines, parsed.messages, style.message);
    const size = computeSize(lifelines);

    return {
        lifelines,
        signals,
        size,
    };
};

interface Span {
    direction : Direction,
    leftX: number,
    width : number,
}