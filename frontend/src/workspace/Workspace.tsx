import React, { useEffect } from 'react';
import Split from 'react-split';
import { Editor } from './Editor';
import { ParsedDiagram } from '@sriler/sequence';
import { drawDiagram } from '../diagram';
import { dispatchFn } from '../state';
import './Workspace.css';

export interface WorkspaceProps {
   dispatch: dispatchFn;
   text: string;
   diagram: ParsedDiagram;
   canvas: React.MutableRefObject<HTMLCanvasElement | null>;
}

/**
 * component for the seq workspace
 *
 * includes a primary workspace split between an editor and a renderer.
 */
export const Workspace = ({
   dispatch,
   text,
   diagram,
   canvas,
}: WorkspaceProps) => {
   useEffect(() => {
      if (canvas.current) {
         drawDiagram(diagram, canvas.current, 1);
      }
   }, [diagram, canvas]);

   return (
      <Split
         sizes={[30, 70]}
         className="flex flex-row bg-white"
         minSize={200}
         expandToMin={true}
      >
         <div className="screen-window-height overflow-auto shadow shadow-black/70">
            <Editor dispatch={dispatch} text={text} />
         </div>
         <div className="screen-window-height overflow-auto shadow shadow-black/70">
            <canvas ref={canvas} />
         </div>
      </Split>
   );
};
