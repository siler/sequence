import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import { dispatchFn, setMenuOpen } from '../state';

export interface MenuButtonProps {
   dispatch: dispatchFn;
   open: boolean;
}

export const MenuButton = ({ dispatch, open }: MenuButtonProps) => {
   const always = [
      'fixed',
      'top-0',
      'right-0',
      'w-10',
      'h-10',
      'transition',
      'rounded-full',
      'shadow',
      'shadow-black/70',
      'bg-indigo-500',
      'text-white',
      'cursor-pointer',
      'select-none',
      'flex',
      'justify-center',
      'items-center',
      'p-2',
      'm-4',
      'hover:opacity-100',
      'hover:scale-125',
   ];
   const classes = clsx(
      open && ['opacity-0', 'translate-x-16'],
      !open && ['opacity-[.33]', 'translate-x-0'],
      always
   );

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
