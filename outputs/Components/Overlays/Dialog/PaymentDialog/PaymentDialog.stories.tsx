import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../../../StoryTokenCanvas';
import { PaymentDialog } from './PaymentDialog';

const meta = {
  title: 'Overlays/Dialog/PaymentDialog',
  component: PaymentDialog,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: { layout: 'centered' },
  argTypes: {
    method: { control: 'select', options: ['credit', 'debit', 'pix'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PaymentDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Credit: Story = {
  args: { method: 'credit', size: 'md' },
};

export const Debit: Story = {
  args: { method: 'debit', size: 'md' },
};

export const Pix: Story = {
  args: { method: 'pix', size: 'md' },
};

export const PixDark: Story = {
  args: { method: 'pix', size: 'md' },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};
