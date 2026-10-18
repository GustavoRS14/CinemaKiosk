import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { InputDialog } from './InputDialog';

const meta = {
  title: 'Overlays/InputDialog',
  component: InputDialog,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InputDialog>;

export default meta;
type Story = StoryObj<typeof InputDialog>;

export const Default: Story = {
  args: {
    size: 'lg',
    title: 'Informe seu número de celular',
    description: 'Digite o código de área (DDD) e o seu número para receber os ingressos.',
    methodText: <>Você receberá seu pedido digital via <strong>Whatsapp</strong></>,
    showMethodText: true,
    inputPlaceholder: '( _ _ ) _ _ _ _ _ - _ _ _ _',
    primaryActionLabel: 'Enviar',
    secondaryActionLabel: 'Voltar',
    primaryDisabled: true,
  },
};

export const WithoutMethodText: Story = {
  args: { ...Default.args, showMethodText: false },
};
