import React, { FocusEvent, useEffect, useRef } from 'react';
import { dispatchFn, setMenuOpen } from '../state';
import { CopyEditLink } from './CopyEditLinkButton';
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
      'fixed top-2 right-2 transition bg-indigo-500 text-white flex flex-col p-4 shadow shadow-black/50 focus:ring-0 focus:ring-offset-0 focus:outline-none';
   const whenOpen = 'translate-x-0 ';
   const whenClosed = 'translate-x-48';

   const classes = open
      ? [always, whenOpen].join(' ')
      : [always, whenClosed].join(' ');

   const menu = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      if (open && menu.current) {
         menu.current.focus();
      }
   }, [open, menu]);

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
         <h1 className="self-center text-2xl border-b-2 border-white">Menu</h1>
         <DownloadPng canvas={canvas} open={open} title={title} />
         <CopyEditLink code={code} open={open} />
      </div>
   );
};
