require('tailwindcss');

module.exports = {
   content: ['./src/**/*.{ts,tsx}', './public/index.html'],
   theme: {
      extend: {},
   },
   plugins: [
      require('@tailwindcss/forms')({
         strategy: 'class',
      }),
      require('@tailwindcss/typography'),
   ],
};
