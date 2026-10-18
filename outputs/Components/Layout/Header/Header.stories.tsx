import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    context: {
      control: 'radio',
      options: ['Customer', 'Admin'],
    },
    type: {
      control: 'radio',
      options: ['Default', 'Purchase', 'Offline'],
    },
    date: { control: 'text' },
    time: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Playground: Story = {
  args: {
    context: 'Customer',
    type: 'Default',
    date: "",
    time: "",
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    context: 'Customer',
    type: 'Default',
    date: 'Segunda, 20 de Julho',
    time: '16:00',
  },
};

export const AdminContext: Story = {
  args: {
    context: 'Admin',
    type: 'Default',
    date: 'Segunda, 20 de Julho',
    time: '16:00',
  },
};

export const Purchase: Story = {
  args: {
    context: 'Customer',
    type: 'Purchase',
    date: 'Segunda, 20 de Julho',
    time: '16:00',
  },
};
