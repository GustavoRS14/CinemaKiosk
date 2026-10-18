import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { Alert } from './Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story/>
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    intent: {
      control: 'select',
      options: ['Neutral', 'Success', 'Error', 'Warning', 'Information'],
      description: 'Figma Intent property determining the semantic text color',
    },
    title: {
      control: 'text',
      description: 'The title string or node of the alert',
    },
    description: {
      control: 'text',
      description: 'The description string or node of the alert',
    },
    isVisible: {
      control: 'boolean',
      description: 'Controlled visibility state',
    },
    onClose: {
      action: 'closed',
      description: 'Fired when the Close button is clicked',
    }
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    intent: 'Neutral',
    title: 'Playground Alert',
    description: 'Use the controls below to change properties dynamically.',
  },
};

export const Neutral: Story = {
  args: {
    intent: 'Neutral',
    title: 'Update Available',
    description: 'A new software update is available for your terminal. Please reboot when convenient.',
  },
};

export const Success: Story = {
  args: {
    intent: 'Success',
    title: 'Transaction Completed',
    description: 'Your payment was successfully processed and a receipt has been printed.',
  },
};

export const Error: Story = {
  args: {
    intent: 'Error',
    title: 'Hardware Failure',
    description: 'The card reader is currently offline. Please use contactless payment or try another terminal.',
  },
};

export const Warning: Story = {
  args: {
    intent: 'Warning',
    title: 'Low Paper Supply',
    description: 'The receipt printer is running low on paper. Please notify maintenance.',
  },
};

export const Information: Story = {
  args: {
    intent: 'Information',
    title: 'Maintenance Mode',
    description: 'This terminal will undergo scheduled maintenance at 03:00 AM.',
  },
};

export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    theme: 'dark',
  },
  args: {
    intent: 'Neutral',
    title: 'Dark Theme Alert',
    description: 'This is how the alert looks in dark mode.',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};
