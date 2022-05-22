import { Graphics } from './graphics';
import { Box, Extent } from './layout';
import { LifelineStyle, MessageStyle as SignalStyle } from './style';

export interface Diagram {
    lifelines: Lifeline[],
    signals: Signal[],
    size: Extent,
}

export class Lifeline {
    height = 0;

    constructor(
        public name: string,
        public box: Box,
        public style: LifelineStyle,
    ) { }

    /**
     * Center X of the lifeline
     */
    centerX(): number {
        return Math.round((this.box.position.x + this.box.right()) / 2);
    }

    /**
     * the x position of the bottom of the lifeline, including the lifeline itself
     */
    bottom(): number {
        return this.box.bottom() + this.height;
    }

    /**
     * draw the Lifeline
     */
    draw(graphics: Graphics) {
        const rect = this.box.depad(this.style.margin);
        graphics.rect(
            rect.position.x,
            rect.position.y,
            rect.extent.width,
            rect.extent.height
        ).stroke();

        const text = rect.depad(this.style.padding);
        const metrics = graphics.measureText(this.name);
        graphics.fillText(
            this.name,
            text.position.x,
            text.position.y + metrics.actualBoundingBoxAscent
        );

        const centerX = this.centerX();
        graphics.beginPath();
        graphics.moveTo(centerX, rect.bottom());
        graphics.lineTo(centerX, this.bottom()).stroke();
    }
}

export type Direction = 'ltr' | 'rtl' | 'none';

export class Signal {
    constructor(
        public box: Box,
        public direction: Direction,
        public style: SignalStyle,
    ) {}

    /**
     * draw the Signal
     */
    draw(graphics: Graphics) {
        const padded = this.box.depad(this.style.margin);
        const leftX = padded.position.x;
        const rightX = padded.right();
        const y = padded.bottom();

        graphics.beginPath();
        graphics.moveTo(leftX, y);
        graphics.lineTo(rightX, y);

        switch (this.direction) {
        case 'ltr':
            graphics.moveTo(rightX - 10, y - 5);
            graphics.lineTo(rightX, y);
            graphics.lineTo(rightX - 10, y + 5);
            break;
        case 'rtl':
            graphics.moveTo(leftX + 10, y - 5);
            graphics.lineTo(leftX, y);
            graphics.lineTo(leftX + 10, y + 5);
            break;
        case 'none':
            graphics.moveTo(leftX + 10, y - 5);
            graphics.lineTo(leftX, y);
            graphics.lineTo(leftX + 10, y + 5);
            break;
        }

        graphics.stroke();
    }
}