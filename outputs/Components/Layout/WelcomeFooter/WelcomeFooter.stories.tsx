import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { WelcomeFooter } from './WelcomeFooter';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof WelcomeFooter> = {
  title: 'Layout/WelcomeFooter',
  component: WelcomeFooter,
  decorators: [(Story) => (
    <StoryTokenCanvas>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', minHeight: '500px', width: '100%', background: 'url(https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1440&q=80) center/cover no-repeat' }}>
        <Story />
      </div>
    </StoryTokenCanvas>
  )],
  argTypes: {
    showActions: {
      control: 'boolean',
      description: 'Alterna entre seleção de idioma (False) e botões de ação (True)'
    },
    defaultLocale: {
      control: 'text',
      description: 'Define a sigla ISO padrão (ex: pt-BR, es-ES) que aparecerá primeiro e selecionada.'
    }
  },
};

export default meta;
type Story = StoryObj<typeof WelcomeFooter>;

export const Playground: Story = {
  args: {
    showActions: false,
    defaultLocale: 'pt-BR',
  },
};

export const ActiveActionsState: Story = {
  args: {
    showActions: true,
    defaultLocale: 'pt-BR',
  },
};

export const DefaultLanguageSelection: Story = {
  args: {
    showActions: false,
    defaultLocale: 'pt-BR',
  },
};
