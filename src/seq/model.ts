import { Graphics } from './graphics';
import { MessageProperties } from './language/parser';
import { Box, Extent } from './layout';
import { LifelineStyle, MessageStyle as SignalStyle } from './style';

export interface Diagram {
   readonly lifelines: Lifeline[];
   readonly signals: Signal[];
   readonly size: Extent;
}

export class Lifeline {
   height = 0;

   constructor(
      public name: string,
      public box: Box,
      public style: LifelineStyle
   ) {}

   /**
    * Center X of the lifeline
    */
   centerX = (): number => {
      return Math.round((this.box.position.x + this.box.right()) / 2);
   };

   /**
    * the x position of the bottom of the lifeline, including the lifeline itself
    */
   bottom = (): number => {
      return this.box.bottom() + this.height;
   };

   /**
    * draw the Lifeline
    */
   draw = (graphics: Graphics) => {
      const rect = this.box.depad(this.style.margin);

      graphics.save();
      graphics.lineWidth(this.style.boxLineWidth);
      graphics
         .rect(
            rect.position.x,
            rect.position.y,
            rect.extent.width,
            rect.extent.height
         )
         .stroke();
      graphics.restore();

      const text = rect.depad(this.style.padding);
      graphics.save();
      graphics.setFont(
         this.style.font.family,
         this.style.font.size,
         this.style.font.weight,
         this.style.font.style
      );
      const metrics = graphics.measureText(this.name);
      graphics.fillText(
         this.name,
         text.position.x,
         text.position.y + metrics.actualBoundingBoxAscent
      );
      graphics.restore();

      const centerX = this.centerX();
      graphics.save();
      graphics.lineWidth(this.style.lineWidth);
      graphics.beginPath();
      graphics.moveTo(centerX, rect.bottom());
      graphics.lineTo(centerX, this.bottom()).stroke();
      graphics.restore();
   };
}

export type Direction = 'ltr' | 'rtl' | 'none';

export class Signal implements MessageProperties {
   constructor(
      public box: Box,
      public direction: Direction,
      public style: SignalStyle,
      public filled: boolean,
      public dashed: boolean,
      public label?: string
   ) {}

   /**
    * draw the Signal
    */
   draw = (graphics: Graphics) => {
      const padded = this.box.depad(this.style.margin);
      const leftX = padded.position.x;
      const rightX = padded.right();
      const y = padded.bottom();
      const width = this.style.lineWidth;
      const arrowWidth = this.style.arrowWidth;
      const arrowHeight = this.style.arrowHeight;

      graphics.save(); // signal

      graphics.lineWidth(this.style.lineWidth);

      graphics.save(); // line

      if (this.dashed) {
         graphics.setLineDash([
            this.style.lineWidth * 2.5,
            this.style.lineWidth * 2.5,
         ]);
      }

      graphics.beginPath();
      graphics.moveTo(leftX, y);
      graphics.lineTo(rightX, y);
      graphics.stroke();

      graphics.restore(); // line

      const leftArrow = () => {
         graphics.moveTo(leftX + arrowWidth * width, y - arrowHeight * width);
         graphics.lineTo(leftX, y);
         graphics.lineTo(leftX + arrowWidth * width, y + arrowHeight * width);
      };

      graphics.beginPath();

      switch (this.direction) {
         case 'ltr':
            graphics.moveTo(
               rightX - arrowWidth * width,
               y - arrowHeight * width
            );
            graphics.lineTo(rightX, y);
            graphics.lineTo(
               rightX - arrowWidth * width,
               y + arrowHeight * width
            );
            break;
         case 'rtl':
            leftArrow();
            break;
         case 'none':
            leftArrow();
            break;
      }

      if (this.filled) {
         graphics.closePath().fill();
      } else {
         graphics.stroke();
      }

      if (this.label) {
         const { family, size, weight, style } = this.style.font;
         graphics.setFont(family, size, weight, style);
         graphics.textAlign('center');

         const content = this.box
            .depad(this.style.padding)
            .depad(this.style.margin);

         const x = content.centerX();
         const y = content.bottom() - this.style.font.size * 0.5;
         graphics.strokeStyle('#fff');
         graphics.strokeText(this.label, x, y);
         graphics.fillText(this.label, x, y);
      }

      graphics.restore(); // signal
   };
}
