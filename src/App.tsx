import { useEffect, useReducer, useRef } from 'react';
import { Menu, MenuButton } from './menu';
import { Workspace } from './workspace';
import { reducer, initializer, initialState } from './state';
import { setCachedDiagram } from './store';
import { useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

export const App = () => {
   const decodeFailed = useRef(false);

   const [params] = useSearchParams();
   const [state, dispatch] = useReducer(
      reducer,
      initialState,
      initializer(
         () => (decodeFailed.current = true),
         params.get('diagram') || undefined
      )
   );

   const canvas = useRef<HTMLCanvasElement | null>(null);

   useEffect(() => {
      if (state.code) {
         setCachedDiagram(state.code);
      }
   }, [state.code]);

   useEffect(() => {
      if (decodeFailed.current) {
         decodeFailed.current = false;
         toast.error('Failed to decode diagram from URL.');
      }
   }, [decodeFailed]);

   return (
      <div className="h-screen bg-gray-300 p-2">
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
         <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={true}
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={true}
         />
      </div>
   );
};
