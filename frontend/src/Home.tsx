import { EditorView } from '@codemirror/view';
import { newEmptyDiagram } from '@sriler/sequence-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Article, Code, HrefLink, RoutedLink } from './article';
import { LinkSpan } from './article/LinkSpan';
import { Workspace, WorkspaceActions } from './workspace';

const niceDiagram =
   'http://127.0.0.1:3000/edit/1H4sIANbom2IAA22QsQ7CMAxE93zF_UB_oAMDINEdJGY3WBCRNlJi6O_TGFCqNqvv-c5nceK5RRcmXMIt4MSCa4jPZEz3GmhEs8M-hilxNICnnn2L-wzJTJufUoUs2QdjcCktsTPH98oq55rvPBOHvLcFdIymYqERZf9IQj2lisVfqd2hdYrJps26rj6nyITRWVbqAwC-CMRSAQAA';
const someNonsense =
   'http://127.0.0.1:3000/render/1H4sIAEjpm2IAA12QTU7DQAyF9z7F29EsglQQmyxS9RrdOcRpRp3MVInVQE-PPZCC2Hh-_Pw92xo0SoN8wSoY-SaIYdA8DM9EV541vIcrJ22wjJyEqByoW9wJiNxJbDBxL9AxLET3umXiurXY-XWTRNGnBX3GOrKaVuCqjn7SKouGdEYYSm7Nc-xhPNPwphknw6M29l9vtzUlOEE-dJZJ4idiNlYRYMgzUsY55x6z8JITrAGO0eYrvdSFKDeZiTy6w25flUaLYWvPlwo2y-Z5gmYcibrv4t3-rUL3mz4ctjorS-IYj-Xn9d-P1TmmNTyxnTtD-XQP2NG9TpY0p8cq8sXfvuUvjjPDR78BAAA';

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
         <h1>
            Welcome to <RoutedLink to="/edit">Sequence</RoutedLink>
         </h1>
         <p>
            Sequence is a sequence diagram editor. It aims to be a pleasant way
            of interacting with sequence diagrams. Here are some of its
            features:
         </p>
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
            <HrefLink to={niceDiagram}>this nice diagram</HrefLink>.
         </p>
         <h3>Image Link</h3>
         <p>
            Image links take the caller to Sequence's diagram rendering service
            and gives them a brand new image. These links can be embedded as the{' '}
            <Code>src</Code> attribute in an <Code>img</Code> element. Have{' '}
            <HrefLink to={someNonsense}>some nonsense</HrefLink> as an example.
         </p>
         <h2>Contributing</h2>
         <p>
            Any contributions, including bug reports, will soon be welcomed at
            the public GitHub repository for Sequence.
         </p>
      </Article>
   );
};
