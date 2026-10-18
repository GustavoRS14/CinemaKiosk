import type { StorybookConfig } from '@storybook/react-vite';
import svgr from 'vite-plugin-svgr';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../outputs/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.plugins = [...(config.plugins ?? []), svgr({
      include: ['**/*.svg', '**/*.svg?react'],
    })];
    config.server = config.server || {};
    config.server.watch = {
      ...(config.server.watch || {}),
      ignored: ['**/* - Copy/**', '**/build/**', '**/release/**', '**/.git/**']
    };
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd()),
      '@icons': path.resolve(process.cwd(), 'Assets/Icons'),
      '@asset-icons': path.resolve(process.cwd(), 'Assets/Icons'),
      '@images': path.resolve(process.cwd(), 'outputs/Assets/Images'),
      '@project-images': path.resolve(process.cwd(), 'Assets/Images'),
      '@illustrations': path.resolve(process.cwd(), 'Assets/Illustrations'),
      '@components': path.resolve(process.cwd(), 'outputs/Components')
    };
    return config;
  },
};

export default config;
