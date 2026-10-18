const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const WINDOW_MODE_CHANNEL = 'totem:window-mode';
const ONBOARDING_COMPLETE_CHANNEL = 'totem:onboarding-complete';
const UPDATE_TENANT_ICON_CHANNEL = 'totem:update-tenant-icon';
const ONBOARDING_STATE_FILE = 'onboarding-state.json';
const PRODUCT_NAME = 'Totem Cinema';
const ICON_SIZES = [16, 24, 32, 48, 64, 128, 256];

let mainWindow;
let onboardingWasCompleteAtLaunch = false;

const normalizeName = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '').toLowerCase();

function defaultIconPath() {
  return path.join(app.getAppPath(), 'build', 'ApplicationLogo.ico');
}

async function createIco(source, destination) {
  const sourceBuffer = fs.readFileSync(source);
  const images = await Promise.all(ICON_SIZES.map((size) => sharp(sourceBuffer)
    .resize(size, size, { fit: 'contain' })
    .png()
    .toBuffer()));
  const header = Buffer.alloc(6 + (images.length * 16));
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((image, index) => {
    const entry = 6 + (index * 16);
    const size = ICON_SIZES[index];
    header.writeUInt8(size === 256 ? 0 : size, entry);
    header.writeUInt8(size === 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, Buffer.concat([header, ...images]));
}

function findTenantCompactAsset(tenant) {
  const brandRoot = path.join(app.getAppPath(), 'Assets', 'BrandLogo');
  if (!fs.existsSync(brandRoot)) return undefined;
  const tenantDirectory = fs.readdirSync(brandRoot, { withFileTypes: true })
    .find((entry) => entry.isDirectory() && normalizeName(entry.name) === normalizeName(tenant));
  if (!tenantDirectory) return undefined;
  const directory = path.join(brandRoot, tenantDirectory.name);
  const asset = fs.readdirSync(directory, { withFileTypes: true }).find((entry) => (
    entry.isFile()
    && normalizeName(path.parse(entry.name).name) === normalizeName('Standard_Compact')
    && ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif'].includes(path.extname(entry.name).toLowerCase())
  ));
  return asset ? path.join(directory, asset.name) : undefined;
}

function shortcutPaths() {
  const name = `${PRODUCT_NAME}.lnk`;
  return [
    path.join(app.getPath('desktop'), name),
    path.join(app.getPath('appData'), 'Microsoft', 'Internet Explorer', 'Quick Launch', 'User Pinned', 'TaskBar', name),
  ];
}

async function resolveTenantIcon(tenant) {
  const asset = tenant ? findTenantCompactAsset(tenant) : undefined;
  if (!asset) return defaultIconPath();
  const destination = path.join(app.getPath('userData'), 'icons', `${normalizeName(tenant)}.ico`);
  await createIco(asset, destination);
  return destination;
}

async function updateWindowsShortcuts(tenant) {
  if (process.platform !== 'win32' || !app.isPackaged) return false;
  const icon = await resolveTenantIcon(tenant);
  const details = {
    target: process.execPath,
    cwd: path.dirname(process.execPath),
    description: PRODUCT_NAME,
    icon,
    iconIndex: 0,
    appUserModelId: 'com.totem.cinema',
  };
  for (const shortcut of shortcutPaths()) {
    fs.mkdirSync(path.dirname(shortcut), { recursive: true });
    shell.writeShortcutLink(shortcut, fs.existsSync(shortcut) ? 'replace' : 'create', details);
  }
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setIcon(icon);
  return true;
}

function onboardingStatePath() {
  return path.join(app.getPath('userData'), ONBOARDING_STATE_FILE);
}

function readOnboardingComplete() {
  try {
    const state = JSON.parse(fs.readFileSync(onboardingStatePath(), 'utf8'));
    return state.completed === true;
  } catch {
    return false;
  }
}

function persistOnboardingComplete() {
  fs.writeFileSync(onboardingStatePath(), JSON.stringify({ completed: true }), 'utf8');
}

function applyKioskMode(window) {
  if (!window || window.isDestroyed()) return;
  window.setResizable(false);
  window.setMinimizable(false);
  window.setMaximizable(false);
  window.setClosable(false);
  window.setSkipTaskbar(true);
  window.setMenuBarVisibility(false);
  window.setAlwaysOnTop(true, 'screen-saver');
  window.setFullScreen(true);
  window.setKiosk(true);
}

function applyOnboardingMode(window) {
  if (!window || window.isDestroyed()) return;
  window.setKiosk(false);
  window.setFullScreen(false);
  window.setAlwaysOnTop(false);
  window.setSkipTaskbar(false);
  window.setResizable(true);
  window.setMinimizable(true);
  window.setMaximizable(true);
  window.setClosable(true);
  window.setMenuBarVisibility(false);
  if (window.isMaximized()) window.unmaximize();
  window.setSize(1280, 800);
  window.center();
}

function applyWindowMode(window, requestedMode) {
  const shouldUseKiosk = requestedMode === 'kiosk'
    || (requestedMode === 'onboarding-update' && onboardingWasCompleteAtLaunch);
  if (shouldUseKiosk) applyKioskMode(window);
  else applyOnboardingMode(window);
}

async function loadRenderer(window) {
  const developmentUrl = process.env.ELECTRON_RENDERER_URL || process.env.VITE_DEV_SERVER_URL;
  if (developmentUrl) {
    await window.loadURL(developmentUrl);
    return;
  }

  const rendererCandidates = [
    path.join(app.getAppPath(), 'dist', 'index.html'),
    path.join(app.getAppPath(), 'storybook-static', 'index.html'),
  ];
  const rendererFile = rendererCandidates.find((candidate) => fs.existsSync(candidate));
  if (rendererFile) {
    await window.loadFile(rendererFile);
    return;
  }

  await window.loadURL('http://127.0.0.1:6006');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    frame: true,
    autoHideMenuBar: true,
    backgroundColor: '#FFFFFF',
    icon: path.join(app.getAppPath(), 'build', 'ApplicationLogo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // A terminal that has never completed setup starts in a normal window.
  // Subsequent launches start locked in kiosk mode.
  applyWindowMode(mainWindow, onboardingWasCompleteAtLaunch ? 'kiosk' : 'onboarding');

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const key = input.key.toLowerCase();
    const blockedKioskShortcut = mainWindow?.isKiosk() && (
      key === 'f11'
      || key === 'escape'
      || (input.alt && ['f4', 'tab', 'space'].includes(key))
      || (input.meta && key === 'd')
    );
    if (blockedKioskShortcut) event.preventDefault();
  });

  // Never expose Chromium's native context menu in the kiosk application.
  mainWindow.webContents.on('context-menu', (event) => {
    event.preventDefault();
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  void loadRenderer(mainWindow);
}

function enableWindowsStartup() {
  if (process.platform !== 'win32' || !app.isPackaged) return;
  app.setLoginItemSettings({
    openAtLogin: true,
    path: process.execPath,
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.totem.cinema');
  onboardingWasCompleteAtLaunch = readOnboardingComplete();
  enableWindowsStartup();

  ipcMain.on(WINDOW_MODE_CHANNEL, (event, mode) => {
    if (!['kiosk', 'onboarding', 'onboarding-update'].includes(mode)) return;
    applyWindowMode(BrowserWindow.fromWebContents(event.sender), mode);
  });
  ipcMain.handle(ONBOARDING_COMPLETE_CHANNEL, () => {
    persistOnboardingComplete();
    return true;
  });
  ipcMain.handle(UPDATE_TENANT_ICON_CHANNEL, (_event, tenant) => (
    updateWindowsShortcuts(typeof tenant === 'string' ? tenant : undefined)
  ));

  createWindow();
  void updateWindowsShortcuts();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
