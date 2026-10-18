import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ModalFooter } from './ModalFooter';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/ModalFooter',
  component: ModalFooter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
    hasProductActionBar: {
      control: 'boolean',
      description: 'Whether to show the ProductActionBar.',
    },
    showTotalPrice: {
      control: 'boolean',
      description: 'Whether to show the total price section.',
    },
    secondaryAction: {
      control: 'boolean',
      description: 'Whether to show the secondary action button.',
    },
    price: {
      control: 'text',
      description: 'The price value to display.',
    },
    layout: {
      control: 'radio',
      options: ['default', 'cart'],
    },
    showDiscount: {
      control: 'boolean',
    },
    itemCount: {
      control: { type: 'number', min: 0 },
      description: 'Quantidade total usada no texto fixo Subtotal (n Item/Itens).',
    },
  },
} satisfies Meta<typeof ModalFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    hasProductActionBar: false,
    showTotalPrice: true,
    secondaryAction: true,
    price: '160,00',
  },
};

export const DarkTheme: Story = {
  args: {
    hasProductActionBar: false,
    showTotalPrice: true,
    secondaryAction: false,
    price: '160,00',
  },
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
};

export const ConcessionCartWithDiscount: Story = {
  args: {
    layout: 'cart',
    itemCount: 4,
    subtotalPrice: '800,00',
    showDiscount: true,
    discountLabel: 'Oferta Especial de Combo',
    discountPrice: '30,00',
    showTotalPrice: true,
    price: '770,00',
    primaryLabel: 'Pagar Pedido',
  },
};

export const ConcessionCartWithoutDiscount: Story = {
  args: {
    layout: 'cart',
    itemCount: 4,
    subtotalPrice: '800,00',
    showDiscount: false,
    showTotalPrice: true,
    price: '800,00',
    primaryLabel: 'Pagar Pedido',
  },
};
