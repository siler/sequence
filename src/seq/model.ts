import { Graphics } from './graphics';
import { Box } from './layout';
import { LifelineStyle } from './style';

export interface Diagram {
    lifelines: Lifeline[]
}

export class Lifeline {
    height = 0;

    constructor(
        public name: string,
        public box: Box,
        public style: LifelineStyle,
    ) { }

    // Center X of the lifeline
    centerX = (): number => {
        return Math.round((this.box.position.x + this.box.right()) / 2);
    };

    bottom = (): number => {
        return this.box.bottom() + this.height;
    };

    // Draw the lifeline
    draw = (graphics: Graphics) => {
        const rect = this.box.depad(this.style.margin);
        graphics.rect(
            rect.position.x,
            rect.position.y,
            rect.extent.width,
            rect.extent.height
        );

        const text = this.box.depad(this.style.padding);
        graphics.fillText(this.name, text.position.x, text.position.y);

        const centerX = this.centerX();
        graphics.beginPath().stroke();
        graphics.moveTo(centerX, this.box.bottom());
        graphics.lineTo(centerX, this.bottom());
    };
}