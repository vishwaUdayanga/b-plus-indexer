export async function getBaseUrl(): Promise<string | null> {
  if (typeof window !== 'undefined' && window.electron) {
    return await window.electron.ipcRenderer.invoke('get-base-url') as string | null;
  }
  return null;
}

export async function setBaseUrl(url: string): Promise<void> {
  if (typeof window !== 'undefined' && window.electron) {
    await window.electron.ipcRenderer.invoke('set-base-url', url);
  }
}
