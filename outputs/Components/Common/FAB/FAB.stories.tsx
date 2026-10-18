import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { FAB } from './FAB';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/FAB',
  component: FAB,
  decorators: [(Story) => <StoryTokenCanvas><div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Story /></div></StoryTokenCanvas>],
  args: {
    status: 'Empty',
    quantity: '1',
    itemNotification: false,
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['Empty', 'With Product'],
    },
    quantity: { control: 'text' },
    itemNotification: { control: 'boolean' },
    onClick: { action: 'onClick' },
  },
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=5053-15552',
    },
  },
} satisfies Meta<typeof FAB>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithProduct: Story = {
  args: {
    status: 'With Product',
    quantity: '3',
  },
};

export const WithNotification: Story = {
  args: {
    status: 'Empty',
    itemNotification: true,
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => <StoryTokenCanvas theme="Dark"><div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Story /></div></StoryTokenCanvas>],
  args: {
    status: 'With Product',
    itemNotification: true,
  },
};
