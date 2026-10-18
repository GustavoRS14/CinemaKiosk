import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { SelectionCard } from './SelectionCard';

const meta = {
  title: 'Components/SelectionCard',
  component: SelectionCard,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['Default', 'Disabled', 'Read Only'],
    },
    textSize: {
      control: 'radio',
      options: ['lg', 'sm'],
    },
    textWeight: {
      control: 'select',
      options: ['Medium', 'Semibold', 'Bold'],
    },
  },
} satisfies Meta<typeof SelectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    state: 'Default',
    textSize: 'lg',
    textWeight: 'Semibold',
  },
};

export const DarkTheme: Story = {
  args: {
    ...Playground.args,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};
