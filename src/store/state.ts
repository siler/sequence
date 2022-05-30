import { diagramKey } from '../App';

export interface State extends InitialState {
   code: string;
}

interface InitialState {
   menuOpen: boolean;
}

export const initialState = {
   menuOpen: false,
};

export const initializer = (state: InitialState): State => {
   const code = localStorage.getItem(diagramKey) || '';
   return { ...state, code };
};
