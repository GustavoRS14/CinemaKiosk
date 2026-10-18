import type { Meta, StoryObj } from '@storybook/react';

import React from 'react';
import placeholder from '@images/placeholder.png';
import { Notification } from './Notification';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/Notification',
  component: Notification,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  args: {
    badge: 'Added',
    imageUrl: placeholder,
    price: '160,00',
    productName: 'Copo de Refrigerante 1000ml',
    quantity: '1',
    title: undefined,
  },
  argTypes: {
    badge: { control: 'inline-radio', options: ['Added', 'Removed'] },
    imageUrl: {
      control: 'select',
      options: ['Placeholder'],
      mapping: { Placeholder: placeholder },
    },
    price: { control: 'text' },
    productName: { control: 'text' },
    quantity: { control: 'text' },
    title: { control: 'text' },
  },
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=5053-15548',
    },
  },
} satisfies Meta<typeof Notification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Added: Story = { args: {
  badge: 'Added',
  imageUrl: "Placeholder"
} };
export const Removed: Story = { args: { badge: 'Removed' } };

export const DarkTheme: Story = {
  decorators: [(Story) => <StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>],
};
