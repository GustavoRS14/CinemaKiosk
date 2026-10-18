import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../../../StoryTokenCanvas';
import { PrintingFailureDialog } from './PrintingFailureDialog';

const meta = {
  title: 'Overlays/Dialog/PrintingFailureDialog',
  component: PrintingFailureDialog,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  parameters: { layout: 'centered' },
  argTypes: {
    scenario: { control: 'select', options: ['totem', 'online-order'] },
    initialStage: { control: 'select', options: ['generating', 'qr-ready'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PrintingFailureDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GeneratingQrCode: Story = {
  args: { scenario: 'totem', initialStage: 'generating', autoAdvance: false, size: 'md' },
};

export const QrCodeReady: Story = {
  args: { scenario: 'totem', initialStage: 'qr-ready', autoAdvance: false, size: 'md' },
};

export const OnlineOrderFailure: Story = {
  args: { scenario: 'online-order', countdownSeconds: 15, size: 'md' },
};

export const AutomaticFlow: Story = {
  args: { scenario: 'totem', initialStage: 'generating', autoAdvance: true, qrGenerationDelayMs: 3000, size: 'md' },
};
