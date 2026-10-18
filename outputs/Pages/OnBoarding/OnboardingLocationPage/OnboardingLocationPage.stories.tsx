import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { useOrientation } from '../../useOrientation';
import { OnboardingLocationPage } from './OnboardingLocationPage';

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
  title: 'Pages/OnBoarding/OnboardingLocationPage',
  component: OnboardingLocationPage,
  decorators: [
    (Story) => (
      <ResponsiveStoryCanvas>
        <Story />
      </ResponsiveStoryCanvas>
    ),
  ],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof OnboardingLocationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAvailableComplexes: Story = {
  args: {
    complexesByExhibitor: {
      cinesercla: [
        { value: 'shopping-01', label: 'Cinesercla Shopping 01' },
        { value: 'shopping-02', label: 'Cinesercla Shopping 02' },
      ],
    },
  },
};
