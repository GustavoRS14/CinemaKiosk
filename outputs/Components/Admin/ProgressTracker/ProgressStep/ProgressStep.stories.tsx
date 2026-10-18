import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProgressStep } from './ProgressStep';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';

const meta: Meta<typeof ProgressStep> = {
  title: 'Admin/ProgressTracker/ProgressStep/ProgressStep',
  component: ProgressStep,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    state: {
      control: 'select',
      options: ['Current', 'Not Reached', 'Complete'],
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    showDivider: {
      control: 'boolean',
    },
    stepNumber: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressStep>;

export const Playground: Story = {
  args: {
    state: 'Current',
    stepNumber: '1',
    label: 'Passo',
    orientation: 'vertical',
    showDivider: true,
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '2rem' }}>
      <ProgressStep state="Complete" stepNumber="1" label="Passo 1" showDivider={true} />
      <ProgressStep state="Current" stepNumber="2" label="Passo 2" showDivider={true} />
      <ProgressStep state="Not Reached" stepNumber="3" label="Passo 3" showDivider={false} />
    </div>
  ),
};

export const DarkTheme: Story = {
  args: {
    state: 'Current',
    stepNumber: '1',
    label: 'Passo',
    orientation: 'vertical',
    showDivider: true,
  },
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
};
