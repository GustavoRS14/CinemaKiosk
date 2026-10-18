import type { Meta, StoryObj } from '@storybook/react';

import DiamanteNegro from '../../../Assets/Images/Concessions/diamante-negro.png';
import PipocaGrande from '../../../Assets/Images/Concessions/pipoca-grande.png';
import Refrigerante1000ml from '../../../Assets/Images/Concessions/refrigerante-1000ml.png';
import Refrigerante500ml from '../../../Assets/Images/Concessions/refrigerante-500ml.png';
import Refrigerante700ml from '../../../Assets/Images/Concessions/refrigerante-700ml.png';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { OfferDialog, type OfferProduct } from './OfferDialog';

const candy: OfferProduct = {
  id: 'diamante-negro',
  name: 'Diamante Negro',
  image: DiamanteNegro,
  price: 160,
  category: 'candy',
};

const popcorn: OfferProduct = {
  id: 'pipoca-grande',
  name: 'Pipoca Grande',
  image: PipocaGrande,
  price: 160,
  category: 'popcorn',
};

const smallDrink: OfferProduct = {
  id: 'refrigerante-500ml',
  name: 'Copo de Refrigerante 500ml',
  image: Refrigerante500ml,
  price: 133,
  category: 'beverage',
  upgradeLevel: 1,
};

const mediumDrink: OfferProduct = {
  id: 'refrigerante-700ml',
  name: 'Copo de Refrigerante 700ml',
  image: Refrigerante700ml,
  price: 149,
  category: 'beverage',
  upgradeLevel: 2,
};

const largeDrink: OfferProduct = {
  id: 'refrigerante-1000ml',
  name: 'Copo de Refrigerante 1000ml',
  image: Refrigerante1000ml,
  price: 160,
  category: 'beverage',
  upgradeLevel: 3,
};

const meta = {
  title: 'Overlays/OfferDialog',
  component: OfferDialog,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['pre-checkout', 'cross-sell', 'upgrade', 'combo-offer'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OfferDialog>;

export default meta;
type Story = StoryObj<typeof OfferDialog>;

export const PreCheckout: Story = {
  args: { variant: 'pre-checkout', product: candy, size: 'md' },
};

export const CrossSell: Story = {
  args: { variant: 'cross-sell', product: popcorn, size: 'md' },
};

export const Upgrade: Story = {
  args: {
    variant: 'upgrade',
    selectedProduct: mediumDrink,
    upgradeOptions: [largeDrink, smallDrink, mediumDrink],
    size: 'md',
  },
};

export const ComboOffer: Story = {
  args: {
    variant: 'combo-offer',
    product: largeDrink,
    discountedPrice: 144,
    size: 'md',
  },
};
