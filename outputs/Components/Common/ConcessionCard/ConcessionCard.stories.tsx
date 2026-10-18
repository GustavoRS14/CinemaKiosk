import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { ConcessionCard } from './ConcessionCard';
import placeholderImg from '@images/placeholder.png';

const meta = {
  title: 'Components/ConcessionCard',
  component: ConcessionCard,
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
    flowType: {
      control: 'radio',
      options: ['Express', 'Personalized'],
    },
    state: {
      control: 'radio',
      options: ['Default', 'Pressed'],
    },
    title: {
      control: 'text',
    },
    price: {
      control: 'text',
    },
    imageUrl: {
      control: 'select',
      options: [placeholderImg, 'https://placehold.co/327x264'],
      mapping: {
        Placeholder: placeholderImg,
        'External Sample': 'https://placehold.co/327x264',
      },
    },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof ConcessionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    flowType: 'Express',
    state: 'Default',
    title: 'Pipoca Grande',
    price: '160,00',
    imageUrl: placeholderImg,
  },
};

export const Express: Story = {
  args: {
    flowType: 'Express',
    state: 'Default',
    title: 'Pipoca Grande',
    price: '160,00',
    imageUrl: placeholderImg,
  },
};

export const Personalized: Story = {
  args: {
    flowType: 'Personalized',
    state: 'Default',
    title: 'Pipoca Grande',
    price: '160,00',
    imageUrl: placeholderImg,
  },
};

export const Pressed: Story = {
  args: {
    flowType: 'Express',
    state: 'Pressed',
    title: 'Pipoca Grande',
    price: '160,00',
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
