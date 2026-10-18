import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { IconButton } from './IconButton';

import AddPlusIcon from '@icons/add-plus.svg';
import CloseIcon from '@icons/close.svg';
import CheckIcon from '@icons/check.svg';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
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
      control: 'radio',
      options: ['Default', 'Pressed', 'Disabled'],
      description: 'Figma State property',
    },

    icon: {
      control: 'select',
      options: ['AddPlus', 'Close', 'Check'],
      mapping: {
        AddPlus: <AddPlusIcon />,
        Close: <CloseIcon />,
        Check: <CheckIcon />,
      },
      description: 'Instance swap for the icon inside the button',
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    state: 'Default',
    icon: 'AddPlus' as any,
  },
};

export const Default: Story = {
  args: {
    state: 'Default',
  },
};

export const Pressed: Story = {
  args: {
    state: 'Pressed',
  },
};

export const Disabled: Story = {
  args: {
    state: 'Disabled',
  },
};

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
