import type { Meta, StoryObj } from '@storybook/react';
import { PopcornLoading } from './PopcornLoading';

const meta = {
  title: 'Components/PopcornLoading',
  component: PopcornLoading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'number', min: 80, max: 520, step: 8 },
      description: 'Largura e altura da ilustração.',
    },
    'aria-label': {
      control: 'text',
      description: 'Descrição acessível do estado de carregamento.',
    },
  },
} satisfies Meta<typeof PopcornLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 240,
    'aria-label': 'Carregando',
  },
};
