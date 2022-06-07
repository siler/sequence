import { Diagnostic, linter, LintSource } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import {
   Error,
   Failure,
   ParsedDiagram,
   parseDiagram,
} from '@sriler/sequence-core';

export type OnParse = { (content: ParsedDiagram): void };

const makeSource = (onParse: OnParse): LintSource => {
   return (view: EditorView) => {
      const code = view.state.doc.toString();
      const result = parseDiagram(code);
      if (result.type === 'success') {
         onParse(result.diagram);
         return [];
      }

      const cause = (error: Error | Failure): string => {
         if (error.cause) {
            return error.description + '\n' + cause(error.cause);
         } else {
            return 'caused by ' + error.description;
         }
      };

      const message = cause(result.reason);
      let from = result.reason.ctx.index;

      if (from >= code.length) {
         from = code.length - 1;
      }

      let to = code.slice(from).search(/[ \t\n]/);
      if (to === -1) {
         to = from;
      } else {
         to = from + to;
      }

      const diagnostic: Diagnostic = {
         severity: 'error',
         from,
         to,
         message,
      };

      return [diagnostic];
   };
};

export const newLinter = (onParse: OnParse) =>
   linter(makeSource(onParse), { delay: 100 });
