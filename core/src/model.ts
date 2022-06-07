import { Box, Extent } from './layout';
import { MessageProperties } from './parser';

export type Direction = 'ltr' | 'rtl' | 'none';

export interface Diagram {
   readonly title?: string;
   readonly lifelines: Lifeline[];
   readonly signals: Signal[];
   readonly lifelineHeight: number;
   readonly centerRight: number;
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
