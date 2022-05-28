import { Message, ParsedDiagram, Participant } from './language/parser';
import { Lifeline, Diagram, Signal, Direction } from './model';
import {
   LifelineStyle,
   SignalStyle as SignalStyle,
   Padding,
   Style,
   horizontal,
   vertical,
} from './style';
import { fromHtmlCanvas as newMeasurer, Measurer } from './measurer';

export interface Point {
   readonly x: number;
   readonly y: number;
}

export const distance = (a: Point, b: Point): number => {
   return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

export const inclinationAngle = (left: Point, right: Point): number => {
   return -Math.atan(-(right.y - left.y) / (right.x - left.x));
};

export interface Extent {
   readonly width: number;
   readonly height: number;
}

export const padExtent = (box: Extent, padding: Padding): Extent => {
   const width = box.width + horizontal(padding);
   const height = box.height + vertical(padding);

   return { width, height };
};

export interface Box extends Point, Extent {}

export const right = (val: { x: number; width: number }): number => {
   return val.x + val.width;
};

export const bottom = (val: { y: number; height: number }): number => {
   return val.y + val.height;
};

export const centerX = (val: { x: number; width: number }): number => {
   return (val.x * 2 + val.width) / 2;
};

// calculate a new box with the specified padding removed
export const depadBox = (box: Box, padding: Padding): Box => {
   const x = box.x + padding.left;
   const y = box.y + padding.top;

   const width = box.width - horizontal(padding);
   const height = box.height - vertical(padding);

   return { x, y, width, height };
};

export const layout = (
   parsed: ParsedDiagram,
   canvas: HTMLCanvasElement,
   style: Style
): Diagram => {
   const measurer = newMeasurer(canvas);
   const padding = style.frame.padding;
   const topLeft = { x: padding.left, y: padding.top };

   const lifelines = layoutLifelines(
      parsed.participants,
      style.lifeline,
      measurer,
      topLeft
   );

   const signals = layoutSignals(lifelines, parsed.messages, measurer, style);

   const lifelineHeight =
      signals
         .map((signal) => signal.box.height + signal.delayHeight)
         .reduce((val, curr) => val + curr) +
      style.lifeline.margin.bottom +
      style.signal.font.size;

   const size = computeSize(lifelines, lifelineHeight, style);

   return {
      lifelines,
      signals,
      lifelineHeight,
      size,
   };
};

interface Segment {
   name: string;
   width: number;
}

interface Span {
   left: number;
   right: number;
   direction: Direction;
   width: number;
}

interface Allotment {
   space: number | undefined;
   count: number;
}

/**
 * generates a list of lifelines laid out left to right in order.
 *
 * each lifeline box should have the same height, width will vary
 * by text length. they should start with consistent spacing between
 * them, though that will be modified later depending on message text
 * length among other things.
 */
const layoutLifelines = (
   participants: Participant[],
   style: LifelineStyle,
   measurer: Measurer,
   topLeft: Point
): Lifeline[] => {
   console.log(topLeft);
   let nextLeft = topLeft.x;

   const extents = participants.map((participant) =>
      measurer.ascentExtent(participant.name, style.font)
   );

   return participants.map((participant, idx) => {
      const x = nextLeft;
      const y = topLeft.y;
      const width = extents[idx].width;
      const height = style.font.size;
      const extent = padExtent(
         padExtent({ width, height }, style.padding),
         style.margin
      );
      const box = { x, y, ...extent };
      const lifeline = { name: participant.name, box };

      nextLeft = right(lifeline.box);

      return lifeline;
   });
};

const layoutSignals = (
   lifelines: Lifeline[],
   messages: Message[],
   measurer: Measurer,
   style: Style
): Signal[] => {
   if (lifelines.length === 0 || messages.length === 0) {
      return [];
   }

   const segments = generateSegments(lifelines);

   const spans = messages.map((message) =>
      updateSegmentsForMessage({
         segments,
         message,
         style: style.signal,
         measurer,
      })
   );

   widenLifelines(lifelines, segments);

   return createSignals(lifelines, messages, spans, style);
};

const generateSegments = (lifelines: Lifeline[]): Segment[] => {
   const segments = lifelines.map((lifeline, idx) => {
      let width = 0;

      if (idx < lifelines.length - 1) {
         const left = centerX(lifeline.box);
         const right = centerX(lifelines[idx + 1].box);
         width = right - left;
      }

      return { width, name: lifeline.name };
   });

   return segments;
};

interface updateSegmentForMessageProps {
   segments: Segment[];
   message: Message;
   style: SignalStyle;
   measurer: Measurer;
}

const updateSegmentsForMessage = ({
   segments,
   message,
   style,
   measurer,
}: updateSegmentForMessageProps): Span => {
   const span = messageSpan(segments, message);

   if (message.label) {
      const textWidth = measurer.ascentExtent(message.label, style.font).width;
      const signalWidth =
         textWidth + horizontal(style.padding) + horizontal(style.margin);

      if (signalWidth > span.width) {
         widen(segments, span, signalWidth);
      }
   }

   return span;
};

const nameIs = (str: string) => {
   return (lifeline: { name: string }) => lifeline.name === str;
};

const messageSpan = (segments: Segment[], message: Message): Span => {
   const idxA = segments.findIndex(nameIs(message.from));
   const idxB = segments.findIndex(nameIs(message.to));
   const calculateWidth = (segments: Segment[], from: number, to: number) =>
      segments
         .slice(from, to)
         .map((segment) => segment.width)
         .reduce((val, curr) => val + curr, 0);

   if (idxA < idxB) {
      return {
         left: idxA,
         right: idxB,
         direction: 'ltr',
         width: calculateWidth(segments, idxA, idxB),
      };
   } else if (idxA > idxB) {
      return {
         left: idxB,
         right: idxA,
         direction: 'rtl',
         width: calculateWidth(segments, idxB, idxA),
      };
   } else {
      return {
         left: idxA,
         right: idxB,
         direction: 'none',
         width: calculateWidth(segments, idxA, idxB),
      };
   }
};

const computeSize = (
   lifelines: Lifeline[],
   lifelineHeight: number,
   style: Style
): Extent => {
   const rightmost = lifelines.slice(-1)[0];
   if (rightmost) {
      return {
         width: horizontal(style.frame.padding) + right(rightmost.box),
         height:
            vertical(style.frame.padding) +
            bottom(rightmost.box) +
            lifelineHeight,
      };
   } else {
      return {
         width: horizontal(style.frame.padding),
         height: vertical(style.frame.padding),
      };
   }
};

const widen = (segments: Segment[], span: Span, width: number) => {
   let remaining = width - span.width;
   if (remaining <= 0) {
      return;
   }

   const slice = segments.slice(span.left, span.right);
   slice.sort((a, b) => a.width - b.width);

   while (remaining > 0) {
      const allotment = nextAllotment(slice);

      const take =
         allotment.space && remaining > allotment.space
            ? allotment.space
            : remaining;
      remaining -= take;

      allocate(slice, allotment, take);
   }
};

const nextAllotment = (segments: Segment[]): Allotment => {
   const first = segments[0].width;
   for (let count = 1; count < segments.length; count++) {
      if (segments[count].width > first) {
         return {
            space: first * count,
            count,
         };
      }
   }

   return {
      space: undefined,
      count: segments.length,
   };
};

const allocate = (
   segments: Segment[],
   allotment: { count: number },
   take: number
) => {
   const add = take / allotment.count;
   for (let i = 0; i < allotment.count; i++) {
      segments[i].width += add;
   }
};

const widenLifelines = (lifelines: Lifeline[], segments: Segment[]) => {
   if (lifelines.length <= 1) {
      return;
   }

   let lastCenter = centerX(lifelines[0].box);
   let added = 0;
   for (let idx = 0; idx < segments.length - 1; idx += 1) {
      const lifeline = lifelines[idx + 1];
      const center = centerX(lifeline.box);
      const width = center - lastCenter;
      const difference = segments[idx].width - width;

      added += difference;
      lastCenter = center;

      if (!added) {
         continue;
      }

      const x = lifeline.box.x + added;
      const y = lifeline.box.y;
      lifelines[idx + 1] = {
         ...lifeline,
         box: { ...lifeline.box, x, y },
      };
   }
};

const createSignals = (
   lifelines: Lifeline[],
   messages: Message[],
   spans: Span[],
   style: Style
): Signal[] => {
   const myStyle = style.signal;

   let y = lifelines
      .map((lifeline) => bottom(lifeline.box))
      .reduce((val, curr) => Math.max(val, curr));

   const signals: Signal[] = [];
   for (let idx = 0; idx < messages.length; idx += 1) {
      const message = messages[idx];
      const span = spans[idx];

      // adjust by (lifeline width / 2) + 1 so boxes line up adjacent
      const offset = style.lifeline.lineWidth / 2 + 1;
      const left = centerX(lifelines[span.left].box) + offset;
      const right = centerX(lifelines[span.right].box) - offset;
      const width = right - left;

      const height =
         (message.label ? myStyle.font.size : 0.0) +
         vertical(myStyle.padding) +
         vertical(myStyle.margin);

      const delayHeight = message.delay ? message.delay * 10 : 0;

      const box = { x: left, y: y, width, height };

      signals.push({
         box,
         delayHeight,
         direction: spans[idx].direction,
         props: message,
      });
      y += height + delayHeight;
   }

   return signals;
};
