import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import { MenuDispatchFn, setMenuOpen } from './actions';

export interface MenuButtonProps {
   dispatch: MenuDispatchFn;
   open: boolean;
   classes: string[];
}

export const MenuButton = ({ dispatch, open, classes }: MenuButtonProps) => {
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
   const className = clsx(
      open
         ? ['opacity-0', 'translate-x-16']
         : ['opacity-[.33]', 'translate-x-0'],
      classes,
      always
   );

   return (
      <div
         className={className}
         onClick={() => {
            dispatch(setMenuOpen(!open));
         }}
      >
         {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </div>
   );
};
