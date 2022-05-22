import { Extent } from './layout';

export interface Measurer {
    metrics(text: string): TextMetrics;
    ascentExtent(text: string): Extent;
}

export function fromHtmlCanvas(canvas: HTMLCanvasElement): Measurer {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = canvas.getContext('2d')!;

    const metrics = (text: string): TextMetrics => {
        return ctx.measureText(text);
    };

    return {
        metrics,

        ascentExtent: (text: string): Extent => {
            const m = metrics(text);
            return new Extent(m.width, m.actualBoundingBoxAscent);
        }
    };
}