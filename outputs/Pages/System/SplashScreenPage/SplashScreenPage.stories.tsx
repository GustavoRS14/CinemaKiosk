import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { SplashScreenPage } from './SplashScreenPage';

const meta = {
  title: 'Pages/System/SplashScreenPage',
  component: SplashScreenPage,
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Light">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof SplashScreenPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { progress: 40 },
};
