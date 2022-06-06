import { EditorView } from '@codemirror/view';
import { newEmptyDiagram } from '@sriler/sequence-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Article, Code, LinkSpan, TextLink } from './article';
import { EditorButton } from './EditorButton';
import { Workspace, WorkspaceActions } from './workspace';

const niceDiagram =
   '/edit/1H4sIAAk5nWIAA22SvY7CMBCEez_FSDRQpLmSItL9SHflSZxEvcQbssLYyDage_vbJCSQC1Kq9eeZnYkXePUIpyzBk0OW7NgssBXnQC4F7BjnxBaUUItjT0c2HbXGV7jiJ9iAT87YhnhIRq9-U8xSyYl8TqDIcJKyCoiH4zorkQOi7JuMEC1HLHMjCfoNW6zM6a6hNucj-enoLYZr4jgdbjhe_s_eqWp4OvqgTDtK3O66kb36JVTBe64yHkA9dVKzE8_JdCugKEdjwNGO3Rp7jZ61g4masg1dGFbqmiP7jIN4mxQJtaqqIshrpbFVMzdNFEVRPnGo2gg4StJ2R7Qc0j4u0v4LY_qDFunDz4lurnZzkd7lrjB2NReZxh2eimVHv2zNcLF1Wb6sZkZ9ZYPRs2J74t5NeXsHI0DwUnHH_QFNb3y6xAIAAA';
const someNonsense =
   '/1H4sIACCDnWIAA12QsW7DMAxEd37FbbUHF0iLLh4c5Dey0TUdC1HEwBZiIF9fUq3TIAtlkXfvROeQo7TQM1bBxDdBDGPWcXwnuvKcw3e4csotlomTEJUDTYc7AZF7iS0uPAjyFBaie9MxcdNZ7f1zk0TJbwsGxTpxNq3AVT39jbMsOaQTwlhmq85xgPFMw5tmuhgejbGfsz3WlGBENUDpYtQZSXFSHTALL5psm5LcFL_cZCby6rxqV5dnFXxn148a9vIt4YisOBD1v-Zq91Wj_x_v95vPbEkc47V0Pl865nNMZ3hiOytD-S4P2MGzjja0pMfieva7_9MfFs7G4a0BAAA';

export const Home = () => {
   const canvas = useRef<HTMLCanvasElement | null>(null);
   const [text, setText] = useState(`title: Sequence

You -> Browser
  label: edit
Browser -> Browser
  label: parse
Browser -> Browser
  label: render
Browser --> You
  label: diagram`);
   const [diagram, setDiagram] = useState(newEmptyDiagram());
   const [url, setUrl] = useState('');

   const extensions = useMemo(() => {
      return [
         EditorView.theme({
            '&': {
               height: 'calc(21rem - 4px)',
            },
         }),
      ];
   }, []);

   const filename = useMemo(() => {
      if (!diagram.title) {
         return 'sequenceDiagram.png';
      }

      return diagram.title + '.png';
   }, [diagram.title]);

   const renderNonsense = useMemo(
      () => window.location.origin + '/render' + someNonsense,
      []
   );

   const editNonsense = useMemo(() => '/edit' + someNonsense, []);

   const dispatch = useCallback(
      (action: WorkspaceActions) => {
         switch (action.type) {
            case 'setCode':
               setText(action.code);
               break;
            case 'setDiagram':
               setDiagram(action.diagram);
               break;
            default:
               const _exhaustiveCheck: never = action;
               return _exhaustiveCheck;
         }
      },
      [setText, setDiagram]
   );

   useEffect(() => {
      if (!canvas.current) {
         return;
      }

      const image = canvas.current.toDataURL('image/png', 9);
      const octetStream = image.replace(
         /^data:image\/png/,
         'data:application/octet-stream'
      );

      setUrl(octetStream);
   }, [canvas, setUrl]);

   return (
      <Article>
         <h1>Welcome to Sequence</h1>
         <p>
            Sequence is a sequence diagram editor. It aims to be a pleasant way
            of interacting with sequence diagrams. If diving right in feels
            right, head over to the editor. If not, keep reading to learn about
            Sequence's features.
         </p>
         <Link to="/edit">
            <EditorButton>Make Diagrams</EditorButton>
         </Link>
         <h2>Live Editing</h2>
         <p>
            Sequence has a tailored editing experience with error reporting and
            convenient client-side rendering so results can be seen immediately.
         </p>
         <Workspace
            canvas={canvas}
            text={text}
            diagram={diagram}
            dispatch={dispatch}
            firstSplitPercent={42}
            classes={['h-[21rem]']}
            extensions={extensions}
            inset={true}
         />
         <h2>
            <Code>png</Code> Download
         </h2>
         <p>
            A diagram can be downloaded as a <Code>png</Code> file at any time.
            Try it now with{' '}
            <a download={filename} href={url}>
               <LinkSpan>the above diagram.</LinkSpan>
            </a>
         </p>
         <h2>Embedding</h2>
         <p>
            Sequence includes a link generator which embeds diagrams in links.
            This means a point in time snapshot of any diagram can be easily
            distributed by sharing a link.
         </p>
         <h3>Edit Link</h3>
         <p>
            The edit link takes the curious to the editor with the attached
            diagram loaded and rendered. Further links can always be generated
            from the editor's menu. Take a look at{' '}
            <TextLink to={niceDiagram}>this nice diagram</TextLink>.
         </p>
         <h3>Image Link</h3>
         <p>
            Image links take the caller to Sequence's diagram rendering service
            and gives them a brand new image. These links can be embedded as the{' '}
            <Code>src</Code> attribute in an <Code>img</Code> element:
         </p>
         <Link to={editNonsense}>
            <img
               src={renderNonsense}
               alt="a nonsense sequence diagram"
               className="shadow shadow-black/70"
            />
         </Link>
         <h2>Contributing</h2>
         <p>
            Any contributions, including bug reports, will soon be welcomed at
            the public GitHub repository for Sequence.
         </p>
      </Article>
   );
};
