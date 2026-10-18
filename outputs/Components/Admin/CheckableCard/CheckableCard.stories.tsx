import React from 'react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import type { Meta, StoryObj } from '@storybook/react';
import { CheckableCard } from './CheckableCard';

const meta = {
  title: 'Admin/CheckableCard',
  component: CheckableCard,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story/>
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    bottomText: { control: 'text' },
    selected: { control: 'boolean' },
    state: {
      control: 'radio',
      options: ['Default', 'Disabled', 'Read Only'],
    },
  },
} satisfies Meta<typeof CheckableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: 'Título',
    description: 'Descrição',
    bottomText: 'Texto Inferior',
    tagProps: { text: 'Status', status: 'Neutral', state: 'Default' },
    selected: false,
    state: 'Default',
  },
};

export const Selected: Story = {
  args: {
    ...Playground.args,
    selected: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Playground.args,
    state: 'Disabled',
  },
};

export const ReadOnly: Story = {
  args: {
    ...Playground.args,
    state: 'Read Only',
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
        <Story/>
      </StoryTokenCanvas>
    ),
  ],
};
