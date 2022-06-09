import { Graphics } from './graphics';
import {
   bottom,
   centerX,
   depadBox,
   distance,
   Extent,
   inclinationAngle,
   Point,
   right,
} from './layout';
import { Diagram, Lifeline, Signal } from './model';
import { LifelineStyle, SignalStyle, Style } from './style';

export const render = (
   graphics: Graphics,
   diagram: Diagram,
   style: Style,
   scale?: number
) => {
   graphics.clear();
   graphics.save();

   graphics.lineCap('round');
   graphics.lineJoin('round');

   if (scale) {
      graphics.scale(scale, scale);
   }

   withState(graphics, () => {
      graphics.fillStyle('#fff');
      graphics.rect(0, 0, diagram.size.width, diagram.size.height).fill();
   });

   if (diagram.title) {
      drawTitle(graphics, style, diagram.title, diagram.size.width);
   }

   for (const lifeline of diagram.lifelines) {
      drawLifeline(lifeline, diagram.lifelineHeight, graphics, style.lifeline);
   }

   for (const signal of diagram.signals) {
      drawSignal(signal, graphics, style.signal);
   }

   graphics.restore();
};

const drawTitle = (
   graphics: Graphics,
   style: Style,
   text: string,
   width: number
): void => {
   withState(graphics, () => {
      const { family, size, weight, style: ztyle } = style.title.font;
      graphics.setFont(family, size, weight, ztyle);
      graphics.textAlign('center');
      graphics.fillStyle('#000');

      const x = width / 2;
      const y =
         style.frame.padding.top +
         style.title.padding.top +
         style.title.font.size;

      graphics.fillText(text, x, y);
   });
};

const drawLifeline = (
   lifeline: Lifeline,
   height: number,
   graphics: Graphics,
   style: LifelineStyle
): void => {
   const rect = depadBox(lifeline.box, style.margin);

   withState(graphics, () => {
      graphics.lineWidth(style.boxLineWidth);

      graphics.rect(rect.x, rect.y, rect.width, rect.height).stroke();
   });

   withState(graphics, () => {
      const text = depadBox(rect, style.padding);
      const font = style.font;

      graphics.setFont(font.family, font.size, font.weight, font.style);

      graphics.fillText(lifeline.name, text.x, bottom(text));
   });

   withState(graphics, () => {
      const x = centerX(lifeline.box);
      const boxBottom = bottom(rect);
      graphics.lineWidth(style.lineWidth);
      graphics.beginPath();
      graphics.moveTo(x, boxBottom + 1);
      graphics.lineTo(x, boxBottom + height).stroke();
   });
};

const drawSignal = (
   signal: Signal,
   graphics: Graphics,
   style: SignalStyle
): void => {
   withState(graphics, () => {
      const length = applySignalTransform(signal, graphics, style);
      drawSignalLine(graphics, signal, length, style);
      drawSignalLabel(graphics, signal, length, style);
   });
};

const applySignalTransform = (
   signal: Signal,
   graphics: Graphics,
   style: SignalStyle
): number => {
   const padded = depadBox(signal.box, style.margin);

   let a;
   let b;
   if (signal.direction === 'rtl') {
      a = { x: padded.x, y: bottom(padded) + signal.delayHeight };
      b = { x: right(padded), y: bottom(padded) };
   } else {
      a = { x: padded.x, y: bottom(padded) };
      b = {
         x: right(padded),
         y: bottom(padded) + signal.delayHeight,
      };
   }

   graphics.translate(a.x, a.y);

   if (signal.direction === 'none') {
      return style.font.size * 2;
   } else {
      graphics.rotate(inclinationAngle(a, b));

      return distance(a, b);
   }
};

const drawSignalLine = (
   graphics: Graphics,
   signal: Signal,
   length: number,
   style: SignalStyle
): void => {
   withState(graphics, () => {
      graphics.strokeStyle('#000');
      graphics.lineWidth(style.lineWidth);

      withState(graphics, () => {
         if (signal.props.line === 'dashed') {
            graphics.setLineDash([style.lineWidth * 5, style.lineWidth * 5]);
         } else if (signal.props.line === 'dotted') {
            graphics.setLineDash([style.lineWidth * 2, style.lineWidth * 2]);
         }

         if (signal.direction === 'none') {
            const padded = depadBox(signal.box, style.margin);
            const radius = 5;
            const startY = 0 - padded.height / 2;
            graphics.beginPath();
            graphics.moveTo(0, startY);
            graphics.lineTo(length - radius, startY);
            graphics.arcTo(length, startY, length, startY + radius, 5);
            graphics.lineTo(length, signal.delayHeight - radius);
            graphics.arcTo(
               length,
               signal.delayHeight,
               length - radius,
               signal.delayHeight,
               5
            );
            graphics.lineTo(0, signal.delayHeight).stroke();
         } else {
            graphics.beginPath();
            graphics.moveTo(0, 0);
            graphics.lineTo(length, 0);
            graphics.stroke();
         }
      });

      switch (signal.direction) {
         case 'ltr':
            drawArrow(
               graphics,
               style.arrow,
               false,
               signal.props.head === 'filled',
               { x: length, y: 0 }
            );
            break;
         case 'rtl':
            drawArrow(
               graphics,
               style.arrow,
               true,
               signal.props.head === 'filled'
            );
            break;
         case 'none':
            drawArrow(
               graphics,
               style.arrow,
               true,
               signal.props.head === 'filled',
               { x: 0, y: signal.delayHeight }
            );
            break;
      }
   });
};

const drawSignalLabel = (
   graphics: Graphics,
   signal: Signal,
   length: number,
   style: SignalStyle
) => {
   const label = signal.props.label;

   if (label) {
      withState(graphics, () => {
         const { family, size, weight, style: fontStyle } = style.font;
         graphics.setFont(family, size, weight, fontStyle);

         graphics.lineWidth(4);
         graphics.strokeStyle('#fff');

         if (signal.direction === 'none') {
            graphics.textAlign('left');

            // normal spacing and a little extra depending on font size
            const x =
               style.margin.left + style.padding.left + style.font.size / 2;

            // midpoint of the span, offset one pixel from the base line
            const y = signal.delayHeight / 2 - 1;

            graphics.strokeText(label, x, y);
            graphics.fillText(label, x, y);
         } else {
            graphics.textAlign('center');

            const midpoint = length / 2;
            const height = style.padding.bottom;

            graphics.strokeText(label, midpoint, -height);
            graphics.fillText(label, midpoint, -height);
         }
      });
   }
};

const withState = (graphics: Graphics, f: () => void): void => {
   graphics.save();

   f();

   graphics.restore();
};

const drawArrow = (
   graphics: Graphics,
   arrow: Extent,
   facingLeft: boolean,
   fill: boolean,
   point: Point = { x: 0, y: 0 }
) => {
   graphics.beginPath();

   if (facingLeft) {
      graphics.moveTo(point.x + arrow.width, point.y - arrow.height);
      graphics.lineTo(point.x, point.y);
      graphics.lineTo(point.x + arrow.width, point.y + arrow.height);
   } else {
      graphics.moveTo(point.x - arrow.width, point.y - arrow.height);
      graphics.lineTo(point.x, point.y);
      graphics.lineTo(point.x - arrow.width, point.y + arrow.height);
   }

   if (fill) {
      graphics.closePath().fill();
   } else {
      graphics.stroke();
   }
};
