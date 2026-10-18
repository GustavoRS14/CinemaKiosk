import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ActionDialog } from './ActionDialog';
import { StoryTokenCanvas } from '../../../../../StoryTokenCanvas';

const meta = {
  title: 'Overlays/Dialog/ActionDialog',
  component: ActionDialog,
  decorators: [
    (Story, context) => (
      <StoryTokenCanvas theme={context.parameters.tokenTheme === 'Dark' ? 'Dark' : 'Light'}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <Story />
        </div>
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActionDialog>;

export default meta;
type Story = StoryObj<typeof ActionDialog>;

export const Default: Story = {
  args: {
    title: 'Salvar alterações pendentes?',
    description: 'Você possui modificações não salvas. Deseja aplicá-las antes de fechar a aplicação?',
    primaryActionLabel: 'Salvar e Fechar',
    secondaryActionLabel: 'Não Salvar',
    showPrimaryButton: true,
    showSecondaryButton: true,
    showTertiaryButton: false,
    showModalHeader: false,
    size: 'md',
  },
};

export const DarkTheme: Story = {
  args: {
    title: 'Salvar alterações pendentes?',
    description: 'Você possui modificações não salvas. Deseja aplicá-las antes de fechar a aplicação?',
    primaryActionLabel: 'Salvar e Fechar',
    secondaryActionLabel: 'Não Salvar',
    showPrimaryButton: true,
    showSecondaryButton: true,
    showTertiaryButton: false,
    showModalHeader: false,
    size: 'md',
  },
  parameters: {
    tokenTheme: 'Dark',
  },
};
