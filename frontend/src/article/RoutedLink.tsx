import React from 'react';
import { Link } from 'react-router-dom';
import { LinkSpan } from './LinkSpan';

export interface RoutedLinkProps {
   to: string;
   children: string;
}

export const RoutedLink: React.FC<RoutedLinkProps> = ({ to, children }) => {
   return (
      <Link to={to}>
         <LinkSpan>{children}</LinkSpan>
      </Link>
   );
};
