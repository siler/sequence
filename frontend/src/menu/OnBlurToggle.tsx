import React from 'react';
import { Button } from './Button';

export interface OnBlurToggleProps {
   enabled: boolean;
   setEnabled: (value: boolean) => void;
}

export const OnBlurToggle: React.FC<OnBlurToggleProps> = ({
   enabled,
   setEnabled,
}) => {
   if (process.env.NODE_ENV !== 'development') {
      return null;
   }

   const text = enabled ? 'onBlur Enabled' : 'onBlur Disabled';
   return (
      <Button
         classes={['col-span-2', 'justify-around']}
         onClick={() => setEnabled(!enabled)}
      >
         <span>{text}</span>
      </Button>
   );
};
