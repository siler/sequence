import React from 'react';

export interface LinkSpanProps {
   children: string;
}

export const LinkSpan: React.FC<LinkSpanProps> = ({ children }) => {
   return (
      <span className="text-indigo-500 decoration-white hover:decoration-indigo-500 underline transition">
         {children}
      </span>
   );
};
