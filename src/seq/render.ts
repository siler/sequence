import { Graphics } from './graphics';
import { Diagram } from './model';

export const render = (graphics: Graphics, diagram: Diagram, scale?: number) => {
    graphics.clear();
    graphics.save();

    graphics.lineCap('round');
    graphics.lineJoin('round');

    if (scale) {
        graphics.scale(scale, scale);
    }

    for (const lifeline of diagram.lifelines) {
        lifeline.draw(graphics);
    }

    for (const signal of diagram.signals) {
        signal.draw(graphics);
    }

    graphics.restore();
};