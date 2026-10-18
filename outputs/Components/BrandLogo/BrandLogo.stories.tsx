import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BrandLogo } from './BrandLogo';
import { StoryTokenCanvas } from '../../StoryTokenCanvas'; // <-- CHANGED PATH

const meta = {
  title: 'Components/BrandLogo',
  component: BrandLogo,
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)], // Decorator remains the same
  argTypes: {
    size: {
      control: 'radio',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Tamanho da logo',
    },
    tenant: {
      control: 'text',
      description: 'ID da marca ativa',
    },
    type: {
      control: 'radio',
      options: ['Standard', 'Fidelity'],
    },
    format: {
      control: 'radio',
      options: ['Full', 'Compact'],
    },
  },
} satisfies Meta<typeof BrandLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: 'md',
    tenant: 'suaempresa',
    type: 'Standard',
    format: 'Full',
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
  args: {
    ...Playground.args,
  },
};
