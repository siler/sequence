import { ParsedDiagram } from '@sriler/sequence';

export type workspaceDispatchFn = (action: WorkspaceActions) => void;
export type WorkspaceActions = SetCode | SetDiagram;

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
