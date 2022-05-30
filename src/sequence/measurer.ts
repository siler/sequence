import { newBrowserCanvas } from './graphics/browserCanvas';
import { Extent } from './layout';
import { Font } from './style';

export interface Measurer {
   ascentExtent(text: string, font: Font): Extent;
}

export const fromHtmlCanvas = (canvas: HTMLCanvasElement): Measurer => {
   const graphics = newBrowserCanvas(canvas);

   const metrics = (text: string, font: Font): TextMetrics => {
      graphics.save();
      graphics.setFont(font.family, font.size, font.weight, font.style);
      const result = graphics.measureText(text);
      graphics.restore();
      return result;
   };

   return {
      ascentExtent: (text: string, font: Font): Extent => {
         const m = metrics(text, font);
         return { width: m.width, height: m.actualBoundingBoxAscent };
      },
   };
};
