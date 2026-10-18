import type { Meta, StoryObj } from '@storybook/react';

import odysseyPoster from '@images/a-odisseia-1.png';
import toyStoryPoster from '@images/toy-story-5-1.png';
import moanaPoster from '@images/moana-1.png';
import minionsPoster from '@images/minions-monstros-1.png';
import deadlyWatersPoster from '@images/aguas-mortais-1.png';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import { MovieSessionSelectionSlideOver } from './MovieSessionSelectionSlideOver';

const movies = [
  { id: 'odyssey', title: 'A Odisseia', supportingText: 'Ação | 18 Anos', posterUrl: odysseyPoster },
  { id: 'toy-story', title: 'Toy Story 5', supportingText: 'Animação | 6 Anos', posterUrl: toyStoryPoster },
  { id: 'moana', title: 'Moana', supportingText: 'Aventura | 10 Anos', posterUrl: moanaPoster },
  { id: 'minions', title: 'Minions & Monstros', supportingText: 'Animação | 10 Anos', posterUrl: minionsPoster },
  { id: 'deadly-waters', title: 'Águas Mortais', supportingText: 'Suspense | 16 Anos', posterUrl: deadlyWatersPoster },
];

const showtimeGroups = [
  { id: 'dub-2d', tags: [{ text: 'Dub', status: 'Brand' as const }, { text: '2D', status: 'Information' as const }], times: ['10:00', '12:30', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30', '23:45'] },
  { id: 'dub-3d', tags: [{ text: 'Dub', status: 'Brand' as const }, { text: '3D', status: 'Information' as const }], times: ['10:00', '13:00', '16:00'] },
  { id: 'leg-3d', tags: [{ text: 'Leg', status: 'Brand' as const }, { text: '3D', status: 'Information' as const }], times: ['10:00', '14:00', '18:00'] },
];

const meta = {
  title: 'Overlays/SlideOver/MovieSessionSelectionSlideOver',
  component: MovieSessionSelectionSlideOver,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
} satisfies Meta<typeof MovieSessionSelectionSlideOver>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MovieSelection: Story = { args: { type: 'movie', movies } };
export const ShowtimeSelection: Story = { args: { type: 'showtime', showtimeGroups } };
export const MovieNoResults: Story = { args: { type: 'movie', movies, searchValue: 'AAAAAAA' } };
export const ShowtimeNoResults: Story = {
  args: { type: 'showtime', showtimeGroups: [], activeFilters: ['2D', 'Legendado', 'Laser', 'Tarde'] },
};
