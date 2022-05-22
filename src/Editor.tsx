import React from 'react';
import { Extension } from '@codemirror/state';
import useEditor, { OnEditorUpdate } from './hooks/useEditor';

type EditorProps = {
    extensions: Extension[];
    onUpdate: OnEditorUpdate;
    initialText: string | null;
};

export default function Editor({ extensions, onUpdate, initialText }: EditorProps) {
    const parent = useEditor(extensions, onUpdate, initialText);

    return <div ref={parent} />;
}
