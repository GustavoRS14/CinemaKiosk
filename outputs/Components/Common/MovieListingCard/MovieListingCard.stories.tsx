import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MovieListingCard, type ShowtimeData } from './MovieListingCard';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import placeholderImg from '@images/placeholder.png';

const meta: Meta<typeof MovieListingCard> = {
  title: 'Components/MovieListingCard',
  component: MovieListingCard,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    type: {
      control: 'radio',
      options: ['Detailed', 'Simplified'],
    },
    showAuditorium: { control: 'boolean' },
    showExperienceBadges: { control: 'boolean' },
    formatDurationToMinutes: { control: 'boolean' },
    movieTitle: { control: 'text' },
    duration: { control: 'text' },
    genre: { control: 'text' },
    posterImageUrl: { control: 'text' },
    posterTagLabel: { control: 'text' },
    posterRatingValue: {
      control: 'select',
      options: [
        'L', '6', '10', '12', '14', '16', '18',
        'AL', 'A6', 'A10', 'A12', 'A14', 'A16', 'A18', '?'
      ]
    },
    blocks: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof MovieListingCard>;

const defaultShowtimes: ShowtimeData[] = [
  { time: '10:00', state: 'High', perc: 60, showtimeDate: '2099-01-01' },
  { time: '10:00', state: 'Normal', showtimeDate: '2099-01-01' },
  { time: '10:00', state: 'Critical', seats: 20, showtimeDate: '2099-01-01' },
  { time: '10:00', state: 'Normal', showtimeDate: '2099-01-01' },
];

const defaultBlocks = [
  { tag1: 'Dub', tag2: '2D', auditorium: '5', experiences: [{ text: 'IMAX' }, { text: 'Laser' }, { text: 'Infinity Vision' }, { text: 'VIP' }], showtimes: defaultShowtimes },
  { tag1: 'Dub', tag2: '3D', auditorium: '6', experiences: [{ text: 'IMAX' }, { text: 'Laser' }, { text: 'Infinity Vision' }, { text: 'VIP' }], showtimes: defaultShowtimes },
  { tag1: 'Leg', tag2: '3D', auditorium: '7', experiences: [{ text: '3D' }], showtimes: defaultShowtimes }
];

export const Playground: Story = {
  args: {
    type: 'Detailed',
    movieTitle: 'A Odisseia',
    duration: '90',
    genre: 'Ação, Aventura',
    showAuditorium: true,
    showExperienceBadges: false,
    formatDurationToMinutes: true,
    posterImageUrl: placeholderImg,
    posterTagLabel: 'Estreia',
    posterRatingValue: '18',
    blocks: defaultBlocks,
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    type: 'Detailed',
    movieTitle: 'A Odisseia',
    duration: '90',
    genre: 'Ação, Aventura',
    showAuditorium: true,
    showExperienceBadges: false,
    formatDurationToMinutes: true,
    posterImageUrl: placeholderImg,
    posterTagLabel: 'Estreia',
    posterRatingValue: '18',
    blocks: defaultBlocks,
  },
};
