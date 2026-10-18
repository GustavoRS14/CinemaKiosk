import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../../../StoryTokenCanvas';
import { OrderFulfillmentDialog } from './OrderFulfillmentDialog';

const meta = {
  title: 'Overlays/Dialog/OrderFulfillmentDialog',
  component: OrderFulfillmentDialog,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  parameters: { layout: 'centered' },
  argTypes: {
    step: { control: 'select', options: ['method', 'delivery-details'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OrderFulfillmentDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Step1: Story = {
  args: { size: 'lg', step: 'method' },
};

export const Step2: Story = {
  args: {
    size: 'lg',
    step: 'delivery-details',
    selectedMethod: 'seat-delivery',
    movies: [
      { value: 'toy-story-5', label: 'Toy Story 5' },
      { value: 'a-odisseia', label: 'A Odisseia' },
    ],
    sessions: [
      { value: '19:30', label: '19:30' },
      { value: '21:45', label: '21:45' },
    ],
  },
};
