import { ParsedDiagram, Participant } from "./language";
import { Lifeline, Diagram as Diagram } from "./model";
import { defaultStyle, LifelineStyle, Padding, Style, } from "./style";

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
    }

    // bottom Y position of the lifeline box
    bottom = (): number => {
        return this.position.y + this.extent.height;
    }

    // bottom right point of the lifeline box
    bottomRight = (): Point => {
        return new Point(this.right(), this.bottom());
    }

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
    }

    xywh = (): number[] => {
        return [
            this.position.x,
            this.position.y,
            this.extent.width,
            this.extent.height
        ]
    }
}

class Measurer {
    ctx: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
    }

    metrics = (text: string): TextMetrics => {
        return this.ctx.measureText(text);
    }

    ascentExtent = (text: string): Extent => {
        const metrics = this.metrics(text);
        return new Extent(metrics.width, metrics.actualBoundingBoxAscent)
    }
}

export const layout = (parsed: ParsedDiagram, measuringCanvas: HTMLCanvasElement, style: Style = defaultStyle()): Diagram => {
    const measurer = new Measurer(measuringCanvas);
    const topLeft = new Point(style.frame.padding.left, style.frame.padding.top);

    const initLifelines = (style: LifelineStyle, participants: Participant[]): Lifeline[] => {
        var lastRightExtent = topLeft.x;

        return participants.map((p) => {
            const position = new Point(lastRightExtent, topLeft.y);
            const extent = style.margin.pad(
                style.padding.pad(measurer.ascentExtent(p.name))
            );
            const box = new Box(position, extent);
            const lifeline = new Lifeline(
                p.name,
                box,
                style
            );

            lastRightExtent = lifeline.box.right()

            return lifeline;
        });
    }

    const lifelines = initLifelines(style.lifeline, parsed.participants);

    return {
        lifelines: lifelines
    }
}