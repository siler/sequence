import { EditorState, Extension, Text } from '@codemirror/state';
import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from '../util';

const theme = EditorView.theme({
    '&': {
        color: 'white',
        backgroundColor: '#034'
    },
    '.cm-content': {
        caretColor: '#0e9'
    },
    '&.cm-focused .cm-cursor': {
        borderLeftColor: '#0e9'
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: '#074'
    },
    '.gutter': {
        backgroundColor: '#045',
        color: '#ddd',
        border: 'none'
    }
}, { dark: true });

export type OnEditorUpdate = { (content: string): void };

/**
 * 
 */
export default function useEditor(extensions: Extension[], onUpdate: OnEditorUpdate, initialText: string | null) {
    const [text, setText] = useState(initialText ? initialText : '');
    const parent = useRef(null);

    const notifier = useMemo(() => updateNotifier([onUpdate, setText]), [onUpdate, setText]);
    const editorState = useMemo(() => {
        return EditorState.create({
            doc: text,
            extensions: [notifier, theme, ...extensions],
        });
    }, [notifier, theme, extensions]);


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
    }, [parent]);

    return parent;
}

const updateNotifier = <V extends PluginValue>(onUpdate: OnEditorUpdate[]): ViewPlugin<V> => {
    return ViewPlugin.fromClass(class {
        view: EditorView;
        debounce: (arg: Text) => void;

        constructor(view: EditorView) {
            this.view = view;
            this.debounce = debounce((doc) => {
                onUpdate.map((f) => f(doc.toJSON().join('\n')));
            }, 1000);
        }

        update(update: ViewUpdate) {
            if (update.docChanged) {
                this.debounce(this.view.state.doc);
            }
        }
    });
};
