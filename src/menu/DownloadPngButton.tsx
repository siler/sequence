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

      const newUrl = canvas
         .toDataURL('image/png')
         .replace(/^data:image/, 'data:application/octet-stream;');

      setUrl(newUrl);
   }, [canvas, url, open]);
   return (
      <a download="diagram.png" href={url}>
         <div className="btn btn-indigo mt-4 flex justify-center items-center">
            Download .png
         </div>
      </a>
   );
};
