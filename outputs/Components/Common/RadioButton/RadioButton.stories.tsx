import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { RadioButton } from './RadioButton';

const meta = {
  title: 'Components/RadioButton',
  component: RadioButton,
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
    defaultSelected: { control: 'boolean' },
    state: {
      control: 'select',
      options: ['Default', 'Disabled', 'Read Only'],
    },
  },
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    defaultSelected: false,
    state: 'Default',
  },
};

export const Selected: Story = {
  args: {
    ...Playground.args,
    defaultSelected: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Playground.args,
    state: 'Disabled',
  },
};

export const DisabledSelected: Story = {
  args: {
    ...Playground.args,
    defaultSelected: true,
    state: 'Disabled',
  },
};

export const ReadOnly: Story = {
  args: {
    ...Playground.args,
    state: 'Read Only',
  },
};

export const DarkTheme: Story = {
  args: {
    ...Playground.args,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story/>
      </StoryTokenCanvas>
    ),
  ],
};
