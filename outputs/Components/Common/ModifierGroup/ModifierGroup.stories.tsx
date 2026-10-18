import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ModifierGroup } from './ModifierGroup';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof ModifierGroup> = {
  title: 'Components/ModifierGroup/ModifierGroup',
  component: ModifierGroup,
  decorators: [(Story) => (<StoryTokenCanvas><div style={{ width: '750px' }}><Story /></div></StoryTokenCanvas>)],
  argTypes: {
    title: { control: 'text' },
    requirementStatus: {
      control: 'radio',
      options: ['Incomplete', 'Complete'],
    },
    requirementCount: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof ModifierGroup>;

const mockItems = [
  {
    productName: 'Produto 1',
    currentPrice: '15,00',
    originalPrice: 'R$ 20,00',
    showOriginalPrice: true,
    additionalPrice: true,
    defaultValue: 0,
  },
  {
    productName: 'Produto 2 (Sem preço original)',
    currentPrice: '10,00',
    showOriginalPrice: false,
    additionalPrice: true,
    defaultValue: 1,
  },
  {
    productName: 'Produto 3 (Incluso)',
    additionalPrice: false,
    defaultValue: 0,
  },
];

export const Playground: Story = {
  args: {
    title: 'Categoria',
    requirementStatus: 'Incomplete',
    requirementCount: 1,
    items: mockItems,
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><div style={{ width: '750px' }}><Story /></div></StoryTokenCanvas>)],
  args: {
    ...Playground.args,
  },
};
