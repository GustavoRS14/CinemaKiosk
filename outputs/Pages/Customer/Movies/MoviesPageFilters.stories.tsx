import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { HashRouter } from 'react-router-dom';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import { MoviesPageFilters, MoviesEmptyState } from './MoviesPageFilters';

const meta = {
  title: 'Pages/Customer/Movies/MoviesPageFilters',
  component: MoviesPageFilters,
  decorators: [
    (Story) => (
      <HashRouter>
        <StoryTokenCanvas>
          <div style={{ padding: '24px', width: '100%', maxWidth: '1024px', margin: '0 auto' }}>
            <Story />
          </div>
        </StoryTokenCanvas>
      </HashRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MoviesPageFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Default Filters State
export const Default: Story = {
  args: {
    activeFilters: [],
    selectedTab: 0,
    showPreSale: true,
    onRemoveFilter: () => console.log('Remove filter clicked'),
  },
};

// 2. With Active Filters
export const WithActiveFilters: Story = {
  args: {
    activeFilters: ['Aventura', 'Dublado', 'VIP'],
    selectedTab: 0,
    showPreSale: true,
    onRemoveFilter: (filter) => console.log(`Remove filter: ${filter}`),
  },
};

// 3. Hidden Pre-Sale Tab
export const HiddenPreSale: Story = {
  args: {
    activeFilters: [],
    selectedTab: 1,
    showPreSale: false,
    onRemoveFilter: () => console.log('Remove filter clicked'),
  },
};

// 4. Empty State View
export const EmptyState: StoryObj<typeof MoviesEmptyState> = {
  render: () => <MoviesEmptyState onClearFilters={() => console.log('Clear filters clicked')} />,
};
