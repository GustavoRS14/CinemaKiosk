import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProgressTracker } from './ProgressTracker';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof ProgressTracker> = {
  title: 'Admin/ProgressTracker/ProgressTracker',
  component: ProgressTracker,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    currentStep: {
      control: { type: 'number', min: 1, max: 4 }
    },
    onCancelInstallation: {
      action: 'cancel installation'
    }
  }
};

export default meta;
type Story = StoryObj<typeof ProgressTracker>;

export const Playground: Story = {
  args: {
    orientation: 'vertical',
    currentStep: 1
  }
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    orientation: 'vertical',
    currentStep: 4
  }
};
