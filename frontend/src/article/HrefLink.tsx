import React from 'react';
import { LinkSpan } from './LinkSpan';

export interface HrefLinkProps {
   to: string;
   children: string;
}

export const HrefLink: React.FC<HrefLinkProps> = ({ to, children }) => {
   return (
      <a href={to}>
         <LinkSpan>{children}</LinkSpan>
      </a>
   );
};
