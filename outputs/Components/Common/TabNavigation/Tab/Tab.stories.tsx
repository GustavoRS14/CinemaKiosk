import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tab } from './Tab';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';

const meta = {
  title: 'Components/TabNavigation/Tab',
  component: Tab,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
    type: {
      control: 'select',
      options: ['Default', 'Underline'],
      description: 'The visual variant of the tab.',
    },
    selected: {
      control: 'boolean',
      description: 'The selection state of the tab.',
    },
    state: {
      control: 'select',
      options: ['Default', 'Disabled', 'Read Only'],
      description: 'The interactive state of the tab.',
    },
    text: {
      control: 'text',
      description: 'The text displayed inside the tab.',
    },
  },
} satisfies Meta<typeof Tab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    selected: false,
    state: 'Default',
    text: 'Texto',
  },
};

export const Selected: Story = {
  args: {
    selected: true,
    state: 'Default',
    text: 'Texto',
  },
};

export const DarkTheme: Story = {
  args: {
    selected: true,
    state: 'Default',
    text: 'Texto',
  },
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
};

export const UnderlineType: Story = {
  args: {
    selected: true,
    type: 'Underline',
    state: 'Default',
    text: 'Texto',
  },
};
