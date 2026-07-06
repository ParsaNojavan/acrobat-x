export {};

declare global {
  interface Window {
    electronAPI: {
      pickPDF: () => Promise<{
        path: string;
        url: string;
      } | null>;
      showMessageBox: (message?: string) => Promise<boolean>;
    };
  }
}
