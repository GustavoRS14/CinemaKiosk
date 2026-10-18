import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { Card_Option } from './Card_Option';
import placeholderImg from '@images/placeholder.png';

const meta = {
  title: 'Components/Card_Option',
  component: Card_Option,
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
      options: ['Default', 'Pressed'],
    },
    text: {
      control: 'text',
    },
    imageUrl: {
      control: 'select',
      options: [placeholderImg, 'https://placehold.co/128x128'],
      mapping: {
        Placeholder: placeholderImg,
        'External Sample': 'https://placehold.co/128x128',
      },
    },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof Card_Option>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    state: 'Default',
    text: 'Texto',
    imageUrl: placeholderImg,
  },
};

export const Pressed: Story = {
  args: {
    state: 'Pressed',
    text: "Texto",
    imageUrl: placeholderImg,
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
