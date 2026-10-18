import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { NestedSelectionGroup } from './NestedSelectionGroup';

const meta = {
  title: 'Admin/NestedSelectionGroup',
  component: NestedSelectionGroup,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story/>
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    groupTitle: { control: 'text' },
    state: {
      control: 'select',
      options: ['Default', 'Read Only', 'Disabled'],
    },
  },
} satisfies Meta<typeof NestedSelectionGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    groupTitle: 'Título do grupo',
    state: 'Default',
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

export const Disabled: Story = {
  args: {
    ...Playground.args,
    state: 'Disabled',
  },
};
