import React, { ReactNode } from 'react';

export interface CodeProps {
   children: ReactNode;
}

export const Code: React.FC<CodeProps> = ({ children }) => {
   return (
      <span className="bg-slate-200 rounded-md p-1 font-mono font-light">
         {children}
      </span>
   );
};
