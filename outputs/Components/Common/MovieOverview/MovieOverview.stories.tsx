import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { MovieOverview } from './MovieOverview';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import placeholderImg from '@images/placeholder.png';

const meta: Meta<typeof MovieOverview> = {
  title: 'Components/MovieOverview',
  component: MovieOverview,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof MovieOverview>;

const mockArgs = {
  imageUrl: placeholderImg,
  movieTitle: 'A Odisséia',
  genre: 'Aventura',
  duration: '180min',
  synopsis: 'Acompanhe a saga de Odisseu, o lendário rei de Ítaca, em sua longa e perigosa jornada de retorno ao lar após a Guerra de Troia. O relato narra seus confrontos com seres míticos, como o ciclope Polifemo, as sedutoras sereias e a ninfa Calipso, enquanto ele luta contra o destino para se reencontrar com sua fiel esposa, Penélope.',
  cast: ['Matt Damon', 'Tom Holland', 'Anne Hathaway', 'Robert Pattinson', 'Himesh Patel', 'John Leguizamo', 'Charlize Theron'],
};

export const Playground: Story = {
  args: mockArgs,
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: mockArgs,
};
