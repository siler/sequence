import { RoutedLink, HrefLink, Article, Code } from './article';

export const Home = () => {
   const niceDiagram =
      'http://127.0.0.1:3000/edit/1H4sIANbom2IAA22QsQ7CMAxE93zF_UB_oAMDINEdJGY3WBCRNlJi6O_TGFCqNqvv-c5nceK5RRcmXMIt4MSCa4jPZEz3GmhEs8M-hilxNICnnn2L-wzJTJufUoUs2QdjcCktsTPH98oq55rvPBOHvLcFdIymYqERZf9IQj2lisVfqd2hdYrJps26rj6nyITRWVbqAwC-CMRSAQAA';
   const someNonsense =
      'http://127.0.0.1:3000/render/1H4sIAEjpm2IAA12QTU7DQAyF9z7F29EsglQQmyxS9RrdOcRpRp3MVInVQE-PPZCC2Hh-_Pw92xo0SoN8wSoY-SaIYdA8DM9EV541vIcrJ22wjJyEqByoW9wJiNxJbDBxL9AxLET3umXiurXY-XWTRNGnBX3GOrKaVuCqjn7SKouGdEYYSm7Nc-xhPNPwphknw6M29l9vtzUlOEE-dJZJ4idiNlYRYMgzUsY55x6z8JITrAGO0eYrvdSFKDeZiTy6w25flUaLYWvPlwo2y-Z5gmYcibrv4t3-rUL3mz4ctjorS-IYj-Xn9d-P1TmmNTyxnTtD-XQP2NG9TpY0p8cq8sXfvuUvjjPDR78BAAA';
   return (
      <Article>
         <h1>Welcome to Sequence</h1>
         <p>
            If you know why you're here, hop over to the{' '}
            <RoutedLink to="/edit">editor</RoutedLink>. Otherwise, this is a
            sequence diagram editor. It aims to be a pleasant way of interacting
            with sequence diagrams. It has a couple of neat features:
         </p>
         <h2>Live Editing</h2>
         <p>
            With convenient client-side rendering results can be seen
            immediately.
         </p>
         <h2>
            <Code>png</Code> Download
         </h2>
         <p>
            A diagram can be downloaded as a <Code>png</Code> file at any time.
         </p>
         <h2>Embedding</h2>
         <p>
            Sequence includes a link generator which embeds diagrams in links.
            This means a point in time snapshot of any diagram can be easily
            distributed by sharing a link.
         </p>
         <h3>Edit Link</h3>
         <p>
            The edit link takes the curious to the editor with the attached
            diagram loaded and rendered. Further links can always be generated
            from the editor's menu. Take a look at{' '}
            <HrefLink to={niceDiagram}>this nice diagram</HrefLink>.
         </p>
         <h3>Image Link</h3>
         <p>
            Image links take the caller to Sequence's diagram rendering service
            and gives them a brand new image. These links can be embedded as the{' '}
            <Code>src</Code> attribute in an <Code>img</Code> element. Have{' '}
            <HrefLink to={someNonsense}>some nonsense</HrefLink> as an example.
         </p>
         <h2>Contributing</h2>
         <p>
            Any contributions, including bug reports, will soon be welcomed at
            the public GitHub repository for Sequence.
         </p>
      </Article>
   );
};
