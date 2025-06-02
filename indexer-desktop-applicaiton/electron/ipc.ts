import { ipcMain } from 'electron';

export async function initializeIpcStore() {
  const StoreModule = await import('electron-store');
  const Store = StoreModule.default;
  const store = new Store();

  ipcMain.handle('get-base-url', () => {
    return store.get('baseUrl') || null;
  });

  ipcMain.handle('set-base-url', (_event, url: string) => {
    store.set('baseUrl', url);
  });
}
