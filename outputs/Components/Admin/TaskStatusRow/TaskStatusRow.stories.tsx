import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { TaskStatusRow } from './TaskStatusRow';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Admin/TaskStatusRow',
  component: TaskStatusRow,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <div style={{ width: '902px', maxWidth: '100%' }}>
          <Story />
        </div>
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showCancelButton: { control: 'boolean' },
    showStepIndicator: { control: 'boolean' },
    showTitleSuffix: { control: 'boolean' },
  },
} satisfies Meta<typeof TaskStatusRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: 'Título',
    titleSuffix: 'Sufixo',
    description: 'Descrição',
    percentage: '50',
    currentStep: '1',
    totalSteps: '2',
    showCancelButton: true,
    showStepIndicator: true,
    showTitleSuffix: true,
  },
};

export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    theme: 'dark',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <div style={{ width: '902px', maxWidth: '100%' }}>
          <Story />
        </div>
      </StoryTokenCanvas>
    ),
  ],
  args: {
    ...Playground.args,
    percentage: '100',
    currentStep: '2',
    showTitleSuffix: true,
    showCancelButton: false,
  },
};
