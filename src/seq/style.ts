import { Extent, newExtent } from './layout';

export interface Style {
   readonly frame: FrameStyle;
   readonly lifeline: LifelineStyle;
   readonly signal: MessageStyle;
}

export interface FrameStyle {
   readonly padding: Padding;
}

export interface LifelineStyle {
   readonly padding: Padding;
   readonly margin: Padding;
   readonly font: Font;
   readonly boxLineWidth: number;
   readonly lineWidth: number;
}

export interface MessageStyle {
   readonly padding: Padding;
   readonly margin: Padding;
   readonly font: Font;
   readonly lineWidth: number;
   readonly arrowWidth: number;
   readonly arrowHeight: number;
}

export type FontWeight = 'normal' | 'bold';
export type FontStyle = 'normal' | 'italic';

export interface Font {
   readonly family: string;
   readonly size: number;
   readonly style: FontStyle;
   readonly weight: FontWeight;
}

export const newFont = (
   family: string,
   size: number,
   style: FontStyle = 'normal',
   weight: FontWeight = 'normal'
): Font => ({ family, size, style, weight });

export class Padding {
   constructor(
      public top: number,
      public right: number,
      public bottom: number,
      public left: number
   ) {}

   horizontal = (): number => {
      return this.left + this.right;
   };

   vertical = (): number => {
      return this.top + this.bottom;
   };

   pad = (extent: Extent): Extent => {
      return newExtent(
         extent.width + this.horizontal(),
         extent.height + this.vertical()
      );
   };
}

export const newPadTbLr = (tb: number, lr: number): Padding => {
   return new Padding(tb, lr, tb, lr);
};

export const newPadAll = (padding: number): Padding => {
   return new Padding(padding, padding, padding, padding);
};

export const defaultStyle = (): Style => {
   return {
      frame: {
         padding: newPadAll(10),
      },
      lifeline: {
         padding: newPadAll(10),
         margin: newPadAll(10),
         font: newFont('Helvetica', 16),
         boxLineWidth: 1,
         lineWidth: 1,
      },
      signal: {
         padding: new Padding(10, 30, 6, 30),
         margin: newPadAll(0),
         font: newFont('Helvetica', 12),
         lineWidth: 1,
         arrowWidth: 15.0,
         arrowHeight: 6.0,
      },
   };
};
