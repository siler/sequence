import {
   ClipboardCheckIcon,
   ClipboardCopyIcon,
} from '@heroicons/react/outline';
import React, { useCallback, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Button } from './Button';

export interface CopyButtonProps {
   data: string;
   children?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ children, data }) => {
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

   const onCopy = useCallback(() => {
      if (lastTimeout !== undefined) {
         window.clearTimeout(lastTimeout);
      }

      setShowCopied(true);

      const timeout = window.setTimeout(() => {
         setShowCopied(false);
         setLastTimeout(undefined);
      }, 500);

      setLastTimeout(timeout);
   }, [lastTimeout]);

   return (
      <CopyToClipboard
         onCopy={onCopy}
         text={data}
         options={{ debug: true }}
      >
         <Button classes={['col-span-2', 'justify-between']}>
            {children}
            {clipboard}
         </Button>
      </CopyToClipboard>
   );
};
