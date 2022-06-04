# Features

-  build home page layout
-  add some form of help/a prototype drawer
-  build 404 page
-  on first edit after loading from url clear the urlCode parameter
-  think of a way to save/load unique diagrams within the browser
   -  flatten nested paths to strings and store in single hash map (S3)?
   -  file drawer
-  add notes
   -  left, right, over [...],
-  add blocks
   -  alt, opt, loop.
-  add parallel
   -  nested serial blocks to order signals within a parallel
      -  arbitrary nesting?
-  change delay syntax to an attribute

# Bugs

-  fix bug where self-signal label extending to the right of a diagram is unaccounted for and cut off. sequence.
-  blue focus ring for div with tabindex of -1, cannot be disabled with focus:ring-0. tailwindcss forms.
-  cannot use h-[calc(100vh-xrem)], does not get calculated. tailwindcss.
