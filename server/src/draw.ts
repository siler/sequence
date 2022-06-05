import {
   defaultStyle,
   Extent,
   layout,
   parseDiagram,
   render,
} from '@sriler/sequence-core';
import { Canvas } from 'canvas';
import { HttpError } from 'http-errors';
import { newError, newSuccess, Result } from './error';
import { newGraphics } from './graphics';
import createError = require('http-errors');

const SCALE = 1.0;

export const drawBuffer = (code: string): Result<Buffer, HttpError> => {
   const result = drawToCanvas(code);
   if (result.type === 'success') {
      return newSuccess(result.value.toBuffer());
   }
   return result;
};

export const drawUrl = (code: string) => {
   const result = drawToCanvas(code);
   if (result.type === 'success') {
      return newSuccess(result.value.toDataURL());
   }
   return result;
};

const drawToCanvas = (code: string): Result<Canvas, HttpError> => {
   const canvas = new Canvas(0, 0, 'image');
   const graphics = newGraphics(canvas);

   const result = parseDiagram(code);
   if (result.type === 'failure') {
      return newError(
         createError(500, 'drawing to canvas: ' + result.reason.description)
      );
   }

   const measurer = graphics.measurer();
   const style = defaultStyle();
   const diagram = layout(result.diagram, measurer, style);
   fitCanvasSize(canvas, diagram.size);
   render(graphics, diagram, style, SCALE);

   return newSuccess(canvas);
};

const fitCanvasSize = (canvas: Canvas, size: Extent) => {
   canvas.width = size.width;
   canvas.height = size.height;
};
