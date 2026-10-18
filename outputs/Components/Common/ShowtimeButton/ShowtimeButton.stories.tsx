import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ShowtimeButton } from './ShowtimeButton';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { Tag } from '../Tag';

const meta = {
  title: 'Components/ShowtimeButton',
  component: ShowtimeButton,
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
    time: { control: 'text' },
    defaultSelected: { control: 'boolean' },
    selectable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    occupancyState: {
      control: 'select',
      options: ['Normal', 'High', 'Critical'],
    },
    occupancyPercentage: { control: 'number' },
    availableSeats: { control: 'number' },
    showtimeDate: { control: 'text' },
    salesCutoffMinutes: { control: 'number' },
  },
} satisfies Meta<typeof ShowtimeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    time: '10:00',
    defaultSelected: false,
    selectable: true,
    occupancyState: 'Normal',
    showtimeDate: '2099-01-01',
  },
};

export const HighOccupancy: Story = {
  args: {
    time: '18:00',
    occupancyState: 'High',
    occupancyPercentage: 65,
    showtimeDate: '2099-01-01',
  },
};

export const CriticalOccupancy: Story = {
  args: {
    time: '21:30',
    occupancyState: 'Critical',
    availableSeats: 15,
    showtimeDate: '2099-01-01',
  },
};

export const SoldOut: Story = {
  args: {
    time: '21:30',
    occupancyState: 'Critical',
    availableSeats: 0,
    showtimeDate: '2099-01-01',
  },
};

export const WithBadge: Story = {
  args: {
    time: '14:30',
    defaultSelected: false,
    occupancyState: 'Normal',
    badgeElement: <Tag status="Brand" text="Dublado" />,
    showtimeDate: '2099-01-01',
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
    time: '20:00',
    defaultSelected: true,
    selectable: true,
    occupancyState: 'Normal',
    showtimeDate: '2099-01-01',
  },
};
