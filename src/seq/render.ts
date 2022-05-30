import { Graphics } from './graphics';
import {
   bottom,
   right,
   centerX,
   depadBox,
   distance,
   inclinationAngle as angleFromXAxis,
   Point,
} from './layout';
import { Diagram, Lifeline, Signal } from './model';
import { LifelineStyle, SignalStyle, Style, vertical } from './style';

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

   const lifeline = diagram.lifelines.slice(-1)[0];
   let bottomRight: Point;
   if (!lifeline) {
      bottomRight = { x: 0, y: 0 };
   } else {
      bottomRight = {
         x:
            right(diagram.lifelines.slice(-1)[0].box) +
            style.frame.padding.right,
         y:
            lifeline.box.height +
            diagram.lifelineHeight +
            vertical(style.frame.padding),
      };
   }

   withState(graphics, () => {
      graphics.fillStyle('#fff');
      graphics.rect(0, 0, bottomRight.x, bottomRight.y).fill();
   });

   for (const lifeline of diagram.lifelines) {
      drawLifeline(lifeline, diagram.lifelineHeight, graphics, style.lifeline);
   }

   for (const signal of diagram.signals) {
      drawSignal(signal, graphics, style.signal);
   }

   graphics.restore();
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
   graphics.rotate(angleFromXAxis(a, b));

   return distance(a, b);
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

         graphics.beginPath();
         graphics.moveTo(0, 0);
         graphics.lineTo(length, 0);
         graphics.stroke();
      });

      const arrowWidth = style.arrowWidth;
      const arrowHeight = style.arrowHeight;

      const leftArrow = () => {
         graphics.moveTo(arrowWidth, -arrowHeight);
         graphics.lineTo(0, 0);
         graphics.lineTo(arrowWidth, arrowHeight);
      };

      graphics.beginPath();

      switch (signal.direction) {
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

      if (signal.props.arrow === 'filled') {
         graphics.closePath().fill();
      } else {
         graphics.stroke();
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
         graphics.textAlign('center');

         const midpoint = length / 2;
         const height = style.padding.bottom;

         graphics.lineWidth(4);
         graphics.strokeStyle('#fff');
         graphics.strokeText(label, midpoint, -height);
         graphics.fillText(label, midpoint, -height);
      });
   }
};

const withState = (graphics: Graphics, f: () => void): void => {
   graphics.save();

   f();

   graphics.restore();
};
