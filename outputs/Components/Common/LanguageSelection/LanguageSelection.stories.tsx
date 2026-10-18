import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LanguageSelection } from './LanguageSelection';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof LanguageSelection> = {
  title: 'Components/LanguageSelection',
  component: LanguageSelection,
  decorators: [(Story) => (
    <div style={{ padding: '40px', backgroundColor: '#000', display: 'flex', gap: '40px' }}>
      <Story />
    </div>
  )],
  argTypes: {
    locale: {
      control: 'text',
      description: 'Digite a sigla ISO (ex: pt-BR, en-US) para buscar a bandeira dinamicamente.'
    },
    label: { control: 'text' },
    isSelected: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof LanguageSelection>;

export const Playground: Story = {
  args: {
    locale: 'pt-BR',
    label: 'Português',
    isSelected: false,
  },
};

export const DefaultUnselected: Story = {
  args: {
    locale: 'pt-BR',
    label: 'Português',
    isSelected: false,
  },
};

export const Selected: Story = {
  args: {
    locale: 'pt-BR',
    label: 'Português',
    isSelected: true,
  },
};

export const SelectionGroup: Story = {
  render: () => {
    const [selected, setSelected] = React.useState('pt-BR');
    return (
      <>
        <LanguageSelection
          locale="pt-BR"
          isSelected={selected === 'pt-BR'}
          label="Português"
          onClick={() => setSelected('pt-BR')}
        />
        <LanguageSelection
          locale="en-US"
          isSelected={selected === 'en-US'}
          label="English"
          onClick={() => setSelected('en-US')}
        />
        <LanguageSelection
          locale="es-ES"
          isSelected={selected === 'es-ES'}
          label="Español"
          onClick={() => setSelected('es-ES')}
        />
      </>
    );
  }
};
