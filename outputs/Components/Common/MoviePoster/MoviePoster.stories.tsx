import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { MoviePoster } from './MoviePoster';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import placeholderImg from '@images/placeholder.png';

const meta: Meta<typeof MoviePoster> = {
  title: 'Components/MoviePoster',
  component: MoviePoster,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    imageUrl: { control: 'text' },
    movieTitle: { control: 'text' },
    showTag: { control: 'boolean' },
    tagLabel: { control: 'text' },
    showRating: { control: 'boolean' },
    ratingValue: { 
      control: 'select',
      options: [
        'L', '6', '10', '12', '14', '16', '18',
        'AL', 'A6', 'A10', 'A12', 'A14', 'A16', 'A18', '?'
      ]
    },
    isInteractive: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MoviePoster>;

export const Playground: Story = {
  args: {
    imageUrl: placeholderImg,
    movieTitle: 'Example Movie Title',
    showTag: true,
    tagLabel: 'Estreia',
    showRating: true,
    ratingValue: '18',
    isInteractive: false,
  },
};


export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    imageUrl: placeholderImg,
    movieTitle: 'Example Movie Title',
    showTag: true,
    tagLabel: 'Estreia',
    showRating: true,
    ratingValue: '18',
    isInteractive: false,
  },
};

