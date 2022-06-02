// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars, no-undef
const tailwindcss = require('tailwindcss');

// eslint-disable-next-line no-undef
module.exports = {
   content: ['./src/**/*.{js,jsx,ts,tsx}'],
   theme: {
      extend: {},
   },
   // eslint-disable-next-line no-undef
   plugins: [
      // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
      require('@tailwindcss/forms')({
         strategy: 'class',
      }),
   ],
};
