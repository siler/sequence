import { HttpError } from 'http-errors';
import createError = require('http-errors');
import { short } from '@tradle/urlsafe-base64';
import { decompress, strFromU8 } from 'fflate';
import { Canvas } from 'canvas';
import { draw } from './draw';

export type Result<V, E> = Success<V> | Error<E>;

export interface Success<V> {
   type: 'success';
   value: V;
}

const newSuccess = <T>(value: T): Success<T> => {
   return { type: 'success', value };
};

export interface Error<E> {
   type: 'error';
   error: E;
}

const newError = <T>(message: T): Error<T> => {
   return { type: 'error', error: message };
};

const fail = (code: number, message: string): Error<HttpError> => {
   return newError(createError(code, message));
};

export const process = async (
   diagram: string
): Promise<Result<Buffer, HttpError>> => {
   const decodeRes = await decode(diagram);
   if (decodeRes.type === 'error') {
      return fail(400, `invalid input: ${decodeRes.error}`);
   }
   const code = decodeRes.value;

   const canvas = new Canvas(0, 0, 'image');
   draw(code, canvas, 1.0);

   const buffer = canvas.toBuffer('image/png', { compressionLevel: 9 });

   return newSuccess(buffer);
};

export const decode = async (
   urlCode: string
): Promise<Result<string, string>> => {
   if (urlCode.charAt(0) !== '1') {
      return newError('unknown version');
   }

   const compressed = short.decode(urlCode.slice(1));

   let bytes;
   try {
      bytes = await decompressor(compressed);
   } catch (err) {
      return newError(`decompression failed: ${err}`);
   }

   return newSuccess(strFromU8(bytes));
};

const decompressor = async (compressed: Buffer): Promise<Uint8Array> => {
   return new Promise((resolve, reject) => {
      decompress(compressed, (err, data) => {
         if (err !== null) {
            reject(err);
         } else {
            resolve(data);
         }
      });
   });
};
