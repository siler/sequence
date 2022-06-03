import React, { useEffect, useMemo, useState } from 'react';

const makeSafeFilename = (str: string): string => {
   return str.replace(/[/|\\:*?"<>]/g, '_');
};

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

      return `${makeSafeFilename(title)}.png`;
   }, [title]);

   useEffect(() => {
      if (!canvas || !open) {
         return;
      }

      const image = canvas.toDataURL('image/png', 9);
      const octetStream = image.replace(
         /^data:image\/png/,
         'data:application/octet-stream'
      );

      setUrl(octetStream);
   }, [canvas, setUrl, open]);

   return (
      <a download={filename} href={url}>
         <div className="btn btn-indigo mt-4 flex justify-center items-center">
            Download .png
         </div>
      </a>
   );
};
