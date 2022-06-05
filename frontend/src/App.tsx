import { useEffect, useReducer, useRef, useState } from 'react';
import { Menu, MenuButton } from './menu';
import { Workspace } from './workspace';
import { reducer, initializer, initialState } from './state';
import { setCachedDiagram } from './store';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './App.css';

export const App = () => {
   const [decodeFailed, setDecodeFailed] = useState(false);

   const { diagram } = useParams();
   const [state, dispatch] = useReducer(
      reducer,
      initialState,
      initializer(() => setDecodeFailed(true), diagram)
   );

   const canvas = useRef<HTMLCanvasElement | null>(null);

   useEffect(() => {
      if (state.code) {
         setCachedDiagram(state.code);
      }
   }, [state.code]);

   useEffect(() => {
      if (decodeFailed) {
         setDecodeFailed(false);
         toast.error('Failed to decode diagram from URL.');
      }
   }, [decodeFailed]);

   return (
      <div className="h-screen p-2">
         <Menu
            dispatch={dispatch}
            canvas={canvas.current}
            open={state.menuOpen}
            code={state.code}
            title={state.diagram.title}
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
