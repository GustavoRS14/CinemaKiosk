import React from 'react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
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
    status: {
      control: 'select',
      options: ['Brand', 'Information', 'Warning', 'Success', 'Error', 'Neutral'],
    },
    state: {
      control: 'select',
      options: ['Default', 'Disabled', 'Read Only'],
    },
    text: {
      control: 'text',
    },
  },
  args: {
    status: 'Brand',
    state: 'Default',
    text: 'Tag Label',
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Playground: Story = {};

export const DarkTheme: Story = {
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

export const Information: Story = {
  args: {
    status: 'Information',
  },
};

export const Warning: Story = {
  args: {
    status: 'Warning',
  },
};

export const Success: Story = {
  args: {
    status: 'Success',
  },
};

export const ErrorState: Story = {
  args: {
    status: 'Error',
  },
};

export const Neutral: Story = {
  args: {
    status: 'Neutral',
  },
};

export const Disabled: Story = {
  args: {
    state: 'Disabled',
  },
};

export const ReadOnly: Story = {
  args: {
    state: 'Read Only',
  },
};
