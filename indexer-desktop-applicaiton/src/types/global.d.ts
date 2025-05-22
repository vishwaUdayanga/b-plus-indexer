export {};

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: string, data: any): void;
        on(channel: string, listener: (event: any, ...args: any[]) => void): void;
        invoke(channel: string, ...args: any[]): Promise<any>;
      };
    };
  }
}
