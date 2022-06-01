import { Compartment, EditorState, Text } from '@codemirror/state';
import {
   EditorView,
   keymap,
   PluginValue,
   ViewPlugin,
   ViewUpdate,
} from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';
import { indentWithTab } from '@codemirror/commands';
import { useEffect, useMemo, useRef } from 'react';
import { debounce } from '../debounce';
import { sequence } from '../sequence';
import { dispatchFn, setCode, setDiagram } from '../state';
import { ParsedDiagram } from '../sequence';
import './Editor.css';

export type OnEditorUpdate = { (content: string): void };

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

/**
 * creates a new ViewPlugin which calls a list of OnEditorUpdate functions
 * when the document state changes.
 */
const newUpdateNotifier = <V extends PluginValue>(
   onUpdates: OnEditorUpdate[]
): ViewPlugin<V> => {
   return ViewPlugin.fromClass(
      class {
         readonly debounce: (arg: Text) => void;

         constructor(public readonly view: EditorView) {
            this.view = view;
            this.debounce = debounce(100, (doc) => {
               const str = doc.toJSON().join('\n');
               onUpdates.forEach((onUpdate) => onUpdate(str));
            });
         }

         update(update: ViewUpdate) {
            if (update.docChanged) {
               this.debounce(this.view.state.doc);
            }
         }
      }
   );
};
