import type { Meta, StoryObj } from '@storybook/react';
import { ColorSample } from './ColorSample';
import React from 'react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Admin/ColorSample',
  component: ColorSample,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    colorValue: { control: 'text' },
  },
} satisfies Meta<typeof ColorSample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    colorValue: 'var(--Semantic-Primary-Default)',
  },
};

export const DarkTheme: Story = {
  args: {
    colorValue: 'var(--Semantic-Primary-Default)',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};
