import type { Meta, StoryObj } from '@storybook/react';
import { ExperienceBadge } from './ExperienceBadge';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/ExperienceBadge',
  component: ExperienceBadge,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    experience: {
      control: 'select',
      options: ['Dolby Atmos', '3D', 'IMAX', 'Laser', 'Infinity Vision', 'VIP'],
    },
  },
} satisfies Meta<typeof ExperienceBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    experience: 'Dolby Atmos',
  },
};

export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    theme: 'dark',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  args: {
    ...Playground.args,
  },
};
