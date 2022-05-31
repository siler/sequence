import { ParsedDiagram, parseDiagram } from '../sequence';
import { newEmptyDiagram } from '../sequence';
import { getCachedDiagram } from '../store';
import { decode } from '../urlCode';

export interface State extends InitialState {
   code: string;
   diagram: ParsedDiagram;
}

interface InitialState {
   menuOpen: boolean;
}

export const initialState = {
   menuOpen: false,
};

export const initializer = (urlCode?: string) => {
   console.log('urlcode: ', urlCode);
   return (state: InitialState) => {
      let code;
      if (urlCode) {
         code = decode(urlCode);
         console.log(code);
      }

      if (!code) {
         console.log('loaded cached diagram from local storage');
         code = getCachedDiagram();
      } else {
         console.log('loaded diagram from url');
      }

      const result = parseDiagram(code);
      if (result.type === 'success') {
         return { ...state, code, diagram: result.diagram };
      } else {
         return { ...state, code, diagram: newEmptyDiagram() };
      }
   };
};
