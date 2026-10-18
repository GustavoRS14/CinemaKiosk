import type { Meta, StoryObj } from '@storybook/react';
import { LoadingAnimation } from './LoadingAnimation';

const meta = {
  title: 'Components/LoadingAnimation',
  component: LoadingAnimation,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'number', min: 80, max: 520, step: 8 },
      description: 'Largura da ilustração em pixels.',
    },
    'aria-label': {
      control: 'text',
      description: 'Descrição acessível do estado de carregamento.',
    },
  },
} satisfies Meta<typeof LoadingAnimation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 240,
    'aria-label': 'Carregando...',
  },
};

export const Small: Story = {
  args: {
    size: 120,
    'aria-label': 'Carregando...',
  },
};

export const Large: Story = {
  args: {
    size: 360,
    'aria-label': 'Carregando...',
  },
};

export const SizesComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-end' }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingAnimation size={120} />
        <p style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>120px</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingAnimation size={240} />
        <p style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>240px (Padrão)</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingAnimation size={320} />
        <p style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>320px</p>
      </div>
    </div>
  ),
};

export const OnDarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '32px',
        borderRadius: '16px',
        background: '#121218',
      }}
    >
      <LoadingAnimation size={240} />
      <span style={{ color: '#ffffff', fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 500 }}>
        Mastigando pipoca...
      </span>
    </div>
  ),
};
