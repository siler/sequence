import clsx from 'clsx';
import React, { FocusEvent, useCallback, useEffect, useRef, useState } from 'react';
import { encode } from '../urlCode';
import { MenuDispatchFn, setMenuOpen } from './actions';
import { CopyButton } from './CopyButton';
import { DownloadPng } from './DownloadPngButton';
import { OnBlurToggle } from './OnBlurToggle';

interface MenuProps {
   dispatch: MenuDispatchFn;
   open: boolean;
   code: string;
   canvas: HTMLCanvasElement | null;
   title?: string;
   classes?: string[];
}

export const Menu: React.FC<MenuProps> = ({
   dispatch,
   open,
   code,
   canvas,
   title,
   classes,
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

   const onBlur = useCallback((event: FocusEvent) => {
      if (
         onBlurEnabled &&
         !menu.current?.contains(event.relatedTarget as HTMLElement)
      ) {
         dispatch(setMenuOpen(false));
      }
   }, [menu, onBlurEnabled, dispatch])

   const always = [
      'fixed',
      'top-0',
      'right-0',
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
      classes,
      open ? 'translate-x-0' : 'translate-x-64',
      always
   );

   return (
      <div ref={menu} className={menuClasses} tabIndex={-1} onBlur={onBlur}>
         <h1 className="col-span-2 text-center text-3xl m-2 pb-1 ">Menu</h1>
         <CopyButton data={`${window.location.origin}/edit/${encoded}`}>
            Copy Edit Link
         </CopyButton>
         <CopyButton data={`${window.location.origin}/render/${encoded}`}>
            Copy Image Link
         </CopyButton>
         <DownloadPng canvas={canvas} open={open} title={title} />
         <OnBlurToggle enabled={onBlurEnabled} setEnabled={setOnBlurEnabled} />
      </div>
   );
};
