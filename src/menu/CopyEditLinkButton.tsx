import {
   ClipboardCheckIcon,
   ClipboardCopyIcon,
} from '@heroicons/react/outline';
import React, { useEffect, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { encode } from '../urlCode';

export interface CopyEditLinkProps {
   code: string;
   open: boolean;
}

export const CopyEditLink: React.FC<CopyEditLinkProps> = ({ code, open }) => {
   const [encoded, setEncoded] = useState('');
   const [showCopied, setShowCopied] = useState(false);
   const [lastTimeout, setLastTimeout] = useState<number | undefined>(
      undefined
   );

   useEffect(() => {
      if (!open) {
         return;
      }

      setEncoded(encode(code));
   }, [code, open]);

   const clipboard = useMemo(() => {
      if (showCopied) {
         // the padding helps the icons overlap better
         return (
            <ClipboardCheckIcon className=" h-5 w-5 pr-[1px] text-green-300" />
         );
      } else {
         return <ClipboardCopyIcon className="h-5 w-5" />;
      }
   }, [showCopied]);

   const debouncedShowCopied = () => {
      if (lastTimeout !== undefined) {
         window.clearTimeout(lastTimeout);
      }

      setShowCopied(true);

      const timeout = window.setTimeout(() => {
         setShowCopied(false);
         setLastTimeout(undefined);
      }, 500);

      setLastTimeout(timeout);
   };

   return (
      <CopyToClipboard
         onCopy={debouncedShowCopied}
         text={`http://127.0.0.1:3000/edit/?diagram=${encoded}`}
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
