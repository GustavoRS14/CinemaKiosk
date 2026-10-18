import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import { FilterSlideOver, type FilterSelection, type FilterSlideOverProps } from './FilterSlideOver';

const meta = {
  title: 'Overlays/SlideOver/FilterSlideOver',
  component: FilterSlideOver,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
} satisfies Meta<typeof FilterSlideOver>;

export default meta;
type Story = StoryObj<typeof meta>;

function Interactive(args: FilterSlideOverProps) {
  const [selections, setSelections] = useState<FilterSelection[]>([]);
  return <FilterSlideOver {...args} selectedIds={selections.map(({ id }) => id)} onSelectionChange={setSelections} />;
}

export const Default: Story = {
  render: Interactive,
};

export const Selected: Story = {
  args: { selectedIds: ['dubbed', '2d', 'laser', 'action', 'comedy', 'afternoon', 'night'] },
};
