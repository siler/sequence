import {
   ClipboardCheckIcon,
   ClipboardCopyIcon,
} from '@heroicons/react/outline';
import React, { useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

export interface CopyButtonProps {
   name: string;
   data: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ name, data }) => {
   const [showCopied, setShowCopied] = useState(false);
   const [lastTimeout, setLastTimeout] = useState<number | undefined>(
      undefined
   );

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
      <CopyToClipboard onCopy={debouncedShowCopied} text={data}>
         <div
            tabIndex={-1}
            className="btn btn-indigo mt-4 flex flex-row justify-between items-center"
         >
            <span>{name}</span>
            {clipboard}
         </div>
      </CopyToClipboard>
   );
};
