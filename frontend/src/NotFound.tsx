import { Article } from './article';
import { TextLink } from './article/TextLink';

export const NotFound = () => {
   return (
      <Article>
         <h1>Don't worry</h1>
         <p>
            Looks like this page doesn't exist. Feel free to go back{' '}
            <TextLink to="/">home</TextLink>, or to{' '}
            <TextLink to="/edit">the editor</TextLink>.
         </p>
      </Article>
   );
};
