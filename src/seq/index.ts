import { Graphics } from './graphics';
import { newBrowserCanvas } from './graphics/browserCanvas';
import { parseDiagram } from './language/parser';
import { Extent, layout } from './layout';
import { render } from './render';
import { defaultStyle } from './style';

export const draw = (
   code: string,
   canvas: HTMLCanvasElement,
   scale: number
) => {
   parseAndRender(code, newBrowserCanvas(canvas), canvas, scale);
};

const parseAndRender = (
   code: string,
   graphics: Graphics,
   canvas: HTMLCanvasElement,
   scale: number
) => {
   const parsedDiagram = parseDiagram(code);
   if (!parsedDiagram) {
      return;
   }

   const style = defaultStyle();
   const diagram = layout(parsedDiagram, canvas, style);
   fitCanvasSize(canvas, diagram.size, scale);
   render(graphics, diagram, style, scale);
};

const fitCanvasSize = (
   canvas: HTMLCanvasElement,
   size: Extent,
   zoom: number
) => {
   canvas.width = size.width * zoom;
   canvas.height = size.height * zoom;
};
