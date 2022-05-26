import { useEffect, useMemo, useRef, useState } from 'react';
import Editor from './Editor';
import Split from 'react-split';
import { draw } from './seq';
import './SeqWorkspace.css';
import { Extension } from '@codemirror/state';

const diagramKey = 'seq-diagram';
const extensions: Extension[] = [];

/**
 * component for the seq workspace
 *
 * includes a primary workspace split between an editor and a renderer.
 */
const SeqWorkspace = () => {
   // load and initialize the workspace text, then set it up for persistence
   const [text, setText] = useState('');
   useMemo(() => {
      const diagram = localStorage.getItem(diagramKey);
      if (diagram) {
         setText(diagram);
      }
   }, []);

   useEffect(() => {
      localStorage.setItem(diagramKey, text);
   }, [text]);

   // configure the canvas ref and wire up drawing
   const canvas = useRef<HTMLCanvasElement | null>(null);

   useEffect(() => {
      if (canvas.current) {
         draw(text, canvas.current, 1);
      }
   }, [text, canvas]);

   return (
      <Split
         sizes={[30, 70]}
         className="seq-split"
         minSize={200}
         expandToMin={true}
      >
         <Editor extensions={extensions} onUpdate={setText} text={text} />
         <div>
            <canvas ref={canvas} />
         </div>
      </Split>
   );
};

export default SeqWorkspace;
