import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { PaginationButton } from './PaginationButton';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof PaginationButton> = {
  title: 'Components/PaginationButton',
  component: PaginationButton,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    direction: {
      control: 'radio',
      options: ['left', 'right'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof PaginationButton>;

export const Playground: Story = {
  args: {
    direction: 'right',
    disabled: false,
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    direction: 'right',
    disabled: false,
  },
};
