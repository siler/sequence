import produce from 'immer';
import { State } from './state';
import { MenuActions } from '../menu';
import { WorkspaceActions } from '../workspace';

type Action = MenuActions | WorkspaceActions;

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
         case 'setDiagram':
            draft.diagram = action.diagram;
            break;
         default: {
            const exhaustiveCheck: never = action;
            return exhaustiveCheck;
         }
      }
   });
};
