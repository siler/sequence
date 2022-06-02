import { completeFromList } from '@codemirror/autocomplete';
import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { parser } from './gen';
import { makeLinter, OnError, OnParse } from '../workspace/linter';

export const sequence = (onParse: OnParse, onError: OnError) => {
   return new LanguageSupport(seqLanguage, [
      seqCompletion,
      makeLinter(onParse, onError),
   ]);
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
      { label: 'title', type: 'keyword' },
      { label: 'participant', type: 'keyword' },
      { label: 'label', type: 'keyword' },
   ]),
});
