import { Diagnostic, linter as makeLinter, LintSource } from '@codemirror/lint';
import { Error, Failure } from './combi';
import { parseDiagram } from './parser';

const makeSource: LintSource = (view): readonly Diagnostic[] => {
   const code = view.state.doc.toJSON().join('\n');
   const result = parseDiagram(code);
   if (result.type === 'success') {
      return [];
   }

   const cause = (error: Error | Failure): string => {
      if (error.cause) {
         return cause(error.cause) + `: ${error.description}`;
      }

      return `caused by ${error.description}`;
   };

   const from = result.reason.ctx.index;
   const message = cause(result.reason);

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

export const linter = makeLinter(makeSource);
