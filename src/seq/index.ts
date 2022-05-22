import { Graphics } from './graphics';
import { parseDiagram } from './language';
import { layout } from './layout';
import { render } from './render';

export function parseAndRender(code: string, graphics: Graphics, canvas: HTMLCanvasElement, scale: number) {
    const parsedDiagram = parseDiagram(code);
    if (!parsedDiagram) {
        return;
    }

    const diagram = layout(parsedDiagram, canvas);
    render(graphics, diagram, scale);
}