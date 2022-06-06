import clsx from 'clsx';
import React from 'react';

export interface EditorButtonProps {
   children: string;
}

export const EditorButton: React.FC<EditorButtonProps> = ({ children }) => {
   const className = [
      'text-white',
      'mx-auto',
      'py-2',
      'px-4',
      'w-40',
      'rounded',
      'bg-indigo-500',
      'hover:bg-indigo-600',
      'cursor-pointer',
      'select-none',
      'flex',
      'flex-row',
      'justify-around',
      'shadow',
      'shadow-black/70',
   ];

   const classes = clsx(className);

   return (
      <div tabIndex={-1} className={classes}>
         {children}
      </div>
   );
};
