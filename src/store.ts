const diagramKey = 'seq-diagram';

export const setCachedDiagram = (code: string) => {
   localStorage.setItem(diagramKey, code);
};

export const getCachedDiagram = (): string | undefined => {
   return localStorage.getItem(diagramKey) || undefined;
};
