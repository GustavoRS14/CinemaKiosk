import type { Meta, StoryObj } from '@storybook/react';
import { TicketOption } from './TicketOption';
import React from 'react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/TicketOption',
  component: TicketOption,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story/>
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'text' },
    price: { control: 'text' },
    supportingText: { control: 'text' },
    amount: { control: 'number' },
    counterState: {
      control: 'select',
      options: ['Minimum', 'Default', 'Maximum', 'Disabled'],
    },
    onAmountChange: { action: 'amount changed' },
  },
} satisfies Meta<typeof TicketOption>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Playground
export const Playground: Story = {
  args: {
    type: 'Tipo',
    price: '40,00',
    supportingText: 'Texto de suporte',
    amount: 0,
    counterState: "Minimum",
  },
};

// 2. Dark Theme Playground
export const DarkTheme: Story = {
  args: {
    ...Playground.args,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    theme: 'dark',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};

// 3. Variant: Counter at Minimum
export const MinimumAmount: Story = {
  args: {
    type: 'Inteira',
    price: '80,00',
    supportingText: 'Válido para 1 pessoa',
    amount: 0,
    counterState: 'Minimum',
  },
};

// 4. Variant: Counter at Maximum
export const MaximumAmount: Story = {
  args: {
    type: 'Meia Entrada',
    price: '40,00',
    supportingText: 'Obrigatório apresentação de carteirinha',
    amount: 10,
    counterState: 'Maximum',
  },
};

// 5. Variant: Disabled
export const Disabled: Story = {
  args: {
    type: 'Esgotado',
    price: '-',
    supportingText: 'Ingressos esgotados',
    amount: 0,
    counterState: 'Disabled',
  },
};
