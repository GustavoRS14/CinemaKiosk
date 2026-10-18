import type { Meta, StoryObj } from '@storybook/react';
import { ZoomControl } from './ZoomControl';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/ZoomControl',
  component: ZoomControl,
  parameters: {
    layout: 'centered',
  },
  decorators: [(Story) => (
    <StoryTokenCanvas>
      <Story />
    </StoryTokenCanvas>
  )],
  tags: ['autodocs'],
} satisfies Meta<typeof ZoomControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    className: '',
  },
};

export const DarkTheme: Story = {
  args: {
    className: '',
  },
  decorators: [(Story) => (
    <StoryTokenCanvas theme="Dark">
      <Story />
    </StoryTokenCanvas>
  )],
};
