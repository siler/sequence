import { State } from './state';
import { Action } from './actions';
import produce from 'immer';

export type dispatchFn = (action: Action) => void;

export const reducer = (state: State, action: Action) => {
   return produce(state, (draft) => {
      switch (action.type) {
         case 'setMenuOpen':
            draft.menuOpen = action.open;
            break;
         case 'setCode':
            draft.code = action.code;
            break;
         default: {
            const exhaustiveCheck: never = action;
            return exhaustiveCheck;
         }
      }
   });
};
