import type { Meta, StoryObj } from '@storybook/react';

import { FilterChip } from './FilterChip';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/FilterChip',
  component: FilterChip,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  args: {
    state: 'Default',
    selected: true,
    text: 'Texto',
  },
  argTypes: {
    state: { control: 'inline-radio', options: ['Default', 'Pressed'] },
    selected: { control: 'boolean' },
    text: { control: 'text' },
    onClick: { action: 'clicked' },
  },
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=5136-14922',
    },
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Selected: Story = { args: { selected: true } };

export const Unselected: Story = { args: { selected: false } };

export const Pressed: Story = { args: { state: 'Pressed' } };

export const DarkTheme: Story = {
  decorators: [(Story) => <StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>],
};

export const AllFigmaVariants: Story = {
  render: () => (
    <StoryTokenCanvas>
      <div style={{ display: 'grid', gap: 'var(--Responsive-Spacing-sm)', gridTemplateColumns: 'repeat(2, max-content)' }}>
        <FilterChip state="Default" selected />
        <FilterChip state="Pressed" selected />
        <FilterChip state="Default" selected={false} />
        <FilterChip state="Pressed" selected={false} />
      </div>
    </StoryTokenCanvas>
  ),
};
