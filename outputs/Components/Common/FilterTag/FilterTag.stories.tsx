import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { FilterTag } from './FilterTag';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/FilterTag',
  component: FilterTag,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  args: {
    label: 'Texto',
  },
  argTypes: {
    label: { control: 'text' },
    onClose: { action: 'onClose' },
  },
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=5137-17155',
    },
  },
} satisfies Meta<typeof FilterTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const CustomLabel: Story = {
  args: {
    label: 'Filtro Ativo',
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => <StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>],
};
