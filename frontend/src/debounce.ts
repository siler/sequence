/**
 * create a debounce function. delays invoking the callback until it hasn't
 * been called for msWait milliseconds.
 */
export const debounce = <V>(msWait: number, callback: (arg: V) => void) => {
   let timeout: number;

   return (arg: V) => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => callback.apply(this, [arg]), msWait);
   };
};
