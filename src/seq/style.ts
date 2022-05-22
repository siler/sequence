import { Extent, newExtent } from './layout';

export interface Style {
    readonly frame: FrameStyle,
    readonly lifeline: LifelineStyle,
    readonly message: MessageStyle,
}

export interface FrameStyle {
    readonly padding: Padding,
}

export interface LifelineStyle {
    readonly padding: Padding,
    readonly margin: Padding,
    readonly font: Font,
    readonly boxLineWidth: number,
    readonly lineWidth: number,
}

export interface MessageStyle {
    readonly padding: Padding,
    readonly margin: Padding,
    readonly lineWidth: number,
    readonly arrowWidth: number,
    readonly arrowHeight: number,
}

export type FontWeight = 'normal' | 'bold';
export type FontStyle = 'normal' | 'italic';

export interface Font {
    readonly family: string,
    readonly size: number,
    readonly weight: FontWeight,
    readonly style: FontStyle,
}

export const newFont = (
    family: string, size: number,
    weight: FontWeight = 'normal',
    style: FontStyle = 'normal'
): Font => {
    return { family, size, weight, style };
};

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
        return newExtent(
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