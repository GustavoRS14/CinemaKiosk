import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { CheckoutSummary } from './CheckoutSummary';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import placeholderImg from '@images/placeholder.png';

const meta: Meta<typeof CheckoutSummary> = {
  title: 'Components/CheckoutSummary',
  component: CheckoutSummary,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['Tickets', 'Concessions'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CheckoutSummary>;

const mockTicketsProps = {
  movieTitle: 'A Odisséia',
  ratingValue: '18' as const,
  movieTags: ['Aventura', '180min'],
  movieImageUrl: placeholderImg,
  dateStr: 'Hoje, 20 Jul',
  startTime: '10:00',
  showEndTime: false, // CRITICAL FIX: Defaulted to false
  endTime: '~13:20',
  auditorium: '5',
  language: 'Legendado',
  experienceTags: ['2D', 'D-BOX'],
  seatTags: ['F4', 'F5', 'F6'],
  selectedTickets: [
    { label: 'Meia Entrada', price: '30,00' },
    { label: 'Inteira', price: '40,00' }
  ],
  totalTicketsCount: 3,
  totalPrice: '70,00',
};

const mockConcessionsProps = {
  items: [
    { name: 'Combo Mega', price: '45,00', quantity: 1 },
    { name: 'Refrigerante Grande', price: '15,00', quantity: 1 }
  ] as any, // assuming OrderItemProps matches this structure
  totalPrice: '60,00',
  showDeliveryOption: true, // CRITICAL FIX: Activated for preview
  deliveryEstimate: '10h25 - 10h45',
};

export const Playground: Story = {
  args: {
    variant: 'Tickets',
    ticketsProps: mockTicketsProps,
    concessionsProps: mockConcessionsProps,
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    variant: 'Tickets',
    ticketsProps: mockTicketsProps,
    concessionsProps: mockConcessionsProps,
  },
};
