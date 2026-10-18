import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { ProgressBar } from './ProgressBar';
import React from 'react';

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <div style={{ width: '480px', maxWidth: '100%' }}>
          <Story/>
        </div>
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'The progress percentage (0-100).',
    },
    intent: {
      control: 'select',
      options: ['Primary', 'Information'],
      description: 'The visual color scheme of the progress bar.',
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Playground
export const Playground: Story = {
  args: {
    progress: 50,
    intent: 'Primary',
  },
};

// 2. Information Intent
export const InformationIntent: Story = {
  args: {
    progress: 75,
    intent: 'Information',
  },
};

// 3. Dark Theme
export const DarkTheme: Story = {
  args: {
    ...Playground.args,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    theme: 'dark',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};

// 4. Variant Stories (Light Theme)
export const ProgressZero: Story = {
  args: {
    progress: 0,
    intent: 'Primary',
  },
};

export const ProgressHalf: Story = {
  args: {
    progress: 50,
    intent: 'Primary',
  },
};

export const ProgressFull: Story = {
  args: {
    progress: 100,
    intent: 'Primary',
  },
};
