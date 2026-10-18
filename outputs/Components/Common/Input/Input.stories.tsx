import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Input } from './Input';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/Input',
  component: Input,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  args: {
    showTitle: true,
    title: 'Título',
    showSupportingText: true,
    supportingText: 'Texto de suporte',
    tag: false,
    state: 'Default',
    status: 'Default',
    placeholder: 'Placeholder',
    defaultValue: 'Texto',
    border: 'md',
    showIconLeft: true,
    showIconRight: true,
    showBadge: false,
    badgeText: 'Badge',
    actionRight: false,
    ctaLabel: 'CTA',
  },
  argTypes: {
    state: {
      control: 'radio',
      options: ['Default', 'Filled', 'Disabled', 'Invalid', 'Read Only'],
    },
    status: {
      control: 'radio',
      options: ['Default', 'Pressed'],
    },
    border: {
      control: 'radio',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    onCtaClick: { action: 'onCtaClick' },
    onChange: { action: 'onChange' },
  },
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=5137-15862',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Filled: Story = {
  args: {
    state: 'Filled',
    defaultValue: 'Valor preenchido',
  },
};

export const Invalid: Story = {
  args: {
    state: 'Invalid',
    supportingText: 'Mensagem de erro',
  },
};

export const Disabled: Story = {
  args: {
    state: 'Disabled',
    defaultValue: 'Texto desabilitado',
  },
};

export const ReadOnly: Story = {
  args: {
    state: 'Read Only',
    defaultValue: 'Apenas leitura',
  },
};

export const WithBadge: Story = {
  args: {
    showBadge: true,
    badgeText: 'Badge',
    showIconRight: false,
  },
};

export const WithAction: Story = {
  args: {
    actionRight: true,
    showIconRight: false,
    ctaLabel: 'Action',
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => <StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>],
};
