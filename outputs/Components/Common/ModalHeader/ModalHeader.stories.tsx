import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ModalHeader } from './ModalHeader';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/ModalHeader',
  component: ModalHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
    text: {
      control: 'text',
      description: 'The title text of the modal.',
    },
  },
} satisfies Meta<typeof ModalHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    text: 'Título',
  },
};

export const LongTitle: Story = {
  args: {
    text: 'Um título muito grande que deve ser truncado com reticências para não quebrar o layout flexível',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', border: '1px solid #ccc' }}>
        <Story />
      </div>
    ),
  ],
};

export const DarkTheme: Story = {
  args: {
    text: 'Título',
  },
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
};
