import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import { ConcessionCartSlideOver, type ConcessionCartItem } from './ConcessionCartSlideOver';

import BaldeMinions from '@images/Concessions/balde-minions-1.png';
import ComboMedio from '@images/Concessions/combo-medio-700ml.png';
import Refrigerante1000 from '@images/Concessions/refrigerante-1000ml.png';
import Refrigerante500 from '@images/Concessions/refrigerante-500ml.png';
import Mentos from '@images/Concessions/mentos-frutas-vermelhas.png';
import DiamanteNegro from '@images/Concessions/diamante-negro.png';
import KitKat from '@images/Concessions/kitkat.png';
import PipocaPequena from '@images/Concessions/pipoca-pequena-base.png';

const baseItems: ConcessionCartItem[] = [
  { id: 'minions', category: 'Combos', productName: 'Balde 1 Minions + Pipoca', price: '160,00', imageUrl: BaldeMinions, quantity: 1 },
  { id: 'combo', category: 'Combos', productName: '2 Pipocas Médias + 2 Refrigerantes 700ml', price: '160,00', imageUrl: ComboMedio, quantity: 1 },
  { id: 'refri-1000', category: 'Bebidas', productName: 'Copo de Refrigerante 1000ml', price: '160,00', imageUrl: Refrigerante1000, quantity: 1 },
  { id: 'refri-500', category: 'Bebidas', productName: 'Copo de Refrigerante 500ml', price: '160,00', imageUrl: Refrigerante500, quantity: 1 },
  { id: 'mentos', category: 'Doces', productName: 'Mentos Frutas Vermelhas', price: '160,00', imageUrl: Mentos, quantity: 1 },
];

const suggestions: ConcessionCartItem[] = [
  { id: 'diamante', category: 'Doces', productName: 'Diamante Negro', price: '160,00', imageUrl: DiamanteNegro },
  { id: 'kitkat', category: 'Doces', productName: 'KitKat', price: '160,00', imageUrl: KitKat },
  { id: 'pipoca', category: 'Pipocas', productName: 'Pipoca Pequena', price: '160,00', imageUrl: PipocaPequena },
];

const meta = {
  title: 'Overlays/SlideOver/ConcessionCartSlideOver',
  component: ConcessionCartSlideOver,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  argTypes: {
    width: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof ConcessionCartSlideOver>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: { items: baseItems, suggestions },
};

export const PersonalizedProducts: Story = {
  args: {
    items: baseItems.map(item => ({
      ...item,
      flowType: 'Personalized',
      modifiers: item.id === 'minions'
        ? [{ quantity: 1, name: 'Salgada' }, { quantity: 1, name: 'Amanteigada (Padrão)' }, { quantity: 1, name: 'Coca-Cola Zero' }, { quantity: 1, name: 'Com Gelo (Padrão)' }]
        : [{ quantity: 1, name: 'Guaraná Antarctica' }, { quantity: 1, name: 'Sem Gelo' }],
    })),
    suggestions,
  },
};

export const Empty: Story = {
  args: { items: [], suggestions: [] },
};
