import {
   ParsedDiagram,
   Extent,
   layout,
   render,
   defaultStyle,
} from '@sriler/sequence';
import { newCanvas } from './canvas';

export const draw = (
   diagram: ParsedDiagram,
   canvas: HTMLCanvasElement,
   scale: number
) => {
   const graphics = newCanvas(canvas);
   const measurer = graphics.measurer();
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
