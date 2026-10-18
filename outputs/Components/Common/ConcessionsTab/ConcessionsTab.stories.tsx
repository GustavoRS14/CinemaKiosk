import React from 'react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import type { Meta, StoryObj } from '@storybook/react';
import { ConcessionsTab } from './ConcessionsTab';

// Universal placeholder image
import placeholderImg from '@images/placeholder.png';

const meta = {
  title: 'Components/ConcessionsTab',
  component: ConcessionsTab,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story/>
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    category: { control: 'text' },
    imageUrl: {
      control: 'select',
      options: ['None', 'Placeholder'],
      mapping: {
        None: undefined,
        Placeholder: placeholderImg,
      },
    },
    selected: { control: 'boolean' },
  },
} satisfies Meta<typeof ConcessionsTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    category: 'Categoria',
    imageUrl: 'Placeholder',
    selected: false,
  },
};

export const Selected: Story = {
  args: {
    ...Playground.args,
    selected: true,
  },
};

export const DarkTheme: Story = {
  args: {
    ...Playground.args,
  },
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
};
