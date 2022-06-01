import { short } from '@tradle/urlsafe-base64';
import { strToU8, compressSync, decompressSync, strFromU8 } from 'fflate';

export const encode = (code: string): string => {
   const bytes = strToU8(code);
   const compressed = compressSync(bytes);
   const base64 = short.encode(compressed);

   return '1' + base64;
};

export const decode = (urlCode: string): string | null => {
   // check for a known version
   if (urlCode.charAt(0) !== '1') {
      return null;
   }

   const compressed = short.decode(urlCode.slice(1));

   // decompressSync throws, so handle it gracefully
   let bytes;
   try {
      bytes = decompressSync(compressed);
   } catch (err) {
      return null;
   }

   return strFromU8(bytes);
};
