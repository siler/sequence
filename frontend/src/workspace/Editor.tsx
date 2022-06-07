import { basicSetup } from '@codemirror/basic-setup';
import { indentWithTab } from '@codemirror/commands';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { ParsedDiagram } from '@sriler/sequence-core';
import { useEffect, useMemo, useRef } from 'react';
import { setCode, setDiagram, workspaceDispatchFn } from './actions';
import { sequence } from './language';
import { newUpdateNotifier } from './notifier';

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
      let configured = [
         basicSetup,
         keymap.of([indentWithTab]),
         notifier,
         sequence((diagram: ParsedDiagram) => dispatch(setDiagram(diagram))),
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
