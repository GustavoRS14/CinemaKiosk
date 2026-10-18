import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { OptionListItem } from './OptionListItem';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';

const meta: Meta<typeof OptionListItem> = {
  title: 'Components/ModifierGroup/OptionListItem',
  component: OptionListItem,
  decorators: [(Story) => (<StoryTokenCanvas><div style={{ width: '700px' }}><Story /></div></StoryTokenCanvas>)],
  argTypes: {
    additionalPrice: { control: 'boolean' },
    currentPrice: { control: 'text' },
    originalPrice: { control: 'text' },
    productName: { control: 'text' },
    showOriginalPrice: { control: 'boolean' },
    defaultValue: { control: 'number' },
    state: {
      control: 'select',
      options: ['Default', 'Disabled'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof OptionListItem>;

export const Playground: Story = {
  args: {
    additionalPrice: true,
    currentPrice: '160,00',
    originalPrice: 'R$ 160,00',
    productName: 'Nome do Produto',
    showOriginalPrice: true,
    defaultValue: 0,
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><div style={{ width: '700px' }}><Story /></div></StoryTokenCanvas>)],
  args: {
    ...Playground.args,
  },
};

export const Disabled: Story = {
  args: {
    ...Playground.args,
    state: 'Disabled',
  },
};
