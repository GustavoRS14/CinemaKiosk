import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from './LoadingSpinner';

const meta = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the spinner.',
    },
    intent: {
      control: 'radio',
      options: ['Primary', 'Neutral', 'Inverse'],
      description: 'The visual intent/color of the spinner.',
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: 'md',
    intent: 'Primary',
  },
};

export const Neutral: Story = {
  args: {
    size: 'md',
    intent: 'Neutral',
  },
};

export const Inverse: Story = {
  args: {
    size: 'md',
    intent: 'Inverse',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <LoadingSpinner size="sm" />
      <LoadingSpinner size="md" />
      <LoadingSpinner size="lg" />
    </div>
  ),
};
