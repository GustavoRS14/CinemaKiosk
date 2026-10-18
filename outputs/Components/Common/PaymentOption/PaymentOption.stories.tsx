import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { PaymentOption } from './PaymentOption';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import PixIcon from '@icons/pix.svg';

const meta: Meta<typeof PaymentOption> = {
  title: 'Components/PaymentOption',
  component: PaymentOption,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
};

export default meta;
type Story = StoryObj<typeof PaymentOption>;

export const Playground: Story = {
  args: {
    title: 'Meio de pagamento',
    description: 'Descrição',
    icon: <PixIcon />,
  },
};

export const DarkTheme: Story = {
  args: {
    title: 'Meio de pagamento',
    description: 'Descrição',
    icon: <PixIcon />,
  },
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
};
