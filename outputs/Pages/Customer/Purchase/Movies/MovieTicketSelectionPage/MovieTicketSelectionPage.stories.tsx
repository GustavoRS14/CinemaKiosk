import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { StoryTokenCanvas } from '../../../../../StoryTokenCanvas';
import { useOrientation } from '../../../../useOrientation';
import { MovieTicketSelectionPage } from './MovieTicketSelectionPage';

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
  title: 'Pages/Customer/Purchase/Movies/MovieTicketSelectionPage',
  component: MovieTicketSelectionPage,
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
} satisfies Meta<typeof MovieTicketSelectionPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SalesClosingSoon: Story = {
  args: closingSoonSession,
};

export const StandardAndVipSeats: Story = {
  args: {
    selectedSeats: [
      { label: 'B4', kind: 'Comum' },
      { label: 'B5', kind: 'Comum' },
      { label: 'B6', kind: 'VIP' },
    ],
  },
};

export const ExtensiveTicketList: Story = {
  args: {
    selectedSeats: [
      { label: 'B4', kind: 'Comum' },
      { label: 'B5', kind: 'Comum' },
      { label: 'B6', kind: 'Comum' },
    ],
    ticketOptions: {
      Padrão: [
        { id: 'full', type: 'Inteira', price: '40,00', supportingText: '' },
        { id: 'combo', type: 'Combo 2 Ingressos', price: '30,00', supportingText: 'Ingresso Promocional', ticketsPerPackage: 2 },
        { id: 'half', type: 'Meia', price: '20,00', supportingText: '' },
        { id: 'club', type: 'Clube de Vantagens', price: '18,00', supportingText: 'Ingresso Promocional' },
        { id: 'student', type: 'Estudante', price: '20,00', supportingText: 'Apresente o comprovante' },
        { id: 'senior', type: 'Melhor Idade', price: '20,00', supportingText: 'Apresente o comprovante' },
        { id: 'child', type: 'Infantil', price: '20,00', supportingText: '' },
        { id: 'partner', type: 'Convênio Parceiro', price: '22,00', supportingText: 'Apresente o comprovante' },
      ],
    },
  },
};

