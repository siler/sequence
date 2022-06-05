export type MenuDispatchFn = (action: MenuActions) => void;
export type MenuActions = SetMenuOpen;

export interface SetMenuOpen {
   readonly type: 'setMenuOpen';
   readonly open: boolean;
}

export const setMenuOpen = (open: boolean): SetMenuOpen => ({
   type: 'setMenuOpen',
   open,
});
