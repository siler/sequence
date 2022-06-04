import { Diagnostic, linter, LintSource } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { parseDiagram, ParsedDiagram, Error, Failure } from '@sriler/sequence';

export type OnParse = { (content: ParsedDiagram): void };
export type OnError = { (error: Error | Failure): void };

const makeSource = (onParse: OnParse, OnError: OnError): LintSource => {
   return (view: EditorView) => {
      const code = view.state.doc.toJSON().join('\n');
      const result = parseDiagram(code);
      if (result.type === 'success') {
         onParse(result.diagram);
         return [];
      }

      OnError(result.reason);

      const cause = (error: Error | Failure): string => {
         if (error.cause) {
            return cause(error.cause) + `: ${error.description}`;
         }

         return `caused by ${error.description}`;
      };

      const message = cause(result.reason);
      let from = result.reason.ctx.index;

      // this is pretty cludgy for an error at the end of the file
      if (from >= code.length) {
         from = code.length - 1;
      }

      let to = code.slice(from).search(/[ \t\n]/);
      if (to === -1) {
         to = from;
      } else {
         to = from + to;
      }
      console.log('to: ' + to);
      console.log('from: ' + from);
      console.log('code: ' + code);

      const diagnostic: Diagnostic = {
         severity: 'error',
         from,
         to,
         message,
      };

      return [diagnostic];
   };
};

export const makeLinter = (onParse: OnParse, onError: OnError) =>
   linter(makeSource(onParse, onError), { delay: 100 });
