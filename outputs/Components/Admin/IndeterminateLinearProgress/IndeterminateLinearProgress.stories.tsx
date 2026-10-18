import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { IndeterminateLinearProgress } from './IndeterminateLinearProgress';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Admin/IndeterminateLinearProgress',
  component: IndeterminateLinearProgress,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A highly scalable, performant indeterminate linear progress indicator. It uses native CSS keyframe animations powered by hardware-accelerated transforms (`translateX`) instead of relying on frame-by-frame implementation. Strict decoupling from design tokens ensures it relies entirely on injected CSS variables.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Optional custom CSS class name applied to the container.',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessibility label for the progress indicator.',
      table: {
        defaultValue: { summary: 'Loading...' },
      },
    },
  },
} satisfies Meta<typeof IndeterminateLinearProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Loading data',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <div style={{ width: '400px', maxWidth: '100%', padding: '24px' }}>
          <Story />
        </div>
      </StoryTokenCanvas>
    ),
  ],
};

export const DarkTheme: Story = {
  args: {
    'aria-label': 'Loading data',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <div style={{ width: '400px', maxWidth: '100%', padding: '24px' }}>
          <Story />
        </div>
      </StoryTokenCanvas>
    ),
  ],
};
