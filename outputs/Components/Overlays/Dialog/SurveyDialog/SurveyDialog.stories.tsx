import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../../../StoryTokenCanvas';
import { SurveyDialog } from './SurveyDialog';

const meta = {
  title: 'Overlays/Dialog/SurveyDialog',
  component: SurveyDialog,
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
} satisfies Meta<typeof SurveyDialog>;

export default meta;
type Story = StoryObj<typeof SurveyDialog>;

export const SelectedAnswers: Story = {
  args: {
    size: 'lg',
    defaultAnswers: {
      findingProducts: 'positive',
      checkoutSpeed: 'positive',
      orientation: 'vertical',
    },
  },
};

export const Unanswered: Story = {
  args: {
    size: 'lg',
    defaultAnswers: {},
  },
};
