import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import placeholder from '@images/placeholder.png';
import { OrderItem } from './OrderItem';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/OrderItem',
  component: OrderItem,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  args: {
    context: 'Notification',
    imageUrl: placeholder,
    quantity: '1',
    productName: 'Balde 1 Minions + Pipoca',
    price: '160,00',
    action: true,
  },
  argTypes: {
    context: {
      control: 'inline-radio',
      options: ['Notification', 'Summary'],
    },
    imageUrl: {
      control: 'select',
      options: ['Placeholder'],
      mapping: { Placeholder: placeholder },
    },
    quantity: { control: 'text' },
    productName: { control: 'text' },
    price: { control: 'text' },
    action: { control: 'boolean' },
  },
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=5487-17739',
    },
  },
} satisfies Meta<typeof OrderItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ContextSummary: Story = {
  args: {
    context: 'Summary',
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => <StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>],
};
