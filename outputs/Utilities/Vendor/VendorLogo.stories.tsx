import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../StoryTokenCanvas';
import { VendorLogo } from './VendorLogo';

const meta = {
  title: 'Utilities/Vendor/VendorLogo',
  component: VendorLogo,
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
} satisfies Meta<typeof VendorLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
