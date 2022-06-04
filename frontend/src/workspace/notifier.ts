import { Text } from '@codemirror/state';
import {
   EditorView,
   PluginValue,
   ViewPlugin,
   ViewUpdate,
} from '@codemirror/view';
import { debounce } from '../debounce';
import './Editor.css';

export type OnEditorUpdate = { (content: string): void };

/**
 * creates a new ViewPlugin which calls a list of OnEditorUpdate functions
 * when the document state changes.
 */
export const newUpdateNotifier = <V extends PluginValue>(
   onUpdates: OnEditorUpdate[],
   debounceMs = 100
): ViewPlugin<V> => {
   return ViewPlugin.fromClass(
      class {
         readonly debounce: (arg: Text) => void;

         constructor(public readonly view: EditorView) {
            this.view = view;
            this.debounce = debounce(debounceMs, (doc) => {
               onUpdates.forEach((onUpdate) => onUpdate(doc.toString()));
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
