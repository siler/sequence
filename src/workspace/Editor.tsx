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
import { dispatchFn, setCode } from '../state';
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

      console.log('creating editor state');

      return EditorState.create({
         doc: text,
         extensions: [
            basicSetup,
            notifier,
            languageConf.of(sequence()),
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
   const parent = useRef(null);

   useEffect(() => {
      if (!parent.current) {
         console.log('no parent, leaving early');
         return;
      }

      console.log('initializing view state');

      const view = new EditorView({
         state: editorState,
         parent: parent.current,
      });

      return () => {
         console.log('destroying view state');
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
