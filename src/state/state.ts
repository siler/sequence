import { diagramKey } from '../App';
import { ParsedDiagram, parseDiagram } from '../sequence';
import { newEmptyDiagram } from '../sequence';

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

export const initializer = (state: InitialState): State => {
   const code = localStorage.getItem(diagramKey) || '';
   const result = parseDiagram(code);
   if (result.type === 'success') {
      return { ...state, code, diagram: result.diagram };
   } else {
      return { ...state, code, diagram: newEmptyDiagram() };
   }
};
