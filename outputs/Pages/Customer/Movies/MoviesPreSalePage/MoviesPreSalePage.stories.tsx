import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';

import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import { useOrientation } from '../../../useOrientation';
import { MoviesPreSalePage } from './MoviesPreSalePage';

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
  title: 'Pages/Customer/Movies/MoviesPreSalePage',
  component: MoviesPreSalePage,
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
} satisfies Meta<typeof MoviesPreSalePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FilteredResults: Story = {
  args: { activeFilters: ['2D', 'Dublado', 'Laser', 'Tarde'] },
};

export const EmptyResults: Story = {
  args: { activeFilters: ['IMAX', 'Dublado', 'Manhã'] },
};
