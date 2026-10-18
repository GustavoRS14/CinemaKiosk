import React from 'react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import type { Meta, StoryObj } from '@storybook/react';
import { SelectionIndicator } from './SelectionIndicator';

const meta: Meta<typeof SelectionIndicator> = {
  title: 'Components/SelectionIndicator',
  component: SelectionIndicator,
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
    selected: {
      control: 'boolean',
    },
    state: {
      control: 'select',
      options: ['Default', 'Pressed', 'Read Only', 'Disabled'],
    },
  },
  args: {
    selected: false,
    state: 'Default',
  },
};

export default meta;
type Story = StoryObj<typeof SelectionIndicator>;

export const Playground: Story = {};

export const DarkTheme: Story = {
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

export const Selected: Story = {
  args: {
    selected: true,
  },
};

export const DisabledUnselected: Story = {
  args: {
    state: 'Disabled',
    selected: false,
  },
};

export const DisabledSelected: Story = {
  args: {
    state: 'Disabled',
    selected: true,
  },
};

export const ReadOnlyUnselected: Story = {
  args: {
    state: 'Read Only',
    selected: false,
  },
};

export const ReadOnlySelected: Story = {
  args: {
    state: 'Read Only',
    selected: true,
  },
};
