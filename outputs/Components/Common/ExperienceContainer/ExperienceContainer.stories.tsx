import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ExperienceContainer } from './ExperienceContainer';
import { ExperienceBadge, ExperienceType } from '../ExperienceBadge';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

// Create a custom prop interface just for Storybook controls
type StoryProps = React.ComponentProps<typeof ExperienceContainer> & {
  badges: ExperienceType[];
};

const meta = {
  title: 'Components/ExperienceContainer',
  component: ExperienceContainer as React.FC<any>, // Bypassing strict type check for the custom render
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
    format: {
      control: 'select',
      options: ['Premium', '3D'],
    },
    badges: {
      control: 'multi-select',
      options: ['Dolby Atmos', '3D', 'IMAX', 'Laser', 'Infinity Vision', 'VIP'],
      description: 'Select multiple badges to render dynamically',
    },
    children: {
      table: {
        disable: true, // Hide raw children prop from UI to avoid confusion
      },
    },
  },
  render: (args) => (
    <ExperienceContainer format={args.format}>
      {args.badges?.map((badge, index) => (
        <ExperienceBadge key={`${badge}-${index}`} experience={badge} />
      ))}
    </ExperienceContainer>
  ),
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<StoryProps>;

export const Playground: Story = {
  args: {
    format: 'Premium',
    badges: ['Dolby Atmos', 'IMAX', 'VIP'], // Initial state for UI
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
    format: '3D',
    badges: ['3D', 'Laser'], // Initial state for UI
  },
};
