import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/solid';
import { dispatchFn, setMenuOpen } from '../state';

export interface MenuButtonProps {
   dispatch: dispatchFn;
   open: boolean;
}

export const MenuButton = ({ dispatch, open }: MenuButtonProps) => {
   const always =
      'absolute top-0 right-0 w-10 h-10 rounded-full bg-indigo-500 text-white hover:opacity-100 hover:scale-125 transition cursor-pointer select-none flex justify-center items-center p-2 m-4';
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
         {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </div>
   );
};
