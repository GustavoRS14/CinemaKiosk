import type { Meta, StoryObj } from '@storybook/react';
import { ThemePreviewCard } from './ThemePreviewCard';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import SunIcon from '@icons/Sun.svg';
import MoonIcon from '@icons/Moon.svg';

const meta = {
  title: 'Admin/ThemePreviewCard',
  component: ThemePreviewCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ThemePreviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: 'Tema Claro',
    description: 'Descrição',
    icon: <SunIcon />,
  },
};

export const DarkTheme: Story = {
  args: {
    title: 'Tema Escuro',
    description: 'Descrição do tema',
    icon: <MoonIcon />,
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};
