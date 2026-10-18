import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';

import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import { useOrientation } from '../../../useOrientation';
import { MoviesNowPlayingPage } from './MoviesNowPlayingPage';

function ResponsiveStoryCanvas({ children }: { children: ReactNode }) {
  const orientation = useOrientation();

  return (
    <StoryTokenCanvas
      theme="Light"
      orientation={orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
      fullBleed
    >
      {children}
    </StoryTokenCanvas>
  );
}

const meta = {
  title: 'Pages/Customer/Movies/MoviesNowPlayingPage',
  component: MoviesNowPlayingPage,
  decorators: [
    (Story) => (
      <HashRouter>
        <ResponsiveStoryCanvas>
          <Story />
        </ResponsiveStoryCanvas>
      </HashRouter>
    ),
  ],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MoviesNowPlayingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ManySessions: Story = {
  args: { manySessions: true },
};

export const SessionsEnded: Story = {
  args: { referenceTime: '2027-03-20T23:59:00' },
};

export const PremiereWindow: Story = {
  args: { referenceTime: '2027-03-23T12:00:00' },
};

export const FilteredResults: Story = {
  args: { activeFilters: ['2D', 'Dublado', 'Laser', 'Manhã'] },
};

export const EmptyResults: Story = {
  args: { activeFilters: ['Legendado', 'Noite'] },
};
