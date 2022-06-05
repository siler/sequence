import { Compartment, EditorState, Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';
import { indentWithTab } from '@codemirror/commands';
import { useEffect, useMemo, useRef } from 'react';
import { sequence } from '../syntax';
import { ParsedDiagram } from '@sriler/sequence';
import { newUpdateNotifier } from './notifier';
import { workspaceDispatchFn, setCode, setDiagram } from './actions';

export type EditorProps = {
   dispatch: workspaceDispatchFn;
   text: string;
   extensions?: Extension[];
};

/**
 * component for the sequence editor
 */
export const Editor = ({ dispatch, text, extensions }: EditorProps) => {
   const notifier = useMemo(
      () => newUpdateNotifier([(code: string) => dispatch(setCode(code))]),
      [dispatch]
   );

   const editorState = useMemo(() => {
      const languageConf = new Compartment();

      let configured = [
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
      ];

      if (extensions) {
         configured = configured.concat(...extensions);
      }

      return EditorState.create({
         doc: text,
         extensions: configured,
      });

      // text is omitted here because we don't want to recreate
      // the editor state whenever the text changes. the editor
      // is the source of truth for these changes, we can leave
      // it be.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [notifier, extensions]);

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
