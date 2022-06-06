import clsx from 'clsx';
import React, { ReactNode } from 'react';

export interface ButtonProps {
   children: ReactNode[] | ReactNode;
   onClick?: () => void;
   classes?: string[];
}

export const Button: React.FC<ButtonProps> = ({
   children,
   onClick,
   classes,
}) => {
   const className = clsx(
      'text-white',
      'm-2',
      'py-2',
      'px-4',
      'rounded',
      'border-white',
      'border-2',
      'rounded-lg',
      'bg-indigo-500',
      'hover:bg-indigo-600',
      'cursor-pointer',
      'select-none',
      'flex',
      'flex-row',
      classes
   );
   return (
      <div tabIndex={-1} className={className} onClick={onClick}>
         {children}
      </div>
   );
};
