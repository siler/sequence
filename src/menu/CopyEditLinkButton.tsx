import {
   ClipboardCheckIcon,
   ClipboardCopyIcon,
} from '@heroicons/react/outline';
import React, { useEffect, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { encode } from '../encode';

export interface CopyEditLinkProps {
   code: string;
   open: boolean;
}

export const CopyEditLink: React.FC<CopyEditLinkProps> = ({ code, open }) => {
   const [compressed, setCompressed] = useState('');
   const [showCopied, setShowCopied] = useState(false);
   const [lastTimeout, setLastTimeout] = useState<number | null>(null);

   useEffect(() => {
      if (!open) {
         return;
      }

      setCompressed(encode(code));
   }, [code, open]);

   const clipboard = useMemo(() => {
      if (showCopied) {
         // this padding helps the icons overlap better
         return (
            <ClipboardCheckIcon className=" h-5 w-5 pr-[1px] text-green-300" />
         );
      } else {
         return <ClipboardCopyIcon className="h-5 w-5" />;
      }
   }, [showCopied]);

   return (
      <CopyToClipboard
         onCopy={() => {
            if (lastTimeout !== null) {
               window.clearTimeout(lastTimeout);
            }

            setShowCopied(true);
            setLastTimeout(
               window.setTimeout(() => {
                  setShowCopied(false);
                  setLastTimeout(null);
               }, 500)
            );
         }}
         text={`http://127.0.0.1:3000/edit/?d=${compressed}`}
      >
         <div
            tabIndex={-1}
            className="btn btn-indigo mt-4 flex flex-row justify-between items-center"
         >
            <span>Edit link</span>
            {clipboard}
         </div>
      </CopyToClipboard>
   );
};
