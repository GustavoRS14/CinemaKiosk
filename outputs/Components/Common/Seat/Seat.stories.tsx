import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Seat } from './Seat';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof Seat> = {
  title: 'Components/Seat',
  component: Seat,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    state: {
      control: 'select',
      options: ['Available', 'Selected', 'Occupied'],
      description: 'Strict state of the seat component',
    },
    type: {
      control: 'select',
      options: ['Standard', 'Obese', 'Wheelchair', 'Companion', 'VIP'],
      description: 'The visual variant structure of the seat',
    },
    context: {
      control: 'radio',
      options: ['Map', 'Legend'],
      description: 'Defines the structural size and behavior',
    },
    seatNumber: { 
      control: 'text',
      description: 'Optional text overlaid perfectly centered on the icon'
    },
    className: { control: 'text' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Seat>;

export const Playground: Story = {
  args: {
    state: 'Available',
    type: 'Standard',
    context: 'Map',
    seatNumber: 'A1',
  },
};

export const ObeseVariant: Story = {
  args: {
    state: 'Available',
    type: 'Obese',
    context: 'Map',
    seatNumber: 'B1',
  },
};

export const WheelchairVariant: Story = {
  args: {
    state: 'Available',
    type: 'Wheelchair',
    context: 'Map',
    seatNumber: 'C1',
  },
};

export const CompanionVariant: Story = {
  args: {
    state: 'Available',
    type: 'Companion',
    context: 'Map',
    seatNumber: 'D1',
  },
};

export const VIPVariant: Story = {
  args: {
    state: 'Available',
    type: 'VIP',
    context: 'Map',
    seatNumber: 'E1',
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    ...Playground.args,
  },
};
