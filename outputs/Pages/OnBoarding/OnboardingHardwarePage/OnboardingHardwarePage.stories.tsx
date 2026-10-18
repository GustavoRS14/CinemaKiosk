import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { useOrientation } from '../../useOrientation';
import { OnboardingHardwarePage } from './OnboardingHardwarePage';

function ResponsiveStoryCanvas({ children }: { children: ReactNode }) {
  const orientation = useOrientation();
  return (
    <StoryTokenCanvas theme="Light" orientation={orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}>
      {children}
    </StoryTokenCanvas>
  );
}

const meta = {
  title: 'Pages/OnBoarding/OnboardingHardwarePage',
  component: OnboardingHardwarePage,
  decorators: [(Story) => <ResponsiveStoryCanvas><Story /></ResponsiveStoryCanvas>],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof OnboardingHardwarePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Connected: Story = {
  args: {
    detectedDevices: [
      {
        id: 'epson-tm-t88vi',
        type: 'printer',
        connected: true,
        model: 'Epson TM-T88VI',
        connection: 'COM3',
        paperStatus: 'ok',
      },
      {
        id: 'verifone-p400',
        type: 'payment-terminal',
        connected: true,
        model: 'Verifone P400',
        connection: 'USB',
      },
    ],
  },
};
