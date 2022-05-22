import { Message, ParsedDiagram, Participant } from './language';
import { Lifeline, Diagram, Signal, Direction } from './model';
import { defaultStyle, LifelineStyle, MessageStyle, Padding, Style, } from './style';
import { fromHtmlCanvas } from './measurer';

export class Point {
    constructor(public x: number, public y: number) { }
}

export class Extent {
    constructor(public width: number, public height: number) { }
}

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
        return new Point(this.right(), this.bottom());
    };

    // calculate a new box with the specified padding removed
    depad = (padding: Padding) => {
        const point = new Point(
            this.position.x + padding.left,
            this.position.y + padding.top
        );

        const extent = new Extent(
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

export function layout(
    parsed: ParsedDiagram,
    measuringCanvas: HTMLCanvasElement,
    style: Style = defaultStyle()
): Diagram {
    const measurer = fromHtmlCanvas(measuringCanvas);
    const topLeft = new Point(style.frame.padding.left, style.frame.padding.top);

    function processLifelines(style: LifelineStyle, participants: Participant[]): Lifeline[] {
        let lastRightExtent = topLeft.x;

        return participants.map((p) => {
            const position = new Point(lastRightExtent, topLeft.y);
            const extent = style.margin.pad(
                style.padding.pad(
                    measurer.ascentExtent(p.name)
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
    }

    function processMessages(lifelines: Lifeline[], messages: Message[], style: MessageStyle): Signal[] {
        if (lifelines.length === 0) {
            return [];
        }

        let newHeight = lifelines.reduce(
            (max, curr) => max > curr.bottom() ? max : curr.bottom(),
            0
        );

        const signals = [];
        for (const message of messages) {
            const lifelineIs = (str: string) => (lifeline: Lifeline) => lifeline.name === str;
            const from = lifelines.findIndex(lifelineIs(message.from));
            const to = lifelines.findIndex(lifelineIs(message.to));

            let direction: Direction;
            let leftX: number;
            let span: number;
            if (from < to) {
                direction = 'ltr';
                leftX = lifelines[from].centerX();
                span = lifelines[to].centerX() - leftX;
            } else if (from > to) {
                direction = 'rtl';
                leftX = lifelines[to].centerX();
                span = lifelines[from].centerX() - leftX;
            } else {
                direction = 'none';
                span = 0;
                leftX = lifelines[from].centerX();
            }

            let contentWidth = span;
            if (contentWidth > 0) {
                contentWidth -= style.margin.horizontal();
                contentWidth -= style.padding.horizontal();

                if (contentWidth < 0) {
                    contentWidth = 0;
                }
            }

            const lineHeight = newHeight;
            const position = new Point(leftX, lineHeight);
            const extent = style.margin.pad(style.padding.pad(new Extent(contentWidth, 0)));
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
    }

    function computeSize(lifelines: Lifeline[]): Extent {
        const rightmost = lifelines.slice(-1)[0];
        if (rightmost) {
            return new Extent(
                style.frame.padding.horizontal() + rightmost.box.right(),
                style.frame.padding.vertical() + rightmost.box.bottom() + rightmost.height
            );
        } else {
            return new Extent(
                style.frame.padding.horizontal(),
                style.frame.padding.vertical()
            );
        }
    }

    const lifelines = processLifelines(style.lifeline, parsed.participants);
    const signals = processMessages(lifelines, parsed.messages, style.message);
    const size = computeSize(lifelines);

    return {
        lifelines,
        signals,
        size,
    };
}