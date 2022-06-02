import { newCanvas } from './canvas';
import { Extent, Font, Measurer } from '@siler/realize-sequence';

export const fromHtmlCanvas = (canvas: HTMLCanvasElement): Measurer => {
   const graphics = newCanvas(canvas);

   return {
      measure: (text: string, font: Font): Extent => {
         graphics.save();
         graphics.setFont(font.family, font.size, font.weight, font.style);
         const result = graphics.measureText(text);
         graphics.restore();
         return result;
      },
   };
};
