import { Extent } from './layout';

export interface Style {
   readonly frame: FrameStyle;
   readonly title: TitleStyle;
   readonly lifeline: LifelineStyle;
   readonly signal: SignalStyle;
}

export interface TitleStyle {
   readonly padding: Padding;
   readonly font: Font;
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

export interface SignalStyle {
   readonly padding: Padding;
   readonly margin: Padding;
   readonly font: Font;
   readonly lineWidth: number;
   readonly arrow: Extent;
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

export interface Padding {
   readonly top: number;
   readonly right: number;
   readonly bottom: number;
   readonly left: number;
}

export const horizontal = (padding: Padding): number => {
   return padding.left + padding.right;
};

export const vertical = (padding: Padding): number => {
   return padding.top + padding.bottom;
};

export const padTbLr = (tb: number, lr: number): Padding => {
   return { top: tb, right: lr, bottom: tb, left: lr };
};

export const padAll = (padding: number): Padding => {
   return { top: padding, right: padding, bottom: padding, left: padding };
};

export const defaultStyle = (): Style => {
   return {
      frame: {
         padding: padAll(25),
      },
      title: {
         padding: padAll(25),
         font: newFont('Helvetica', 36),
      },
      lifeline: {
         padding: padAll(10),
         margin: padAll(10),
         font: newFont('Helvetica', 16),
         boxLineWidth: 1,
         lineWidth: 1,
      },
      signal: {
         padding: { top: 10, right: 30, bottom: 6, left: 30 },
         margin: padAll(0),
         font: newFont('Helvetica', 12),
         lineWidth: 1,
         arrow: {
            width: 15.0,
            height: 6.0,
         },
      },
   };
};
