import { completeFromList } from '@codemirror/autocomplete';
import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { parser } from './gen';
import { newLinter, OnParse } from './linter';

export const sequence = (onParse: OnParse) => {
   return new LanguageSupport(seqLanguage, [seqCompletion, newLinter(onParse)]);
};

const parserWithMetadata = parser.configure({
   props: [
      styleTags({
         Comment: t.comment,
         ParticipantName: t.atom,
         'LabelText TitleText': t.string,
         'participant label title': t.keyword,
         '->': t.operator,
      }),
   ],
});

const seqLanguage = LRLanguage.define({
   parser: parserWithMetadata,
});

const seqCompletion = seqLanguage.data.of({
   autocomplete: completeFromList([
      { label: 'title' },
      { label: 'participant' },
      { label: 'label' },
   ]),
});
