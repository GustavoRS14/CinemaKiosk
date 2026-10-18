import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import { useOrientation } from '../../../useOrientation';
import { MovieDetailsPage, type MovieDetailsDate } from './MovieDetailsPage';

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const twentyOneDays: MovieDetailsDate[] = Array.from({ length: 21 }, (_, index) => {
  const value = new globalThis.Date(2027, 2, 20 + index);
  return {
    isoDate: value.toISOString().slice(0, 10),
    day: weekdays[value.getDay()],
    date: String(value.getDate()).padStart(2, '0'),
    month: months[value.getMonth()],
  };
});

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
  title: 'Pages/Customer/Movies/MovieDetailsPage',
  component: MovieDetailsPage,
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
} satisfies Meta<typeof MovieDetailsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwentyOneDays: Story = {
  args: {
    availableDates: twentyOneDays,
  },
};
