import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { StoryTokenCanvas } from '../../../../../StoryTokenCanvas';
import { useOrientation } from '../../../../useOrientation';
import { MovieConcessionsProductsPage } from './MovieConcessionsProductsPage';

const closingSoonSession = (() => {
  const start = new Date(Date.now() - 5 * 60_000);
  return {
    sessionStartTime: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
    showtimeDate: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
    salesCutoffMinutes: 15,
  };
})();

function ResponsiveStoryCanvas({ children }: { children: ReactNode }) {
  const orientation = useOrientation();
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
  title: 'Pages/Customer/Purchase/Movies/MovieConcessionsProductsPage',
  component: MovieConcessionsProductsPage,
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
} satisfies Meta<typeof MovieConcessionsProductsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SalesClosingSoon: Story = {
  args: closingSoonSession,
};

