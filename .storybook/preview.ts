import type { Preview } from '@storybook/react';
import '../outputs/Pages/pages.css';
import { setLocale } from '../outputs/i18n';

void setLocale('pt-BR');

// Apply the kiosk interaction rule to every rendered application page, including
// browser previews where Electron's native webContents protection is unavailable.
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
}, { capture: true });

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
};

export default preview;
