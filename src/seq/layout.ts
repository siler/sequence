import { Message, ParsedDiagram, Participant } from './language/parser';
import { Lifeline, Diagram, Signal, Direction } from './model';
import {
   defaultStyle,
   LifelineStyle,
   MessageStyle,
   Padding,
   Style,
} from './style';
import { fromHtmlCanvas as newMeasurer, Measurer } from './measurer';

const LINE_SPACING = 1.5;

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
   style: MessageStyle
): Signal[] => {
   if (lifelines.length === 0 || messages.length === 0) {
      return [];
   }

   let height = lifelines.reduce(
      (max, curr) => (max > curr.bottom() ? max : curr.bottom()),
      0
   );

   const segments = lifelinesToSegments(lifelines);
   const signals = [];

   for (const message of messages) {
      const res = layoutMessage({
         lifelines,
         segments,
         message,
         height,
         style,
         measurer,
      });

      signals.push(res.signal);
      height += res.height;
   }

   adjustLifelines(lifelines, segments);
   lifelines.forEach((lifeline) => (lifeline.height = height));

   return signals;
};

interface Span {
   left: number;
   right: number;
   direction: Direction;
   leftX: number;
   width: number;
}

interface Segment {
   width: number;
   idx: number;
}

const nameIs = (str: string) => {
   return (lifeline: Lifeline) => lifeline.name === str;
};

const messageSpan = (lifelines: Lifeline[], message: Message): Span => {
   const from = lifelines.findIndex(nameIs(message.from));
   const to = lifelines.findIndex(nameIs(message.to));

   if (from < to) {
      const leftX = lifelines[from].centerX();
      return {
         left: from,
         right: to,
         direction: 'ltr',
         leftX,
         width: lifelines[to].centerX() - leftX,
      };
   } else if (from > to) {
      const leftX = lifelines[to].centerX();
      return {
         left: to,
         right: from,
         direction: 'rtl',
         leftX,
         width: lifelines[from].centerX() - leftX,
      };
   } else {
      return {
         left: from,
         right: to,
         direction: 'none',
         leftX: lifelines[from].centerX(),
         width: 0,
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

const lifelinesToSegments = (lifelines: Lifeline[]): Segment[] => {
   const segments = [];

   for (let idx = 0; idx < lifelines.length - 1; idx++) {
      const left = lifelines[idx].centerX();
      const right = lifelines[idx + 1].centerX();
      const width = right - left;
      segments.push({ width, idx });
   }

   console.log('initial segments:', JSON.stringify(segments));

   return segments;
};

interface layoutMessageProps {
   lifelines: Lifeline[];
   segments: Segment[];
   message: Message;
   height: number;
   style: MessageStyle;
   measurer: Measurer;
}

const layoutMessage = ({
   lifelines,
   segments,
   message,
   height,
   style,
   measurer,
}: layoutMessageProps) => {
   const span = messageSpan(lifelines, message);

   let extent = newExtent(
      span.width,
      style.margin.vertical() + style.padding.vertical()
   );

   if (message.label) {
      const labelWidth = style.margin.pad(
         style.padding.pad(measurer.ascentExtent(message.label, style.font))
      ).width;

      if (labelWidth > span.width) {
         widen(segments, span, labelWidth);
         extent = style.margin.pad(
            style.padding.pad(
               newExtent(labelWidth, style.font.size * LINE_SPACING)
            )
         );
      }
   }

   const box = new Box(newPoint(span.leftX, height), extent);
   const signal = new Signal(box, span.direction, style);

   return { signal, height: extent.height };
};

const widen = (segments: Segment[], span: Span, width: number) => {
   let remaining = width - span.width;
   if (remaining <= 0) {
      return;
   }
   console.log('widening span', JSON.stringify(span));

   const slice = segments.slice(span.left, span.right + 1);
   slice.sort((a, b) => a.width - b.width);
   console.log('sorted slice:', JSON.stringify(slice));

   while (remaining > 0) {
      const allotment = nextAllotment(slice);
      console.log('levelling allotted:', JSON.stringify(allotment));

      const take =
         allotment.space && remaining > allotment.space
            ? allotment.space
            : remaining;
      remaining -= take;

      allocate(slice, allotment, take);
   }

   console.log('allocated widths:', JSON.stringify(segments));
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

const adjustLifelines = (lifelines: Lifeline[], segments: Segment[]) => {
   if (lifelines.length <= 1) {
      return;
   }

   let lastCenter = lifelines[0].centerX();
   let added = 0;
   for (let idx = 0; idx < segments.length; idx += 1) {
      const lifeline = lifelines[idx + 1];
      const center = lifeline.centerX();
      const width = center - lastCenter;
      const difference = segments[idx].width - width;

      added += difference;
      lastCenter = center;

      if (!added) {
         continue;
      }
      console.log('diff in', lifeline);

      const pos = lifeline.box.position;
      console.log('int pos', JSON.stringify(pos));
      lifeline.box.position = {
         x: pos.x + added,
         y: pos.y,
      };
      console.log('new pos', JSON.stringify(lifeline.box.position));
   }
};
