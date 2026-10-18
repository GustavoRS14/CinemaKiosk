import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { Accessibility } from './Accessibility';

const meta = {
  title: 'Overlays/Accessibility',
  component: Accessibility,
  decorators: [
    (Story, context) => (
      <StoryTokenCanvas orientation={context.args.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: { layout: 'centered' },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accessibility>;

export default meta;
type Story = StoryObj<typeof Accessibility>;

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    size: 'md',
  },
};

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    size: 'md',
  },
};
