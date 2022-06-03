import {
   parseDiagram,
   layout,
   render,
   defaultStyle,
   Extent,
} from '@sriler/sequence';
import { newGraphics } from './graphics';
import { Canvas } from 'canvas';

export const draw = (code: string, canvas: Canvas, scale: number) => {
   const graphics = newGraphics(canvas);

   const result = parseDiagram(code);
   if (result.type === 'failure') {
      return;
   }

   const measurer = graphics.measurer();
   const style = defaultStyle();
   const diagram = layout(result.diagram, measurer, style);
   fitCanvasSize(canvas, diagram.size, scale);
   render(graphics, diagram, style, scale);
};

const fitCanvasSize = (canvas: Canvas, size: Extent, zoom: number) => {
   canvas.width = size.width * zoom;
   canvas.height = size.height * zoom;
};
