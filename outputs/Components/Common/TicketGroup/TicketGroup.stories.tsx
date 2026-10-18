import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { TicketGroup } from './TicketGroup';

const meta = {
  title: 'Components/TicketGroup',
  component: TicketGroup,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    showTitle: { control: 'boolean' },
    title: { control: 'text' },
    seatType: { control: 'text' },
  },
} satisfies Meta<typeof TicketGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    showTitle: false,
    title: 'Poltrona',
    seatType: '[Type]',
    options: [
      { id: '1', type: 'Inteira', price: '40,00', supportingText: 'Texto de suporte' },
      { id: '2', type: 'Meia-entrada', price: '20,00', supportingText: 'Estudantes e idosos' },
      { id: '3', type: 'Cortesia', price: '0,00', supportingText: 'Apenas convidados' },
    ],
  },
};

export const DarkTheme: Story = {
  args: {
    ...Playground.args,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};
