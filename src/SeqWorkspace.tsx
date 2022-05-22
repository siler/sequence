import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor from './Editor';
import Split from 'react-split';
import { basicSetup } from '@codemirror/basic-setup';
import { EditorView } from '@codemirror/view';
import { draw } from './seq';
import './SeqWorkspace.css';

export default function SeqWorkspace() {
    const [text, setText] = useState('');
    const canvas = useRef<HTMLCanvasElement | null>(null);

    const extensions = [basicSetup, EditorView.darkTheme.of(true)];
    const onUpdate = (newCode: string) => { setText(newCode); };

    useMemo(() => {
        const diagram = localStorage.getItem('seq-diagram');
        setText(diagram ? diagram : '');
    }, []);

    useEffect(() => {
        localStorage.setItem('seq-diagram', text);
    }, [text]);

    useEffect(() => {
        if (canvas.current) {
            draw(text, canvas.current, 1);
        }

    }, [text, canvas]);

    return (
        <Split
            className='seq-split'
            direction='horizontal'
            minSize={100}
            expandToMin={true}
            gutterAlign='center' >
            <Editor extensions={extensions} onUpdate={onUpdate} initialText={text} />
            <div>
                <canvas ref={canvas} />
            </div>
        </Split>
    );
}