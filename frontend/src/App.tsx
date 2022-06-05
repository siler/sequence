import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Menu, MenuButton } from './menu';
import { Workspace } from './workspace';
import { reducer, initializer, initialState } from './state';
import { setCachedDiagram } from './store';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EditorView } from '@codemirror/view';
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

   const extensions = useMemo(() => {
      return [
         EditorView.theme({
            '&': {
               height: '100vh',
               border: '0',
            },
         }),
      ];
   }, []);

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
      <div>
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
            classes={['h-screen']}
            extensions={extensions}
         />
      </div>
   );
};
