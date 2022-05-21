import { Extent } from './layout'

export interface Style {
    frame: FrameStyle,
    lifeline: LifelineStyle
}

export interface FrameStyle {
    padding: Padding,
}

export interface LifelineStyle {
    padding: Padding,
    margin: Padding,
}

export class Padding {
    constructor(
        public top: number, 
        public right: number, 
        public bottom: number, 
        public left: number
    ) {}

    horizontal = (): number => {
        return this.left + this.right;
    }

    vertical = (): number => {
        return this.top + this.bottom;
    }

    pad = (extent: Extent): Extent => {
        return new Extent(
            extent.width + this.horizontal(),
            extent.height + this.vertical()
        );
    }
}

export const newPadTbLr = (tb: number, lr: number): Padding => {
    return new Padding(tb, lr, tb, lr);
}

export const newPadAll = (padding: number): Padding => {
    return new Padding(padding, padding, padding, padding);
}

export const defaultStyle = () => {
    return {
        frame: {
            padding: newPadAll(10),
        },
        lifeline: {
            padding: newPadAll(10),
            margin: newPadAll(10),
        }
    };
}