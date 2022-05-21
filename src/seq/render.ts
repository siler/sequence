import { Graphics } from "./graphics";
import { Diagram } from "./model";

export const render = (graphics: Graphics, diagram: Diagram) => {
    for (const lifeline of diagram.lifelines) {
        lifeline.draw(graphics);
    }
}