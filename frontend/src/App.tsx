import { EditorView } from '@codemirror/view';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './App.css';
import { Menu, MenuButton } from './menu';
import { useOrientation } from './orientation';
import { initializer, initialState, reducer } from './state';
import { setCachedDiagram } from './store';
import { Workspace } from './workspace';

export const App = () => {
   const orientation = useOrientation();
   const [decodeFailed, setDecodeFailed] = useState(false);
   const { diagram } = useParams();
   const [state, dispatch] = useReducer(
      reducer,
      initialState,
      initializer(() => setDecodeFailed(true), diagram)
   );

   const canvas = useRef<HTMLCanvasElement | null>(null);

   const extensions = useMemo(() => {
      const height = orientation === 'landscape' ? '100vh' : '50vh';
      return [
         EditorView.theme({
            '&': {
               height,
            },
         }),
      ];
   }, [orientation]);

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

   const classes = ['z-0', orientation === 'landscape' ? 'h-screen' : 'h-1/2'];

   return (
      <div>
         <Menu
            dispatch={dispatch}
            canvas={canvas.current}
            open={state.menuOpen}
            code={state.code}
            title={state.diagram.title}
            classes={['z-20']}
         />
         <MenuButton
            dispatch={dispatch}
            menuOpen={state.menuOpen}
            classes={['z-10']}
         />
         <Workspace
            dispatch={dispatch}
            text={state.code}
            diagram={state.diagram}
            canvas={canvas}
            classes={classes}
            extensions={extensions}
         />
      </div>
   );
};
