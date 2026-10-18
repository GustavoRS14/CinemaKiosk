import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { KeyboardDialog } from './KeyboardDialog';

const meta = {
  title: 'Overlays/KeyboardDialog',
  component: KeyboardDialog,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['numeric', 'alphanumeric'] },
    showIntro: { control: 'boolean' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof KeyboardDialog>;

export default meta;
type Story = StoryObj<typeof KeyboardDialog>;

export const Default: Story = {
  args: {
    size: 'md',
    title: 'Alterar PIN Administrativo',
    description: 'Repita o novo código numérico para confirmar a alteração.',
    inputPlaceholder: 'Confirmar Novo PIN',
    secondaryActionLabel: 'Voltar',
    primaryActionLabel: 'Alterar PIN',
    tertiaryActionLabel: 'Cancelar',
    showTertiaryButton: false,
    primaryDisabled: true,
  },
};

export const WithTertiaryAction: Story = {
  args: { ...Default.args, showTertiaryButton: true },
};

export const Alphanumeric: Story = {
  args: {
    variant: 'alphanumeric',
    size: 'lg',
    title: 'Digite o código do seu pedido para imprimir',
    description: 'Insira o número recebido no e-mail de confirmação ou no app.',
    showIntro: true,
    inputPlaceholder: 'Número do Pedido',
    clearLabel: 'Limpar',
    spaceLabel: 'Espaço',
    secondaryActionLabel: 'Cancelar',
    primaryActionLabel: 'Buscar Pedido',
    showTertiaryButton: false,
    primaryDisabled: true,
  },
};
