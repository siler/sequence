import { newBrowserCanvas } from './graphics/browserCanvas';
import { parseDiagram, ParsedDiagram } from './language/parser';
import { Extent, layout } from './layout';
import { render } from './render';
import { defaultStyle } from './style';

export const draw = (
   code: string,
   canvas: HTMLCanvasElement,
   scale: number
) => {
   const graphics = newBrowserCanvas(canvas);

   const result = parseDiagram(code);
   if (result.type === 'failure') {
      return;
   }

   const style = defaultStyle();
   const diagram = layout(result.diagram, canvas, style);
   fitCanvasSize(canvas, diagram.size, scale);
   render(graphics, diagram, style, scale);
};

export const drawDiagram = (
   diagram: ParsedDiagram,
   canvas: HTMLCanvasElement,
   scale: number
) => {
   const graphics = newBrowserCanvas(canvas);
   const style = defaultStyle();
   const laidOutDiagram = layout(diagram, canvas, style);
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
