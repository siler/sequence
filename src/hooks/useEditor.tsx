import { EditorState, Extension, } from "@codemirror/state"
import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view"
import { useCallback, useEffect, useState } from 'react';

const seqAstParser = <V extends PluginValue>(): ViewPlugin<V> => {
    return ViewPlugin.fromClass(class {
        view: EditorView;

        constructor(view: EditorView) {
            this.view = view;
        }

        update(update: ViewUpdate) {
            if (update.docChanged) {
                const text = this.view.state.doc;

                var lines = text.toJSON();

                // do update thing
            }
        }
    });
}

// Returns a callback ref which attaches an instance of the Editor.
// https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
export default function useEditor(extensions: Extension[]) {
    const [element, setElement] = useState<HTMLElement>();

    useEffect(() => {
        if (!element) {
            // console.log("no editor element");
            return
        };

        // console.log("initializing editor view");

        const init = "";

        const state = EditorState.create({
            doc: init,
            extensions: [theme, ...extensions],
        });

        const view = new EditorView({
            state: state,
            parent: element,
        });

        return () => {
            // console.log("destroying editor view");
            view.destroy();
        }
    }, [element, extensions]);

    const ref = useCallback((node: HTMLElement | null) => {
        if (node) {
            setElement(node);
        } else {
            setElement(undefined);
        };

    }, []);

    return { ref }
}


const theme = EditorView.theme({
    "&": {
        color: "white",
        backgroundColor: "#034"
    },
    ".cm-content": {
        caretColor: "#0e9"
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: "#0e9"
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "#074"
    },
    ".cm-gutters": {
        backgroundColor: "#045",
        color: "#ddd",
        border: "none"
    }
}, { dark: true })