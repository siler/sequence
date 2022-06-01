import { newEmptyDiagram, ParsedDiagram } from '../sequence';
import { getCachedDiagram } from '../store';
import { decode } from '../urlCode';

export interface State extends InitialState {
   code: string;
}

interface InitialState {
   menuOpen: boolean;
   diagram: ParsedDiagram;
}

export const initialState = {
   menuOpen: false,
   diagram: newEmptyDiagram(),
};

export const initializer = (urlDecodeFailed: () => void, urlCode?: string) => {
   return (state: InitialState) => {
      let code = '';

      if (urlCode) {
         const fromUrl = decode(urlCode);
         if (fromUrl === null) {
            urlDecodeFailed();
         } else {
            code = fromUrl;
         }
      }

      if (!code) {
         const fromCache = getCachedDiagram();
         if (fromCache) {
            code = fromCache;
         }
      }

      return { ...state, code };
   };
};
