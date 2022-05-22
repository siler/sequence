import { Extent } from './layout';

export interface Style {
    frame: FrameStyle,
    lifeline: LifelineStyle,
    message: MessageStyle,
}

export interface FrameStyle {
    padding: Padding,
}

export interface LifelineStyle {
    padding: Padding,
    margin: Padding,
    font: Font,
    boxLineWidth: number,
    lineWidth: number,
}

export interface MessageStyle {
    padding: Padding,
    margin: Padding,
    lineWidth: number,
    arrowWidth: number,
    arrowHeight: number,
}

export type FontWeight = 'normal' | 'bold';
export type FontStyle = 'normal' | 'italic';

export interface Font {
    family: string,
    size: number,
    weight: FontWeight,
    style: FontStyle,
}

export function newFont(
    family: string, size: number,
    weight: FontWeight = 'normal',
    style: FontStyle = 'normal'
) {
    return { family, size, weight, style };
}

export class Padding {
    constructor(
        public top: number,
        public right: number,
        public bottom: number,
        public left: number
    ) { }

    horizontal = (): number => {
        return this.left + this.right;
    };

    vertical = (): number => {
        return this.top + this.bottom;
    };

    pad = (extent: Extent): Extent => {
        return new Extent(
            extent.width + this.horizontal(),
            extent.height + this.vertical()
        );
    };
}

export const newPadTbLr = (tb: number, lr: number): Padding => {
    return new Padding(tb, lr, tb, lr);
};

export const newPadAll = (padding: number): Padding => {
    return new Padding(padding, padding, padding, padding);
};

export const defaultStyle = (): Style => {
    return {
        frame: {
            padding: newPadAll(10),
        },
        lifeline: {
            padding: newPadAll(10),
            margin: newPadAll(10),
            font: newFont('Helvetica', 14),
            boxLineWidth: 2,
            lineWidth: 2,
        },
        message: {
            padding: newPadAll(10),
            margin: newPadAll(5),
            lineWidth: 2,
            arrowWidth: 7.5,
            arrowHeight: 3,
        },
    };
};