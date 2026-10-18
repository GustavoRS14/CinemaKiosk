import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { NestedWrapper } from './NestedWrapper';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof NestedWrapper> = {
  title: 'Admin/NestedWrapper',
  component: NestedWrapper,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    title: { control: 'text' },
    showTitle: { control: 'boolean' },
    list: { control: 'object' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof NestedWrapper>;

export const Playground: Story = {
  args: {
    title: 'O que há de novo:',
    showTitle: true,
    list: ['Melhoria na velocidade do sistema', 'Correção de bugs na seleção de assentos', 'Novos métodos de pagamento'],
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    title: 'O que há de novo:',
    showTitle: true,
    list: ['Melhoria na velocidade do sistema', 'Correção de bugs na seleção de assentos', 'Novos métodos de pagamento'],
  },
};
