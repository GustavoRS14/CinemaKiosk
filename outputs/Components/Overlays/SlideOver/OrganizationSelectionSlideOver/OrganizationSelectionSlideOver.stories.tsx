import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import {
  OrganizationSelectionSlideOver,
  type OrganizationSelectionOption,
  type OrganizationSelectionSlideOverProps,
} from './OrganizationSelectionSlideOver';

const meta = {
  title: 'Overlays/SlideOver/OrganizationSelectionSlideOver',
  component: OrganizationSelectionSlideOver,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
} satisfies Meta<typeof OrganizationSelectionSlideOver>;

export default meta;
type Story = StoryObj<typeof meta>;

function Interactive(args: OrganizationSelectionSlideOverProps) {
  const [selected, setSelected] = useState<OrganizationSelectionOption>();
  return <OrganizationSelectionSlideOver {...args} selectedId={selected?.id} onSelect={setSelected} />;
}

export const Network: Story = {
  args: { type: 'network' },
  render: Interactive,
};

export const Complex: Story = {
  args: { type: 'complex', networkSelected: true },
  render: Interactive,
};

export const ComplexWithoutNetwork: Story = {
  args: { type: 'complex', networkSelected: false },
};

export const NoResultsNetwork: Story = {
  args: { type: 'network', searchValue: 'AAAAAAA' },
};

export const NoResultsComplex: Story = {
  args: { type: 'complex', networkSelected: true, searchValue: 'AAAAAAA' },
};
