import { useEffect, useReducer, useRef } from 'react';
import { Menu, MenuButton } from './menu';
import { Workspace } from './workspace';
import { reducer, initializer, initialState } from './state';
import { setCachedDiagram } from './store';
import { useSearchParams } from 'react-router-dom';

export const App = () => {
   const [params] = useSearchParams();
   console.log(JSON.stringify(params));
   const [state, dispatch] = useReducer(
      reducer,
      initialState,
      initializer(params.get('d') || undefined)
   );
   const canvas = useRef<HTMLCanvasElement | null>(null);

   useEffect(() => {
      if (state.code) {
         setCachedDiagram(state.code);
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
         <Workspace
            dispatch={dispatch}
            text={state.code}
            diagram={state.diagram}
            canvas={canvas}
         />
      </div>
   );
};
