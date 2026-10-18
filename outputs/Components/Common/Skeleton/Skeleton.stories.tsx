import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['rectangular', 'circular', 'text'],
      description: 'The shape of the skeleton',
    },
    width: { control: 'text', description: 'CSS width (e.g. 100%, 300px)' },
    height: { control: 'text', description: 'CSS height (e.g. 48px)' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Playground: Story = {
  args: {
    variant: 'rectangular',
    width: '300px',
    height: '150px',
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: '48px',
    height: '48px',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    width: '80%',
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    ...Playground.args,
  },
};
