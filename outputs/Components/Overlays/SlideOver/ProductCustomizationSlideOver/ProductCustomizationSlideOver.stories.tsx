import type { Meta, StoryObj } from '@storybook/react';

import bucketImage from '@images/Concessions/balde-minions-1.png';
import grapeJuiceImage from '@images/Concessions/suco-uva-del-valle.png';
import waterImage from '@images/Concessions/agua-sem-gas-500ml.png';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import {
  ProductCustomizationSlideOver,
  type ProductCustomizationGroup,
} from './ProductCustomizationSlideOver';

const optionalItems: ProductCustomizationGroup = {
  id: 'optional-items',
  title: 'Opcionais',
  optional: true,
  options: [
    { id: 'mentos', name: 'Mentos Frutas Vermelhas', priceDelta: 4, originalPrice: 'R$ 5,00' },
    { id: 'diamante-negro', name: 'Diamante Negro', priceDelta: 5 },
    { id: 'kitkat', name: 'KitKat Ao Leite', priceDelta: 5 },
  ],
};

const customizationGroups: ProductCustomizationGroup[] = [
  {
    id: 'popcorn',
    title: 'Pipoca',
    requiredCount: 1,
    options: [
      { id: 'salted', name: 'Salgada' },
      { id: 'caramel', name: 'Caramelo' },
      { id: 'chocolate', name: 'Chocolate' },
    ],
  },
  {
    id: 'butter',
    title: 'Opções de Manteiga',
    requiredCount: 1,
    options: [
      { id: 'no-butter', name: 'Sem Manteiga' },
      { id: 'buttered', name: 'Amanteigada (Padrão)' },
      { id: 'extra-butter', name: 'Dupla Amanteigada (Extra)' },
    ],
  },
  {
    id: 'drink',
    title: 'Bebida',
    requiredCount: 1,
    options: [
      { id: 'coke', name: 'Coca-Cola' },
      { id: 'coke-zero', name: 'Coca-Cola Zero' },
      { id: 'guarana', name: 'Guaraná Antartica' },
    ],
  },
  {
    id: 'ice',
    title: 'Opções de Gelo',
    requiredCount: 1,
    options: [
      { id: 'regular-ice', name: 'Com Gelo (Padrão)' },
      { id: 'little-ice', name: 'Pouco Gelo' },
      { id: 'no-ice', name: 'Sem Gelo' },
    ],
  },
  optionalItems,
];

const meta = {
  title: 'Overlays/SlideOver/ProductCustomizationSlideOver',
  component: ProductCustomizationSlideOver,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
} satisfies Meta<typeof ProductCustomizationSlideOver>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCustomizations: Story = {
  args: {
    productName: 'Balde 1 Minions + Pipoca',
    productImageSrc: bucketImage,
    basePrice: 160,
    groups: customizationGroups,
  },
};

export const OptionalItemsOnly: Story = {
  args: {
    productName: 'Suco de Uva Del Valle',
    productImageSrc: grapeJuiceImage,
    basePrice: 160,
    groups: [{ ...optionalItems, options: optionalItems.options.map(option => ({ ...option, priceDelta: 5 })) }],
  },
};

export const SimpleProduct: Story = {
  args: {
    productName: 'Água Mineral Sem Gás 500ml',
    productImageSrc: waterImage,
    basePrice: 160,
    groups: [],
  },
};
