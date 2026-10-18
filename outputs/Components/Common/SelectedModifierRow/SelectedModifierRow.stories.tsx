import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SelectedModifierRow } from './SelectedModifierRow';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/SelectedModifierRow',
  component: SelectedModifierRow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
    modifierName: {
      control: 'text',
      description: 'The name of the modifier.',
    },
  },
} satisfies Meta<typeof SelectedModifierRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    modifierName: 'Nome do Produto',
  },
};

export const DarkTheme: Story = {
  args: {
    modifierName: 'Nome do Produto',
  },
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
};
