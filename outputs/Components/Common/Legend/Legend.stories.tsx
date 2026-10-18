import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Legend } from './Legend';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { Tag } from '../Tag';

const meta = {
  title: 'Components/Legend',
  component: Legend,
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
    description: { control: 'text' },
    textSize: {
      control: 'radio',
      options: ['Body', 'Body-sm'],
    },
  },
} satisfies Meta<typeof Legend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    description: 'Descrição do legend',
    textSize: 'Body-sm',
    indicatorElement: <Tag status="Brand" text="Tipo" />,
  },
};

export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  args: {
    description: 'Descrição do legend (Dark Mode)',
    indicatorElement: <Tag status="Brand" text="Tipo" />,
  },
};
