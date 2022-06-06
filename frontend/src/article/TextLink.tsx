import React from 'react';
import { Link } from 'react-router-dom';
import { LinkSpan } from './LinkSpan';

export interface TextLinkProps {
   to: string;
   children: string;
}

export const TextLink: React.FC<TextLinkProps> = ({ to, children }) => {
   return (
      <Link to={to}>
         <LinkSpan>{children}</LinkSpan>
      </Link>
   );
};
