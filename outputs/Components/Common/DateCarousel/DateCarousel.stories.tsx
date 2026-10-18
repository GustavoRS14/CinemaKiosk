import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { DateCarousel, type DateCarouselItem, type DateCarouselProps } from './DateCarousel';

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const createDates = (count: number): DateCarouselItem[] => Array.from({ length: count }, (_, index) => {
  const value = new globalThis.Date(2027, 2, 20 + index);
  return {
    id: value.toISOString().slice(0, 10),
    day: weekdays[value.getDay()],
    date: String(value.getDate()).padStart(2, '0'),
    month: months[value.getMonth()],
  };
});

function StatefulDateCarousel(props: DateCarouselProps) {
  const [selectedId, setSelectedId] = useState(props.selectedId ?? props.items[0]?.id);
  return <DateCarousel {...props} selectedId={selectedId} onSelect={setSelectedId} />;
}

const meta = {
  title: 'Components/DateCarousel',
  component: DateCarousel,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: (args) => <StatefulDateCarousel {...args} />,
} satisfies Meta<typeof DateCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SevenDays: Story = {
  args: {
    items: createDates(7),
    ariaLabel: 'Datas disponíveis',
  },
};

export const TwentyOneDays: Story = {
  args: {
    items: createDates(21),
    ariaLabel: 'Datas disponíveis',
  },
};

