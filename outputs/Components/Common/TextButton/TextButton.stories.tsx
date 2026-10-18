import type { Meta, StoryObj } from '@storybook/react';
import { TextButton } from './TextButton';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/TextButton',
  component: TextButton,
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
    intent: {
      control: 'select',
      options: ['Neutral', 'Primary', 'Muted', 'Danger', 'Success', 'Warning', 'Information'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    weight: {
      control: 'select',
      options: ['Medium', 'SemiBold', 'Bold'],
    },
    disabled: {
      control: 'boolean',
    },
    hasLeftIcon: {
      control: 'boolean',
    },
    hasRightIcon: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof TextButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Playground
export const Playground: Story = {
  args: {
    intent: 'Neutral',
    size: "md",
    weight: 'Medium',
    label: 'Label',
    hasLeftIcon: true,
    hasRightIcon: true,
    disabled: false,
  },
};

// 2. Dark Theme
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

// 3. Variant Stories (Light Theme)
export const IntentNeutral: Story = {
  args: {
    intent: 'Neutral',
    label: 'Neutral',
  },
};

export const IntentPrimary: Story = {
  args: {
    intent: 'Primary',
    label: 'Primary',
  },
};

export const IntentMuted: Story = {
  args: {
    intent: 'Muted',
    label: 'Muted',
  },
};

export const IntentDanger: Story = {
  args: {
    intent: 'Danger',
    label: 'Danger',
  },
};

export const IntentSuccess: Story = {
  args: {
    intent: 'Success',
    label: 'Success',
  },
};

export const IntentWarning: Story = {
  args: {
    intent: 'Warning',
    label: 'Warning',
  },
};

export const IntentInformation: Story = {
  args: {
    intent: 'Information',
    label: 'Information',
  },
};

export const Disabled: Story = {
  args: {
    intent: 'Neutral',
    label: 'Disabled',
    disabled: true,
  },
};

export const WithIcons: Story = {
  args: {
    intent: 'Neutral',
    label: 'Icon Text',
    hasLeftIcon: true,
    hasRightIcon: true,
  },
};
