import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { CloseButton } from './CloseButton';

// Strict ES module imports for assets, resolving via Vite SVGR plugin
import CloseIcon from '@icons/close.svg';
import AddPlusIcon from '@icons/add-plus.svg';
import CheckIcon from '@icons/check.svg';

const meta = {
  title: 'Components/CloseButton',
  component: CloseButton,
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
    type: {
      control: 'radio',
      options: ['Contained', 'Ghost'],
      description: 'Figma Type property',
    },
    state: {
      control: 'radio',
      options: ['Default', 'Pressed', 'Disabled'],
      description: 'Figma State property',
    },
    disabled: {
      control: 'boolean',
      description: 'HTML Disabled state',
    },
    icon: {
      control: 'select',
      options: ['Close', 'Plus', 'Check'],
      mapping: {
        Close: <CloseIcon />,
        Plus: <AddPlusIcon />,
        Check: <CheckIcon />,
      },
      description: 'Instance swap for the icon inside the button',
    },
  },
} satisfies Meta<typeof CloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    type: 'Contained',
    state: 'Default',
    disabled: false,
    icon: 'Close' as any,
  },
};

/**
 * The default CloseButton, functioning as a "Contained" type by standard.
 * The physical bounds of the button are 48x48 according to the structural guidelines,
 * with a strictly centered 24x24 icon and symmetric internal bounding.
 */
export const Default: Story = {
  args: {
    type: 'Contained',
    state: 'Default',
    disabled: false,
    icon: 'Close' as any,
  },
};

/**
 * Ghost type, generally used for secondary actions or specific backgrounds.
 */
export const Ghost: Story = {
  args: {
    ...Default.args,
    type: 'Ghost',
  },
};

/**
 * Disabled state, visually blocking interactions and altering contrast.
 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    state: 'Disabled',
    disabled: true,
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
