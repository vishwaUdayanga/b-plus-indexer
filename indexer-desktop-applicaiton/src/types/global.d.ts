export {};

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: string, data: unknown): void;
        on(channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): void;
        invoke(channel: string, ...args: unknown[]): Promise<unknown>;
      };
    };
  }
}
