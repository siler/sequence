import { Extent, newExtent } from './layout';
import { Font, FontStyle, FontWeight } from './style';

export interface Measurer {
    ascentExtent(text: string, font: Font): Extent;
}

export const fromHtmlCanvas = (canvas: HTMLCanvasElement): Measurer => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = canvas.getContext('2d')!;

    const setFont = (family: string, size: number, weight: FontWeight, style: FontStyle) => {
        ctx.font = `${weight} ${style} ${size}pt ${family}, Helvetica, sans-serif`;
    };

    const metrics = (text: string, font: Font): TextMetrics => {
        ctx.save();
        setFont(font.family, font.size, font.weight, font.style);
        const result = ctx.measureText(text);
        ctx.restore();
        return result;
    };

    return {
        ascentExtent: (text: string, font: Font): Extent => {
            const m = metrics(text, font);
            return newExtent(m.width, m.actualBoundingBoxAscent);
        },
    };
};