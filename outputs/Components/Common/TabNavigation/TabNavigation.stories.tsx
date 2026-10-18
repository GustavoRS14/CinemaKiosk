import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TabNavigation } from './TabNavigation';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/TabNavigation',
  component: TabNavigation,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
    box: {
      control: 'boolean',
      description: 'Figma box property.',
    },
    prop3rd: {
      control: 'boolean',
      description: 'Display the 3rd tab.',
    },
    prop4th: {
      control: 'boolean',
      description: 'Display the 4th tab.',
    },
    prop5th: {
      control: 'boolean',
      description: 'Display the 5th tab.',
    },
  },
} satisfies Meta<typeof TabNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    box: true,
    prop3rd: true,
    prop4th: false,
    prop5th: false,
  },
};

export const DarkTheme: Story = {
  args: {
    box: true,
    prop3rd: true,
    prop4th: false,
    prop5th: false,
  },
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
};
