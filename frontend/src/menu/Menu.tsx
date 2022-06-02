import React, { FocusEvent, useEffect, useRef, useState } from 'react';
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
   const always =
      'fixed top-2 right-2 transition bg-indigo-500 text-white flex flex-col p-4 shadow shadow-black/50 rounded-bl-xl focus:ring-0 focus:ring-offset-0 focus:outline-none';
   const whenOpen = 'translate-x-0 ';
   const whenClosed = 'translate-x-48';

   const classes = open
      ? [always, whenOpen].join(' ')
      : [always, whenClosed].join(' ');

   const [encoded, setEncoded] = useState('');
   const menu = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      if (open && menu.current) {
         menu.current.focus();
      }
   }, [open, menu]);

   useEffect(() => {
      if (!open) {
         return;
      }

      setEncoded(encode(code));
   }, [code, open]);

   return (
      <div
         ref={menu}
         className={classes}
         tabIndex={-1}
         onBlur={(event: FocusEvent) => {
            if (menu.current?.contains(event.relatedTarget as HTMLElement)) {
               return;
            }

            dispatch(setMenuOpen(false));
         }}
      >
         <h1 className="self-center text-2xl">Menu</h1>
         <DownloadPng canvas={canvas} open={open} title={title} />
         <CopyButton
            name="Edit link"
            data={`http://127.0.0.1:3000/edit/?diagram=${encoded}`}
         />
         <CopyButton
            name="PNG link"
            data={`http://127.0.0.1:3000/render/?diagram=${encoded}`}
         />
      </div>
   );
};
