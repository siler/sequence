import { Graphics } from './graphics';
import { newBrowserCanvas } from './graphics/browserCanvas';
import { parseDiagram } from './language';
import { Extent, layout } from './layout';
import { render } from './render';

export const draw = (code: string, canvas: HTMLCanvasElement, scale: number) => {
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

    const diagram = layout(parsedDiagram, canvas);
    fitCanvasSize(canvas, diagram.size, scale);
    render(graphics, diagram, scale);
};

const fitCanvasSize = (canvas: HTMLCanvasElement, size: Extent, zoom: number) => {
    canvas.width = size.width * zoom;
    canvas.height = size.height * zoom;
};