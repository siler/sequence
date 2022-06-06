import { Extension } from '@codemirror/state';
import { ParsedDiagram } from '@sriler/sequence-core';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import Split from 'react-split';
import { drawDiagram } from '../diagram';
import { useOrientation } from '../orientation';
import { workspaceDispatchFn } from './actions';
import { Editor } from './Editor';
import './Workspace.css';

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

   const orientation = useOrientation();
   const [counter, setCounter] = useState(0);

   // a trick to rerender the split when the orientation changes
   useEffect(() => {
      setCounter((previous: number) => previous + 1);
   }, [orientation]);

   const first = firstSplitPercent ? firstSplitPercent : 30;
   const second = 100 - first;

   const landscape = orientation === 'landscape';

   const bothClasses = ['overflow-auto'];
   const editorClasses = clsx(
      classes,
      bothClasses,
      'bg-white',
      inset && [
         'border-t-2',
         'border-l-2',
         landscape ? 'border-b-2' : 'border-r-2',
      ]
   );
   const canvasClasses = clsx(
      classes,
      bothClasses,
      inset && [
         'border-r-2',
         'border-b-2',
         landscape ? 'border-t-2' : 'border-l-2',
      ]
   );

   const splitClasses = clsx('flex', landscape ? 'flex-row' : 'flex-col');

   const direction = landscape ? 'horizontal' : 'vertical';

   return (
      <Split
         key={counter}
         sizes={[first, second]}
         className={splitClasses}
         direction={direction}
         gutterSize={4}
         minSize={200}
         expandToMin={true}
      >
         <div className={editorClasses}>
            <Editor dispatch={dispatch} text={text} extensions={extensions} />
         </div>
         <div className={canvasClasses}>
            <canvas className="mx-auto" ref={canvas} />
         </div>
      </Split>
   );
};
