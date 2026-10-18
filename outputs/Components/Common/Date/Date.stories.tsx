import React from 'react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import type { Meta, StoryObj } from '@storybook/react';
import { DateComponent } from './Date';

const meta = {
  title: 'Components/Date',
  component: DateComponent,
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
    day: { control: 'text' },
    date: { control: 'text' },
    month: { control: 'text' },
    selected: { control: 'boolean' },
  },
} satisfies Meta<typeof DateComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    day: 'Seg',
    date: '20',
    month: 'Jul',
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
  decorators: [
    (Story) => (
      <div className="dark p-8 bg-[#171718] rounded-lg">
        <Story />
      </div>
    ),
  ],
};
