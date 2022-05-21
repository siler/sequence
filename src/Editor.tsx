import { Extension } from "@codemirror/state";
import useEditor from "./hooks/useEditor";

type EditorProps = {
    extensions: Extension[];
};

export default function Editor({ extensions }: EditorProps) {
    const { ref } = useEditor(extensions);

    return <div ref={ref} />;
};
