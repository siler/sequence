import { ParsedDiagram } from '@siler/realize-sequence';

export type Action = SetMenuOpen | SetCode | SetDiagram;

export interface SetMenuOpen {
   readonly type: 'setMenuOpen';
   readonly open: boolean;
}

export const setMenuOpen = (open: boolean): SetMenuOpen => ({
   type: 'setMenuOpen',
   open,
});

export interface SetCode {
   readonly type: 'setCode';
   readonly code: string;
}

export const setCode = (code: string): SetCode => ({
   type: 'setCode',
   code,
});

export interface SetDiagram {
   readonly type: 'setDiagram';
   readonly diagram: ParsedDiagram;
}

export const setDiagram = (diagram: ParsedDiagram): SetDiagram => ({
   type: 'setDiagram',
   diagram,
});
