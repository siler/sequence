import type { dispatchFn } from './reducer';
import type { Action } from './actions';
import type { State } from './state';

export { reducer } from './reducer';
export type { dispatchFn };

export { setCode, setMenuOpen, setDiagram } from './actions';
export type { Action };

export { initialState, initializer } from './state';
export type { State };
