import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { StoryTokenCanvas } from '../../../../../StoryTokenCanvas';
import { MovieOrderCheckoutPage, useCheckoutOrientation } from './MovieOrderCheckoutPage';

const closingSoonSession = (() => {
  const start = new Date(Date.now() - 5 * 60_000);
  return {
    sessionStartTime: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
    showtimeDate: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
    salesCutoffMinutes: 15,
  };
})();

function ResponsiveStoryCanvas({ children }: { children: ReactNode }) {
  const orientation = useCheckoutOrientation();
  return (
    <StoryTokenCanvas
      theme="Light"
      orientation={orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
    >
      {children}
    </StoryTokenCanvas>
  );
}

const meta = {
  title: 'Pages/Customer/Purchase/Movies/MovieOrderCheckoutPage',
  component: MovieOrderCheckoutPage,
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
} satisfies Meta<typeof MovieOrderCheckoutPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TicketsOnly: Story = {
  args: { orderContents: 'TicketsOnly' },
};

export const ConcessionsOnly: Story = {
  args: { orderContents: 'ConcessionsOnly' },
};

export const SalesClosingSoon: Story = {
  args: closingSoonSession,
};

