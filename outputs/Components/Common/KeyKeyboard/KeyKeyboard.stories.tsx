import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { KeyKeyboard } from './KeyKeyboard';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/KeyKeyboard',
  component: KeyKeyboard,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  args: {
    children: '1',
    icon: false,
    intent: 'Default',
    state: 'Default',
    surface: 'Tertiary',
  },
  argTypes: {
    intent: {
      control: 'radio',
      options: ['Default', 'Destructive'],
    },
    state: {
      control: 'radio',
      options: ['Default', 'Pressed', 'Disabled'],
    },
    surface: {
      control: 'radio',
      options: ['Tertiary', 'Secondary'],
    },
    onClick: { action: 'onClick' },
  },
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=5348-52184',
    },
  },
} satisfies Meta<typeof KeyKeyboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithIcon: Story = {
  args: {
    icon: true,
  },
};

export const SecondarySurface: Story = {
  args: {
    surface: 'Secondary',
    children: '2',
  },
};

export const Destructive: Story = {
  args: {
    intent: 'Destructive',
    icon: true,
  },
};

export const Disabled: Story = {
  args: {
    state: 'Disabled',
    children: '3',
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => <StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>],
};
