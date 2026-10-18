import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LocaleAvatar } from './LocaleAvatar';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';

const meta = {
  title: 'Admin/LocaleAvatar',
  component: LocaleAvatar,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    locale: {
      control: 'text',
      description: 'Digite a sigla ISO exata (ex: pt-BR, en-US, pt-PT) para buscar a bandeira dinamicamente na pasta correspondente.',
    },
  },
} satisfies Meta<typeof LocaleAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    locale: 'pt-BR',
  },
};

export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  args: {
    locale: 'pt-BR',
  },
};
