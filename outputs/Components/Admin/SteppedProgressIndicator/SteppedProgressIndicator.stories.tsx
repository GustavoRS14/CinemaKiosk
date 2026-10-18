import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SteppedProgressIndicator } from './SteppedProgressIndicator';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Admin/SteppedProgressIndicator',
  component: SteppedProgressIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
    progress: {
      control: 'select',
      options: ['0', '25', '50', '75', '100'],
      description: 'The progress percentage of the current step.',
    },
    step: {
      control: 'text',
      description: 'The current step number.',
    },
  },
} satisfies Meta<typeof SteppedProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    progress: '0',
    step: '1',
  },
};

export const DarkTheme: Story = {
  args: {
    progress: '0',
    step: '1',
  },
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
};
