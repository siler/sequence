import { Message, ParsedDiagram, Participant } from './language/parser';
import { Lifeline, Diagram, Signal, Direction } from './model';
import {
   defaultStyle,
   LifelineStyle,
   MessageStyle as SignalStyle,
   Padding,
   Style,
} from './style';
import { fromHtmlCanvas as newMeasurer, Measurer } from './measurer';

export interface Point {
   readonly x: number;
   readonly y: number;
}

export const newPoint = (x: number, y: number): Point => ({ x, y });

export interface Extent {
   readonly width: number;
   readonly height: number;
}

export const newExtent = (width: number, height: number): Extent => ({
   width,
   height,
});

export class Box {
   constructor(public position: Point, public extent: Extent) {}

   // right X position of the box
   right = (): number => {
      return this.position.x + this.extent.width;
   };

   // bottom Y position of the lifeline box
   bottom = (): number => {
      return this.position.y + this.extent.height;
   };

   // bottom right point of the lifeline box
   bottomRight = (): Point => {
      return newPoint(this.right(), this.bottom());
   };

   centerX = (): number => {
      return (this.position.x * 2 + this.extent.width) / 2;
   };

   // calculate a new box with the specified padding removed
   depad = (padding: Padding) => {
      const point = newPoint(
         this.position.x + padding.left,
         this.position.y + padding.top
      );

      const extent = newExtent(
         this.extent.width - padding.horizontal(),
         this.extent.height - padding.vertical()
      );

      return new Box(point, extent);
   };
}

export const layout = (
   parsed: ParsedDiagram,
   canvas: HTMLCanvasElement,
   style: Style = defaultStyle()
): Diagram => {
   const measurer = newMeasurer(canvas);
   const topLeft = newPoint(style.frame.padding.left, style.frame.padding.top);

   const lifelines = layoutLifelines(
      style.lifeline,
      parsed.participants,
      measurer,
      topLeft
   );

   const signals = layoutMessages(
      lifelines,
      parsed.messages,
      measurer,
      style.message
   );

   const size = computeSize(lifelines, style);

   return {
      lifelines,
      signals,
      size,
   };
};

/**
 * generates a list of lifelines laid out left to right in order.
 *
 * each lifeline box should have the same height, width will vary
 * by text length. they should start with consistent spacing between
 * them, though that will be modified later depending on message text
 * length among other things.
 */
const layoutLifelines = (
   style: LifelineStyle,
   participants: Participant[],
   measurer: Measurer,
   topLeft: Point
): Lifeline[] => {
   let lastRightExtent = topLeft.x;

   return participants.map((p) => {
      const position = newPoint(lastRightExtent, topLeft.y);
      const width = measurer.ascentExtent(p.name, style.font).width;
      const extent = style.margin.pad(
         style.padding.pad(newExtent(width, style.font.size))
      );
      const box = new Box(position, extent);
      const lifeline = new Lifeline(p.name, box, style);

      lastRightExtent = lifeline.box.right();

      return lifeline;
   });
};

const layoutMessages = (
   lifelines: Lifeline[],
   messages: Message[],
   measurer: Measurer,
   style: SignalStyle
): Signal[] => {
   if (lifelines.length === 0 || messages.length === 0) {
      return [];
   }

   const segments = generateSegments(lifelines);
   const spans = [];
   for (const message of messages) {
      const span = updateSegmentsForMessage({
         segments,
         message,
         style,
         measurer,
      });

      spans.push(span);
   }

   widenLifelines(lifelines, segments);
   const signals = createSignals(lifelines, messages, spans, style);

   const height = signals
      .map((signal) => signal.box.extent.height)
      .reduce((val, curr) => val + curr, 20);
   lifelines.forEach((lifeline) => (lifeline.height = height));

   return signals;
};

interface Segment {
   name: string;
   width: number;
}

const generateSegments = (lifelines: Lifeline[]): Segment[] => {
   const segments = [];

   for (let idx = 0; idx < lifelines.length; idx++) {
      let width = 0;

      if (idx !== lifelines.length - 1) {
         const left = lifelines[idx].centerX();
         const right = lifelines[idx + 1].centerX();
         width = right - left;
      }

      segments.push({ width, name: lifelines[idx].name });
   }

   return segments;
};

interface layoutMessageProps {
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
}: layoutMessageProps): Span => {
   const span = messageSpan(segments, message);

   if (message.label) {
      const fontHeight = style.font.size;
      const labelExtent = measurer.ascentExtent(message.label, style.font);
      const signalExtent = style.margin.pad(
         style.padding.pad(newExtent(labelExtent.width, fontHeight))
      );

      if (signalExtent.width > span.width) {
         widen(segments, span, signalExtent.width);
      }
   }

   return span;
};

interface Span {
   left: number;
   right: number;
   direction: Direction;
   width: number;
}

interface named {
   name: string;
}

const nameIs = (str: string) => {
   return (lifeline: named) => lifeline.name === str;
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

const computeSize = (lifelines: Lifeline[], style: Style): Extent => {
   const rightmost = lifelines.slice(-1)[0];
   if (rightmost) {
      return newExtent(
         style.frame.padding.horizontal() + rightmost.box.right(),
         style.frame.padding.vertical() +
            rightmost.box.bottom() +
            rightmost.height
      );
   } else {
      return newExtent(
         style.frame.padding.horizontal(),
         style.frame.padding.vertical()
      );
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

const nextAllotment = (segments: Segment[]) => {
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
      space: null,
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

   let lastCenter = lifelines[0].centerX();
   let added = 0;
   for (let idx = 0; idx < segments.length - 1; idx += 1) {
      const lifeline = lifelines[idx + 1];
      const center = lifeline.centerX();
      const width = center - lastCenter;
      const difference = segments[idx].width - width;

      added += difference;
      lastCenter = center;

      if (!added) {
         continue;
      }

      const pos = lifeline.box.position;
      lifeline.box.position = {
         x: pos.x + added,
         y: pos.y,
      };
   }
};

const createSignals = (
   lifelines: Lifeline[],
   messages: Message[],
   spans: Span[],
   style: SignalStyle
): Signal[] => {
   let y = lifelines.reduce(
      (max, curr) => (max > curr.bottom() ? max : curr.bottom()),
      0
   );

   const signals = [];
   for (let idx = 0; idx < messages.length; idx += 1) {
      const message = messages[idx];
      const span = spans[idx];

      // mod by one so the box is adjacent to the lifespan lines, not overlapping
      const left = lifelines[span.left].centerX() + 1;
      const right = lifelines[span.right].centerX() - 1;
      const width = right - left;

      const height =
         style.font.size * 1.5 +
         style.padding.vertical() +
         style.margin.vertical();

      const box = new Box(newPoint(left, y), newExtent(width, height));

      const signal = new Signal(
         box,
         spans[idx].direction,
         style,
         message.filled,
         message.dashed,
         message.label
      );
      signals.push(signal);
      y += height;
   }

   return signals;
};
