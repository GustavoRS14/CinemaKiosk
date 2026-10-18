import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { NoticeBox } from './NoticeBox';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof NoticeBox> = {
  title: 'Components/NoticeBox',
  component: NoticeBox,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    borderRadius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof NoticeBox>;

const MockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Playground: Story = {
  args: {
    borderRadius: 'xs',
    status: 'Information',
    message: 'A sessão começará pontualmente. Por favor, chegue com 15 minutos de antecedência.',
    icon: <MockIcon />,
  },
};

export const Warning: Story = {
  args: {
    borderRadius: 'xs',
    status: 'Warning',
    message: 'Restam apenas 3 lugares para esta sessão.',
    icon: <MockIcon />,
  },
};

export const Success: Story = {
  args: {
    borderRadius: 'xs',
    status: 'Success',
    message: 'Seu ingresso foi emitido com sucesso e enviado para o seu e-mail.',
    icon: <MockIcon />,
  },
};

export const ErrorState: Story = {
  args: {
    borderRadius: 'xs',
    status: 'Error',
    message: 'O seu cartão de crédito foi recusado pela operadora.',
    icon: <MockIcon />,
  },
};

export const Neutral: Story = {
  args: {
    borderRadius: 'xs',
    status: 'Neutral',
    message: 'Esta é uma mensagem neutra e informativa de sistema.',
    icon: <MockIcon />,
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    borderRadius: 'xs',
    status: 'Information',
    message: 'Este componente adapta perfeitamente as cores das bordas e background ao tema escuro.',
    icon: <MockIcon />,
  },
};
