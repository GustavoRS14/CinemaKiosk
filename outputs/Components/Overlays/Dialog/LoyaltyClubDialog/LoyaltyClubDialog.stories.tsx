import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../../../StoryTokenCanvas';
import { LoyaltyClubDialog } from './LoyaltyClubDialog';

const meta = {
  title: 'Overlays/Dialog/LoyaltyClubDialog',
  component: LoyaltyClubDialog,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoyaltyClubDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'lg',
    tenant: '',
    clubName: 'Clube',
  },
};

export const AnotherBrand: Story = {
  args: {
    size: 'lg',
    tenant: 'Multicine',
    clubName: 'Clube Multicine',
  },
};
