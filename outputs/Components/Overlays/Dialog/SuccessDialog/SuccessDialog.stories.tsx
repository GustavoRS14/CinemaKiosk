import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../../../StoryTokenCanvas';
import { SuccessDialog } from './SuccessDialog';

const meta = {
  title: 'Overlays/Dialog/SuccessDialog',
  component: SuccessDialog,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['payment-confirmed', 'order-found', 'order-sent', 'order-sent-retry'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SuccessDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PaymentConfirmed: Story = {
  args: {
    variant: 'payment-confirmed',
    size: 'md',
  },
};

export const OrderFound: Story = {
  args: {
    variant: 'order-found',
    size: 'md',
  },
};

export const OrderSent: Story = {
  args: {
    variant: 'order-sent',
    size: 'md',
    deliveryMethod: 'SMS',
    phoneNumber: '(XX) 9 XXXX-XXXX',
  },
};

export const OrderSentRetry: Story = {
  args: {
    variant: 'order-sent-retry',
    size: 'md',
    deliveryMethod: 'SMS',
    phoneNumber: '(XX) 9 XXXX-XXXX',
  },
};
