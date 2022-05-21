import Editor from './Editor';
import Split from 'react-split';
import { basicSetup } from '@codemirror/basic-setup';
import { EditorView } from '@codemirror/view';

export default function SeqWorkspace() {
    return (
        <Split>
            <Editor extensions={[basicSetup, EditorView.darkTheme.of(true)]} />
            <canvas />
        </Split>
    );
}