import { short } from '@tradle/urlsafe-base64';
import { strToU8, compressSync, decompressSync, strFromU8 } from 'fflate';

interface EncodingV1 {
   v: 1;
   d: string;
}

const v1 = (data: string): EncodingV1 => ({
   v: 1,
   d: data,
});

export const encode = (code: string): string => {
   const bytes = strToU8(code);
   const compressed = compressSync(bytes);
   const base64 = short.encode(compressed);
   const versioned = v1(base64);
   const string = JSON.stringify(versioned);
   const urlSafe = encodeURIComponent(string);

   return urlSafe;
};

export const decode = (data: string): string | null => {
   const decoded = decodeURIComponent(data);
   const parsed = JSON.parse(decoded);
   const asVersion = parsed as EncodingV1;
   if (asVersion.v !== 1) {
      console.log('invalid version: not 1');
      return null;
   }

   const compressed = short.decode(asVersion.d);
   const bytes = decompressSync(compressed);
   const str = strFromU8(bytes);

   return str;
};
