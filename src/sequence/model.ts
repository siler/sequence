import { MessageProperties } from './language/parser';
import { Box, Extent } from './layout';

export type Direction = 'ltr' | 'rtl' | 'none';

export interface Diagram {
   readonly title?: string,
   readonly lifelines: Lifeline[];
   readonly signals: Signal[];
   readonly lifelineHeight: number;
   readonly size: Extent;
}

export interface Lifeline {
   readonly box: Box;
   readonly name: string;
}

export interface Signal {
   readonly box: Box;
   readonly delayHeight: number;
   readonly direction: Direction;
   readonly props: MessageProperties;
}
