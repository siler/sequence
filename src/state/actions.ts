export type Action = SetMenuOpen | SetCode;

export interface SetUrlEncode {
   readonly type: 'setUrlEncode';
   readonly enable: boolean;
}

export const setUrlEncode = (enable: boolean): SetUrlEncode => ({
   type: 'setUrlEncode',
   enable,
});

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
