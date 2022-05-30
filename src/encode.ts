import { short } from '@tradle/urlsafe-base64';
import { strToU8, strFromU8, compressSync } from 'fflate';

export const encode = (code: string): string => {
   const u8 = strToU8(code);
   const compressedU8 = compressSync(u8);
   const compressedStr = strFromU8(compressedU8);
   return short.encode(compressedStr);
};
