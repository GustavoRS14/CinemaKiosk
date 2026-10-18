import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { Choice_Chip } from './Choice_Chip';

const meta = {
  title: 'Components/Choice_Chip',
  component: Choice_Chip,
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
    state: {
      control: 'select',
      options: ['Default', 'Pressed', 'Read Only', 'Disabled'],
    },
    selected: {
      control: 'boolean',
    },
    optionName: {
      control: 'text',
    },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof Choice_Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    state: 'Default',
    selected: true,
    optionName: 'Opção',
  },
};

export const Selected: Story = {
  args: {
    state: 'Default',
    selected: true,
    optionName: 'Selected',
  },
};

export const Unselected: Story = {
  args: {
    state: 'Default',
    selected: false,
    optionName: 'Unselected',
  },
};

export const Pressed: Story = {
  args: {
    state: 'Pressed',
    selected: true,
    optionName: 'Pressed',
  },
};

export const Disabled: Story = {
  args: {
    state: 'Disabled',
    selected: true,
    optionName: 'Disabled',
  },
};

export const ReadOnly: Story = {
  args: {
    state: 'Read Only',
    selected: false,
    optionName: 'Read Only',
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
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};
