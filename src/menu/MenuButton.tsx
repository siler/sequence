import { ChevronRight, ChevronLeft } from '../icons/chevron';
import { setMenuOpen } from '../store';
import { dispatchFn } from '../store';

export interface MenuButtonProps {
   dispatch: dispatchFn;
   open: boolean;
}

export const MenuButton = ({ dispatch, open }: MenuButtonProps) => {
   const always =
      'absolute top-0 right-0 w-10 h-10 rounded-full bg-indigo-500 text-white hover:opacity-100 hover:scale-125 transition cursor-pointer select-none flex justify-center items-center p-2 m-3';
   const whenOpen = 'opacity-100 translate-x-16';
   const whenClosed = 'opacity-[.33] translate-x-0';
   const classes = open
      ? [always, whenOpen].join(' ')
      : [always, whenClosed].join(' ');

   return (
      <div
         className={classes}
         onClick={() => {
            dispatch(setMenuOpen(!open));
         }}
      >
         {open ? <ChevronRight /> : <ChevronLeft />}
      </div>
   );
};
