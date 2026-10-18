import type { Meta, StoryObj } from '@storybook/react';
import { ShowtimeCarousel } from './ShowtimeCarousel';
import { ShowtimeButton } from '../ShowtimeButton';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/ShowtimeCarousel',
  component: ShowtimeCarousel,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <div style={{ width: '800px', maxWidth: '100vw' }}>
          <Story />
        </div>
      </StoryTokenCanvas>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof ShowtimeCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockChildren = Array.from({ length: 15 }).map((_, i) => (
  <ShowtimeButton key={i} time={`1${i % 10}:00`} showtimeDate="2099-01-01" selectable />
));

export const Playground: Story = {
  args: {
    orientation: 'horizontal',
    children: mockChildren,
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    children: mockChildren,
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <div style={{ height: '400px', display: 'flex' }}>
          <Story />
        </div>
      </StoryTokenCanvas>
    ),
  ],
};

export const DarkTheme: Story = {
  args: {
    orientation: 'horizontal',
    children: mockChildren,
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="dark">
        <div style={{ width: '800px', maxWidth: '100vw', background: 'var(--Contextual-surface-background, #1E1E1E)', padding: '20px' }}>
          <Story />
        </div>
      </StoryTokenCanvas>
    ),
  ],
};
