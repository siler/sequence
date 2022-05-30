import React, { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { encode } from '../encode';

export interface CopyEditLinkProps {
   code: string;
   open: boolean;
}

export const CopyEditLink: React.FC<CopyEditLinkProps> = ({ code }) => {
   const [compressed, setCompressed] = useState('');

   useEffect(() => {
      if (!open) {
         return;
      }

      setCompressed(encode(code));
   }, [code]);

   return (
      <CopyToClipboard text={`http://127.0.0.1:3000/edit/?d=${compressed}`}>
         <div className="btn btn-indigo mt-4">Copy edit link</div>
      </CopyToClipboard>
   );
};
