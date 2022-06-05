import { Article, RoutedLink } from './article';

export const NotFound = () => {
   return (
      <Article>
         <h1>Don't worry</h1>
         <p>
            Looks like this page doesn't exist. Feel free to go back{' '}
            <RoutedLink to="/">home</RoutedLink>, or to{' '}
            <RoutedLink to="/edit">the editor</RoutedLink>.
         </p>
      </Article>
   );
};
