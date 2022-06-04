import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';
import { indentWithTab } from '@codemirror/commands';
import { useEffect, useMemo, useRef } from 'react';
import { sequence } from '../syntax';
import { dispatchFn, setCode, setDiagram } from '../state';
import { ParsedDiagram } from '@sriler/sequence';
import './Editor.css';
import { newUpdateNotifier } from './notifier';

export type EditorProps = {
   dispatch: dispatchFn;
   text: string;
};

/**
 * component for the sequence editor
 */
export const Editor = ({ dispatch, text }: EditorProps) => {
   const notifier = useMemo(
      () => newUpdateNotifier([(code: string) => dispatch(setCode(code))]),
      [dispatch]
   );

   const editorState = useMemo(() => {
      const languageConf = new Compartment();

      return EditorState.create({
         doc: text,
         extensions: [
            basicSetup,
            notifier,
            languageConf.of(
               sequence(
                  (diagram: ParsedDiagram) => dispatch(setDiagram(diagram)),
                  (error) => {
                     console.log(error);
                  }
               )
            ),
            keymap.of([indentWithTab]),
         ],
      });

      // text is omitted here because we don't want to recreate
      // the editor state whenever the text changes. the editor
      // is the source of truth for these changes, we can leave
      // it be.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [notifier]);

   // then set up the view
   const parent = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      if (!parent.current) {
         return;
      }

      const view = new EditorView({
         state: editorState,
         parent: parent.current,
      });

      return () => {
         view.destroy();
      };
   }, [editorState, parent]);

   return <div ref={parent} />;
};
