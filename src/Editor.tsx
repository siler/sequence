import { Compartment, EditorState, Extension, Text } from '@codemirror/state';
import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';
import React, { useEffect, useMemo, useRef, } from 'react';
import { debounce } from './debounce';
import { parser } from './seq/language/gen/parser';
import { styleTags, tags as t } from '@lezer/highlight';
import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { completeFromList } from '@codemirror/autocomplete';

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

export type EditorProps = {
    extensions: Extension[];
    onUpdate: OnEditorUpdate;
    text: string;
};

/**
 * component for the seq editor
 */
const Editor = ({ extensions, onUpdate, text}: EditorProps) => {
    const notifier = useMemo(
        () => updateNotifier([onUpdate]),
        [onUpdate]
    );

    const editorState = useMemo(() => {
        const languageConf = new Compartment();

        return EditorState.create({
            doc: text,
            extensions: [
                basicSetup, theme, notifier, languageConf.of(seq()), ...extensions
            ],
        });

        // text is omitted here because we don't want to recreate
        // the editor state whenever the text changes. the editor
        // is the source of truth for these changes, we can leave
        // it be.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [basicSetup, theme, notifier, extensions]);

    // then set up the view
    const parent = useRef(null);

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

export default Editor;

/**
 * creates a new ViewPlugin which calls a list of OnEditorUpdate functions
 * when the document state changes.
 */
const updateNotifier = <V extends PluginValue>(onUpdates: OnEditorUpdate[]): ViewPlugin<V> => {
    return ViewPlugin.fromClass(class {
        view: EditorView;
        debounce: (arg: Text) => void;

        constructor(view: EditorView) {
            this.view = view;
            this.debounce = debounce((doc) => {
                onUpdates.forEach((onUpdate) => onUpdate(doc.toJSON().join('\n')));
            }, 1000);
        }

        update(update: ViewUpdate) {
            if (update.docChanged) {
                this.debounce(this.view.state.doc);
            }
        }
    });
};

const parserWithMetadata = parser.configure({
    props: [
        styleTags({
            'participant ->': t.keyword,
            'Comment': t.comment,
            'ParticipantName': t.literal,
        }),
    ]
});

const seqLanguage = LRLanguage.define({
    parser: parserWithMetadata,
});


const seqCompletion = seqLanguage.data.of({
    autocomplete: completeFromList([
        { label: 'participant', type: 'keyword' },
    ])
});

const seq = () => {
    return new LanguageSupport(seqLanguage, [seqCompletion]);
};