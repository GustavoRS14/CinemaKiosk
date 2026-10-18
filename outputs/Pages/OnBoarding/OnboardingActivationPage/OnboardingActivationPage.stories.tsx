import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { useOrientation } from '../../useOrientation';
import { OnboardingActivationPage } from './OnboardingActivationPage';

function ResponsiveStoryCanvas({ children }: { children: ReactNode }) {
  const orientation = useOrientation();

  return (
    <StoryTokenCanvas
      theme="Light"
      orientation={orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
    >
      {children}
    </StoryTokenCanvas>
  );
}

const meta = {
  title: 'Pages/OnBoarding/OnboardingActivationPage',
  component: OnboardingActivationPage,
  decorators: [
    (Story) => (
      <ResponsiveStoryCanvas>
        <Story />
      </ResponsiveStoryCanvas>
    ),
  ],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof OnboardingActivationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
