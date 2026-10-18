const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('totemDesktop', {
  setWindowMode(mode) {
    if (!['kiosk', 'onboarding', 'onboarding-update'].includes(mode)) return;
    ipcRenderer.send('totem:window-mode', mode);
  },
  markOnboardingComplete() {
    return ipcRenderer.invoke('totem:onboarding-complete');
  },
  updateTenantIcon(tenant) {
    return ipcRenderer.invoke('totem:update-tenant-icon', tenant);
  },
});
