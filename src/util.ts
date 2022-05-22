export const debounce = <V>(callback: (arg: V) => void, wait: number) => {
    let timeout: NodeJS.Timeout;

    return (arg: V) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback.apply(this, [arg]), wait);
    };
};