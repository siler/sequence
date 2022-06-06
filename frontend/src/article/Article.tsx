import React, { ReactNode } from 'react';

export interface ArticleProps {
   children: ReactNode;
}

export const Article: React.FC<ArticleProps> = ({ children }) => {
   return (
      <div className="md:mt-16 md:mb-16 mx-auto p-8 sm:p-16 bg-white max-w-screen-md shadow shadow-black/70 flex justify-center">
         <article className="prose prose-a:no-underline">{children}</article>
      </div>
   );
};
