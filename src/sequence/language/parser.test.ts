/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { parseDiagram } from './parser';

// this test should be maintained but kept this simple
test('parses a simple diagram', () => {
   // given
   const input = `Alan -> Cynthia
Cynthia -> Tina
Tina -> Cynthia
Cynthia -> Alan
`;

   // when
   const res = parseDiagram(input);

   // then
   expect(res).not.toBeNull();

   expect(res!.participants).toMatchObject([
      { name: 'Alan' },
      { name: 'Cynthia' },
      { name: 'Tina' },
   ]);
   expect(res!.messages).toMatchObject([
      { from: 'Alan', to: 'Cynthia' },
      { from: 'Cynthia', to: 'Tina' },
      { from: 'Tina', to: 'Cynthia' },
      { from: 'Cynthia', to: 'Alan' },
   ]);
});

// keep this test up to date with the worst syntax we allow
test('parses a funky diagram', () => {
   // given
   const input = `# lead with a comment
zEr0 -> int3gra
int3gra-> 4l1c3
# check out all this weird spacing

4l1c3 ->int3gra
int3gra->zEr0 # oh my glob

# the following empty line is required
`;

   // when
   const res = parseDiagram(input);
   const name1 = 'zEr0';
   const name2 = 'int3gra';
   const name3 = '4l1c3';

   // then
   expect(res).not.toBeNull();

   expect(res!.participants).toMatchObject([
      { name: name1 },
      { name: name2 },
      { name: name3 },
   ]);
   expect(res!.messages).toMatchObject([
      { from: name1, to: name2 },
      { from: name2, to: name3 },
      { from: name3, to: name2 },
      { from: name2, to: name1 },
   ]);
});

test('parses a diagram with signal labels', () => {
   // given
   const input = `Alan -> Cynthia
    label: gossips
Cynthia -> Tina
    label: calls
Tina -> Cynthia
    label: reciprocates
Cynthia -> Alan
    label: nopes
`;

   // when
   const res = parseDiagram(input);

   // then
   expect(res).not.toBeNull();

   expect(res!.participants).toMatchObject([
      { name: 'Alan' },
      { name: 'Cynthia' },
      { name: 'Tina' },
   ]);
   expect(res!.messages).toMatchObject([
      { from: 'Alan', to: 'Cynthia' },
      { from: 'Cynthia', to: 'Tina' },
      { from: 'Tina', to: 'Cynthia' },
      { from: 'Cynthia', to: 'Alan' },
   ]);
});
