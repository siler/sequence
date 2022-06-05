import {
   Extent,
   Font,
   FontStyle,
   FontWeight,
   Graphics,
   Point,
} from '@sriler/sequence';

export const newGraphics = (canvas: HTMLCanvasElement): Graphics => {
   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
   const ctx = canvas.getContext('2d')!;
   const twopi = 2 * 3.1416;

   const chainable = {
      stroke: () => {
         ctx.stroke();
         return chainable;
      },

      fill: () => {
         ctx.fill();
         return chainable;
      },

      fillAndStroke: () => {
         ctx.fill();
         ctx.stroke();
         return chainable;
      },
   };

   const tracePath = (path: Point[], inOffset?: Point, inScale?: number) => {
      const scale = inScale || 1;
      const offset = inOffset || { x: 0, y: 0 };

      ctx.beginPath();
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);
      ctx.moveTo(path[0].x, path[0].y);

      for (let i = 1; i < path.length; i++) {
         ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.restore();

      return chainable;
   };

   const setFont = (
      family: string,
      sizePt: number,
      weight: FontWeight,
      style: FontStyle
   ) => {
      ctx.font = `${weight} ${style} ${sizePt}pt ${family}, Helvetica, sans-serif`;
   };

   const textExtent = (text: string) => {
      const { width, actualBoundingBoxAscent: height } = ctx.measureText(text);
      return { width, height };
   };

   return {
      arc: (x, y, radius, start, stop) => {
         ctx.beginPath();
         ctx.moveTo(x, y);
         ctx.arc(x, y, radius, start, stop);
         return chainable;
      },

      arcTo: (x1, y1, x2, y2, radius) => {
         return ctx.arcTo(x1, y1, x2, y2, radius);
      },

      beginPath: () => {
         ctx.beginPath();
         return chainable;
      },

      circle: (center, radius) => {
         ctx.beginPath();
         ctx.arc(center.x, center.y, radius, 0, twopi);
         return chainable;
      },

      circuit: (path, offset, scale) => {
         tracePath(path, offset, scale);
         ctx.closePath();

         return chainable;
      },

      clear: () => {
         ctx.clearRect(0, 0, canvas.width, canvas.height);
      },

      closePath: () => {
         ctx.closePath();

         return chainable;
      },

      ellipse: (center, width, height, start, stop) => {
         const eStart = start || 0;
         const eStop = stop || twopi;

         ctx.beginPath();
         ctx.save();
         ctx.translate(center.x, center.y);
         ctx.scale(1, height / width);
         ctx.arc(0, 0, width / 2, eStart, eStop);
         ctx.restore();

         return chainable;
      },

      fill: () => {
         ctx.fill();
      },

      fillStyle: (fill) => {
         ctx.fillStyle = fill;
      },

      fillText: (text, x, y) => {
         ctx.fillText(text, x, y);
         return chainable;
      },

      height: () => {
         return canvas.height;
      },

      lineCap: (cap) => {
         ctx.lineCap = cap;
      },

      lineJoin: (join) => {
         ctx.lineJoin = join;
      },

      lineTo: (x, y) => {
         ctx.lineTo(x, y);
         return chainable;
      },

      lineWidth: (width) => {
         ctx.lineWidth = width;
      },

      measurer: () => {
         return {
            measure: (text: string, font: Font): Extent => {
               ctx.save();
               setFont(font.family, font.size, font.weight, font.style);
               const extent = textExtent(text);
               ctx.restore();
               return extent;
            },
         };
      },

      measureText: (text) => textExtent(text),

      moveTo: (x, y) => {
         ctx.moveTo(x, y);
      },

      path: tracePath,

      rect: (x, y, width, height) => {
         ctx.beginPath();
         ctx.moveTo(x, y);
         ctx.lineTo(x + width, y);
         ctx.lineTo(x + width, y + height);
         ctx.lineTo(x, y + height);
         ctx.closePath();

         return chainable;
      },

      restore: () => {
         ctx.restore();
      },

      roundRect: (
         x: number,
         y: number,
         width: number,
         height: number,
         radius: number
      ) => {
         ctx.beginPath();
         ctx.moveTo(x + radius, y);
         ctx.arcTo(x + width, y, x + width, y + radius, radius);
         ctx.lineTo(x + width, y + height - radius);
         ctx.arcTo(
            x + width,
            y + height,
            x + width - radius,
            y + height,
            radius
         );
         ctx.lineTo(x + radius, y + height);
         ctx.arcTo(x, y + height, x, y + height - radius, radius);
         ctx.lineTo(x, y + radius);
         ctx.arcTo(x, y, x + radius, y, radius);
         ctx.closePath();

         return chainable;
      },

      rotate: (angle: number) => {
         ctx.rotate(angle);
      },

      save: () => {
         ctx.save();
      },

      scale: (x, y) => {
         ctx.scale(x, y);
      },

      // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
      setData: (_name: string, _value: string) => {},

      setFont: setFont,

      setLineDash: (segments: number[]) => {
         ctx.setLineDash(segments);
      },

      stroke: () => {
         ctx.stroke();
      },

      strokeStyle: (stroke) => {
         ctx.strokeStyle = stroke;
      },

      strokeText: (text, x, y) => {
         ctx.strokeText(text, x, y);
      },

      textAlign: (align) => {
         ctx.textAlign = align as CanvasTextAlign;
      },

      translate: (x, y) => {
         ctx.translate(x, y);
      },

      width: () => {
         return canvas.width;
      },
   };
};
