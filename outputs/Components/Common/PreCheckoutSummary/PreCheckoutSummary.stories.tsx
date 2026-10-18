import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PreCheckoutSummary } from './PreCheckoutSummary';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import placeholderImg from '@images/placeholder.png';

const meta: Meta<typeof PreCheckoutSummary> = {
  title: 'Components/PreCheckoutSummary',
  component: PreCheckoutSummary,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    movieName: { control: 'text' },
    genre: { control: 'text' },
    duration: { control: 'text' },
    formatDurationToMinutes: { control: 'boolean' },
    date: { control: 'text' },
    startTime: { control: 'text' },
    trailerDuration: { control: 'text' },
    showEndTime: { control: 'boolean' },
    auditorium: { control: 'text' },
    language: { control: 'text' },
    experiences: { control: 'object' },
    selectedSeats: { control: 'object' },
    selectedTickets: { control: 'object' },
    showSelectedTickets: { control: 'boolean' },
    numberOfTickets: { control: 'text' },
    posterImageUrl: { control: 'text' },
    posterTagLabel: { control: 'text' },
    posterRatingValue: { 
      control: 'select',
      options: [
        'L', '6', '10', '12', '14', '16', '18',
        'AL', 'A6', 'A10', 'A12', 'A14', 'A16', 'A18', '?'
      ]
    },
    showPosterTag: { control: 'boolean' },
    showPosterRating: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof PreCheckoutSummary>;

// Dynamically grab today's date in YYYY-MM-DD format to test the "Hoje" logic
const todayIsoStr = new Date().toISOString().split('T')[0];

export const Playground: Story = {
  args: {
    movieName: 'A Odisséia',
    genre: 'Aventura, Ação',
    duration: '180',
    formatDurationToMinutes: true,
    date: todayIsoStr,
    startTime: '10:00',
    trailerDuration: '20',
    showEndTime: false,
    auditorium: '5',
    language: 'Dub',
    experiences: ['2D', 'VIP', 'Laser'],
    selectedSeats: ['B4', 'B5', 'B6'],
    selectedTickets: [], // Set to empty to demonstrate the empty state fix
    showSelectedTickets: true,
    numberOfTickets: '3',
    posterImageUrl: placeholderImg,
    posterTagLabel: 'Estreia',
    posterRatingValue: '18',
    showPosterTag: true,
    showPosterRating: true,
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    ...Playground.args,
    selectedTickets: ['1x Combo 2 Ingressos', '1x Inteira'], // Populated for dark theme variation
  },
};
