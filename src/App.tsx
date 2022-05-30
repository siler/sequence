import { useEffect, useReducer, useRef } from 'react';
import { Menu, MenuButton } from './menu';
import { Workspace } from './workspace';
import { reducer, initializer, initialState } from './state';

export const diagramKey = 'seq-diagram';

export const App = () => {
   const [state, dispatch] = useReducer(reducer, initialState, initializer);
   const canvas = useRef<HTMLCanvasElement | null>(null);

   useEffect(() => {
      if (state.code) {
         localStorage.setItem(diagramKey, state.code);
      }
   }, [state.code]);

   return (
      <div className="h-screen bg-gray-300 p-2">
         <Menu
            dispatch={dispatch}
            canvas={canvas.current}
            open={state.menuOpen}
            code={state.code}
         />
         <MenuButton dispatch={dispatch} open={state.menuOpen} />
         <Workspace dispatch={dispatch} text={state.code} canvas={canvas} />
      </div>
   );
};
