import { short } from '@tradle/urlsafe-base64';
import { decompress, strFromU8 } from 'fflate';
import { newError, newSuccess, Result } from './error';

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
