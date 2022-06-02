import {
   parseDiagram,
   ParsedDiagram,
   Extent,
   layout,
   render,
   defaultStyle,
} from '@siler/realize-sequence';
import { newCanvas } from './canvas';
import { fromHtmlCanvas } from './measurer';

export const draw = (
   code: string,
   canvas: HTMLCanvasElement,
   scale: number
) => {
   const graphics = newCanvas(canvas);

   const result = parseDiagram(code);
   if (result.type === 'failure') {
      return;
   }


   const measurer = fromHtmlCanvas(canvas);
   const style = defaultStyle();
   const diagram = layout(result.diagram, measurer, style);
   fitCanvasSize(canvas, diagram.size, scale);
   render(graphics, diagram, style, scale);
};

export const drawDiagram = (
   diagram: ParsedDiagram,
   canvas: HTMLCanvasElement,
   scale: number
) => {
   const graphics = newCanvas(canvas);
   const measurer = fromHtmlCanvas(canvas);
   const style = defaultStyle();
   const laidOutDiagram = layout(diagram, measurer, style);
   fitCanvasSize(canvas, laidOutDiagram.size, scale);
   render(graphics, laidOutDiagram, style, scale);
};

const fitCanvasSize = (
   canvas: HTMLCanvasElement,
   size: Extent,
   zoom: number
) => {
   canvas.width = size.width * zoom;
   canvas.height = size.height * zoom;
};
