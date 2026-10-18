import type { Meta, StoryObj } from '@storybook/react';
import { SelectionTile } from './SelectionTile';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import React from 'react';
import { LocaleAvatar } from '../../Admin/LocaleAvatar';

const meta = {
  title: 'Components/SelectionTile',
  component: SelectionTile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
    borderRadius: {
      control: 'radio',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    state: {
      control: 'radio',
      options: ['Default', 'Disabled', 'ReadOnly'],
    },
    defaultSelected: {
      control: 'boolean',
    },
    text: {
      control: 'text',
    },
    slotContent: {
      control: 'text', // UI control fallback for ReactNode
    }
  },
} satisfies Meta<typeof SelectionTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    borderRadius: 'md',
    defaultSelected: false,
    state: 'Default',
    text: 'Texto',
    slotContent: <LocaleAvatar />, // Blindly injected dependency!
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
  args: {
    ...Playground.args,
  },
};

export const Selected: Story = {
  args: {
    ...Playground.args,
    defaultSelected: true,
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
    state: 'ReadOnly',
  },
};

export const ReadOnlySelected: Story = {
  args: {
    ...Playground.args,
    state: 'ReadOnly',
    defaultSelected: true,
  },
};
