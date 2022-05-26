/**
 * create a debounce function delays invoking the callback until it hasn't
 * been called for msWait milliseconds.
 */
export const debounce = <V>(callback: (arg: V) => void, msWait: number) => {
   let timeout: NodeJS.Timeout;

   return (arg: V) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => callback.apply(this, [arg]), msWait);
   };
};
