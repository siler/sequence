import React, { useEffect } from 'react';
import Split from 'react-split';
import { Editor } from './Editor';
import { ParsedDiagram } from '@sriler/sequence';
import { drawDiagram } from '../diagram';
import { workspaceDispatchFn } from './actions';
import './Workspace.css';
import clsx from 'clsx';
import { Extension } from '@codemirror/state';

export interface WorkspaceProps {
   dispatch: workspaceDispatchFn;
   text: string;
   diagram: ParsedDiagram;
   canvas: React.MutableRefObject<HTMLCanvasElement | null>;
   extensions?: Extension[];
   firstSplitPercent?: number;
   classes?: string[];
   inset?: boolean;
}

/**
 * component for the seq workspace
 *
 * a workspace split between an editor and a renderer.
 */
export const Workspace = ({
   dispatch,
   text,
   diagram,
   canvas,
   extensions,
   firstSplitPercent,
   classes,
   inset,
}: WorkspaceProps) => {
   useEffect(() => {
      if (canvas.current) {
         drawDiagram(diagram, canvas.current, 1);
      }
   }, [diagram, canvas]);

   const first = firstSplitPercent ? firstSplitPercent : 30;
   const second = 100 - first;

   const both = ['overflow-auto'];
   const editorClasses = clsx(
      both,
      classes,
      'bg-white',
      inset && ['border-t-2', 'border-l-2', 'border-b-2']
   );
   const canvasClasses = clsx(
      both,
      classes,
      'flex',
      'justify-center',
      'items-center',
      inset && ['border-t-2', 'border-r-2', 'border-b-2']
   );

   return (
      <Split
         sizes={[first, second]}
         className="flex flex-row"
         gutterSize={4}
         minSize={200}
         expandToMin={true}
      >
         <div className={editorClasses}>
            <Editor dispatch={dispatch} text={text} extensions={extensions} />
         </div>
         <div className={canvasClasses}>
            <canvas ref={canvas} />
         </div>
      </Split>
   );
};
