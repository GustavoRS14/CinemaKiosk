import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StepIndicator } from './StepIndicator';
import { StoryTokenCanvas } from '../../../../../StoryTokenCanvas';

const meta = {
  title: 'Admin/ProgressTracker/ProgressStep/StepIndicator/StepIndicator',
  component: StepIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    state: {
      control: 'select',
      options: ['Current', 'Completed', 'Not Reached'],
      description: 'The visual state of the step indicator.',
    },
    step: {
      control: 'text',
      description: 'The step number to display.',
    },
  },
} satisfies Meta<typeof StepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    state: 'Current',
    step: '1',
  },
};

export const DarkTheme: Story = {
  args: {
    state: 'Current',
    step: '1',
  },
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
};
