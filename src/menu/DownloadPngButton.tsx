import React, { useEffect, useState } from 'react';

export interface DownloadPngProps {
   canvas: HTMLCanvasElement | null;
   open: boolean;
}

export const DownloadPng: React.FC<DownloadPngProps> = ({ canvas, open }) => {
   const [url, setUrl] = useState('');

   useEffect(() => {
      if (!canvas || !open) {
         return;
      }

      const image = canvas.toDataURL('image/png', 10);
      const octetStream = image.replace(
         /^data:image\/png;/,
         'data:application/octet-stream;'
      );

      setUrl(octetStream);
   }, [canvas, url, open]);
   return (
      <a download="diagram.png" href={url}>
         <div className="btn btn-indigo mt-4 flex justify-center items-center">
            Download .png
         </div>
      </a>
   );
};
