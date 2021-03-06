import React, { useEffect, useMemo, useState } from 'react';
import { Button } from './Button';

export interface DownloadPngProps {
   canvas: HTMLCanvasElement | null;
   open: boolean;
   title?: string;
}

export const DownloadPng: React.FC<DownloadPngProps> = ({
   canvas,
   open,
   title,
}) => {
   const [url, setUrl] = useState('');

   const filename = useMemo(() => {
      if (!title) {
         return 'sequenceDiagram.png';
      }

      return title + '.png';
   }, [title]);

   useEffect(() => {
      if (!canvas || !open) {
         return;
      }

      setUrl(canvas.toDataURL('image/png', 9));
   }, [canvas, setUrl, open]);

   return (
      <a className={'col-span-2'} download={filename} href={url}>
         <Button classes={['justify-around']}>
            <span>Download .png</span>
         </Button>
      </a>
   );
};
