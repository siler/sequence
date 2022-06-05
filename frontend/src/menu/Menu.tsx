import clsx from 'clsx';
import React, { FocusEvent, useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { dispatchFn, setMenuOpen } from '../state';
import { encode } from '../urlCode';
import { CopyButton } from './CopyButton';
import { DownloadPng } from './DownloadPngButton';

interface MenuProps {
   dispatch: dispatchFn;
   open: boolean;
   code: string;
   canvas: HTMLCanvasElement | null;
   title?: string;
}

export const Menu: React.FC<MenuProps> = ({
   dispatch,
   open,
   code,
   canvas,
   title,
}) => {
   const [encoded, setEncoded] = useState('');
   const [onBlurEnabled, setOnBlurEnabled] = useState(true);
   const menu = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      if (open && menu.current) {
         menu.current.focus();
      }
   }, [open, menu]);

   useEffect(() => {
      if (open) {
         setEncoded(encode(code));
      }
   }, [code, open]);

   let toggleOnBlurEnabled;
   if (process.env.NODE_ENV === 'development') {
      const text = onBlurEnabled ? 'onBlur Enabled' : 'onBlur Disabled';
      toggleOnBlurEnabled = (
         <Button
            classes={['col-span-2']}
            onClick={() => setOnBlurEnabled(!onBlurEnabled)}
         >
            <span>{text}</span>
         </Button>
      );
   }

   const onBlur = (event: FocusEvent) => {
      if (
         onBlurEnabled &&
         !menu.current?.contains(event.relatedTarget as HTMLElement)
      ) {
         dispatch(setMenuOpen(false));
      }
   };

   const always = [
      'fixed',
      'top-2',
      'right-2',
      'w-60',
      'transition',
      'bg-indigo-500',
      'text-white',
      'shadow',
      'shadow-black/70',
      'rounded-bl-xl',
      'grid',
      'grid-cols-2',
      'p-4',
      'focus:ring-0',
      'focus:ring-offset-0',
      'focus:outline-none',
   ];
   const menuClasses = clsx(
      open && 'translate-x-0',
      !open && 'translate-x-64',
      always
   );
   const labelClasses = 'text-lg pl-2 pr-2 text-right self-center';
   return (
      <div ref={menu} className={menuClasses} tabIndex={-1} onBlur={onBlur}>
         <h1 className="col-span-2 text-center text-3xl m-2 pb-1 border-b-2 border-white">
            Menu
         </h1>
         <span className={labelClasses}>Edit link:</span>
         <CopyButton data={`http://${window.location.host}/edit/${encoded}`} />
         <span className={labelClasses}>Src link:</span>
         <CopyButton
            data={`http://${window.location.host}/render/${encoded}`}
         />
         <DownloadPng canvas={canvas} open={open} title={title} />
         {toggleOnBlurEnabled}
      </div>
   );
};
