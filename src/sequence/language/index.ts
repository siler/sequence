import { completeFromList } from '@codemirror/autocomplete';
import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { parser } from './gen/parser';

export const sequence = () => {
   return new LanguageSupport(seqLanguage, [seqCompletion]);
};

const parserWithMetadata = parser.configure({
   props: [
      styleTags({
         Comment: t.comment,
         ParticipantName: t.atom,
         LabelText: t.string,

         'participant label': t.keyword,
         '->': t.operator,
      }),
   ],
});

const seqLanguage = LRLanguage.define({
   parser: parserWithMetadata,
});

const seqCompletion = seqLanguage.data.of({
   autocomplete: completeFromList([
      { label: 'participant', type: 'keyword' },
      { label: 'label', type: 'keyword' },
   ]),
});
