import { Graphics } from './graphics';
import { MessageProperties } from './language/parser';
import { Box, Extent, newPoint, Point } from './layout';
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
      graphics.fillText(this.name, text.position.x, text.bottom());
      graphics.restore();

      const centerX = this.centerX();
      graphics.save();
      graphics.lineWidth(this.style.lineWidth);
      graphics.beginPath();
      graphics.moveTo(centerX, rect.bottom() + 1);
      graphics.lineTo(centerX, this.bottom()).stroke();
      graphics.restore();
   };
}

export type Direction = 'ltr' | 'rtl' | 'none';

export class Signal {
   constructor(
      public box: Box,
      public direction: Direction,
      public style: SignalStyle,
      public props: MessageProperties,
      public delayHeight: number
   ) {}

   /**
    * draw the Signal
    */
   draw = (graphics: Graphics) => {
      graphics.save();

      const length = this.applyTransform(graphics);
      // this.drawBoundingBox(graphics);
      this.drawLine(graphics, length);
      this.drawLabel(graphics, length);

      graphics.restore();
   };

   drawBoundingBox = (graphics: Graphics) => {
      graphics.save();

      graphics.lineWidth(1);
      graphics.strokeStyle('#f00');

      graphics
         .rect(
            this.box.position.x,
            this.box.position.y,
            this.box.extent.width,
            this.box.extent.height
         )
         .stroke();

      graphics.restore();
   };

   applyTransform = (graphics: Graphics): number => {
      const padded = this.box.depad(this.style.margin);

      let left: Point;
      let right: Point;
      if (this.direction === 'rtl') {
         const bottom = padded.bottom();
         left = newPoint(padded.position.x, bottom + this.delayHeight);
         right = newPoint(padded.right(), bottom);
      } else {
         left = newPoint(padded.position.x, padded.bottom());
         right = newPoint(padded.right(), left.y + this.delayHeight);
      }

      const rads = -Math.atan(-(right.y - left.y) / (right.x - left.x));

      graphics.translate(left.x, left.y);
      graphics.rotate(rads);

      const length = Math.sqrt(
         Math.pow(right.x - left.x, 2) + Math.pow(right.y - left.y, 2)
      );

      return length;
   };

   drawLine = (graphics: Graphics, length: number) => {
      const arrowWidth = this.style.arrowWidth;
      const arrowHeight = this.style.arrowHeight;

      graphics.strokeStyle('#000');
      graphics.lineWidth(this.style.lineWidth);

      graphics.save();

      if (this.props.line === 'dashed') {
         graphics.setLineDash([
            this.style.lineWidth * 5,
            this.style.lineWidth * 5,
         ]);
      } else if (this.props.line === 'dotted') {
         graphics.setLineDash([
            this.style.lineWidth * 2,
            this.style.lineWidth * 2,
         ]);
      }

      graphics.beginPath();
      graphics.moveTo(0, 0);
      graphics.lineTo(length, 0);
      graphics.stroke();

      graphics.restore();

      const leftArrow = () => {
         graphics.moveTo(arrowWidth, -arrowHeight);
         graphics.lineTo(0, 0);
         graphics.lineTo(arrowWidth, arrowHeight);
      };

      graphics.beginPath();

      switch (this.direction) {
         case 'ltr':
            graphics.moveTo(length - arrowWidth, -arrowHeight);
            graphics.lineTo(length, 0);
            graphics.lineTo(length - arrowWidth, arrowHeight);
            break;
         case 'rtl':
            leftArrow();
            break;
         case 'none':
            leftArrow();
            break;
      }

      if (this.props.arrow === 'filled') {
         graphics.closePath().fill();
      } else {
         graphics.stroke();
      }
   };

   drawLabel = (graphics: Graphics, length: number) => {
      const label = this.props.label;
      if (label) {
         const { family, size, weight, style } = this.style.font;
         graphics.setFont(family, size, weight, style);
         graphics.textAlign('center');

         const midpoint = length / 2;
         const height = this.style.padding.bottom;

         graphics.strokeStyle('#fff');
         graphics.strokeText(label, midpoint, -height);
         graphics.fillText(label, midpoint, -height);
      }
   };
}
