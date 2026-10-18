import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { DisclosureButton } from './DisclosureButton';

const meta = {
  title: 'Components/DisclosureButton',
  component: DisclosureButton,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <div style={{ width: '320px', maxWidth: '100%' }}>
          <Story/>
        </div>
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    border: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
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
} satisfies Meta<typeof DisclosureButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Playground
export const Playground: Story = {
  args: {
    border: 'sm',
    label: 'Disclosure Label',
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
export const BorderSmall: Story = {
  args: {
    border: 'sm',
    label: 'Border Small',
  },
};

export const BorderMedium: Story = {
  args: {
    border: 'md',
    label: 'Border Medium',
  },
};

export const BorderLarge: Story = {
  args: {
    border: 'lg',
    label: 'Border Large',
  },
};

export const Disabled: Story = {
  args: {
    border: 'sm',
    label: 'Disabled',
    disabled: true,
  },
};
