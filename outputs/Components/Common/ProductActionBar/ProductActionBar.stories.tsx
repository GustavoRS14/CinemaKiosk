import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProductActionBar } from './ProductActionBar';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/ProductActionBar',
  component: ProductActionBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
    productName: {
      control: 'text',
      description: 'The name of the product displayed.',
    },
  },
} satisfies Meta<typeof ProductActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    productName: 'Balde 1 Minions + Pipoca',
  },
};

export const DarkTheme: Story = {
  args: {
    productName: 'Balde 1 Minions + Pipoca',
  },
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
};
