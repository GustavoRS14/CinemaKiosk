import ComboDoubleImage from '@images/Concessions/combo-duplo-700ml.png';
import ComboMediumImage from '@images/Concessions/combo-medio-700ml.png';
import ComboSmallImage from '@images/Concessions/combo-pequeno-500ml.png';
import MinionsBucketOneImage from '@images/Concessions/balde-minions-1.png';
import MinionsBucketTwoImage from '@images/Concessions/balde-minions-2.png';
import ToyStoryBucketImage from '@images/Concessions/balde-toy-story-5.png';
import MoanaBucketImage from '@images/Concessions/balde-moana.png';
import PopcornLargeImage from '@images/Concessions/pipoca-grande.png';
import PopcornMediumImage from '@images/Concessions/pipoca-media.png';
import PopcornSmallBaseImage from '@images/Concessions/pipoca-pequena-base.png';
import PopcornSmallOverlayImage from '@images/Concessions/pipoca-pequena-overlay.png';
import RefillDrinkImage from '@images/Concessions/refrigerante-1000ml-refil.png';
import Drink1000Image from '@images/Concessions/refrigerante-1000ml.png';
import Drink700Image from '@images/Concessions/refrigerante-700ml.png';
import Drink500Image from '@images/Concessions/refrigerante-500ml.png';
import StillWaterImage from '@images/Concessions/agua-sem-gas-500ml.png';
import SparklingWaterImage from '@images/Concessions/agua-com-gas-500ml.png';
import GrapeJuiceImage from '@images/Concessions/suco-uva-del-valle.png';
import KitKatImage from '@images/Concessions/kitkat.png';
import DiamanteNegroImage from '@images/Concessions/diamante-negro.png';
import MentosImage from '@images/Concessions/mentos-frutas-vermelhas.png';
import MinionsCollectibleImage from '@images/Concessions/balde-minions-2-sem-pipoca.png';
import MarioCollectibleImage from '@images/Concessions/balde-super-mario-galaxy.png';
import ToyStoryCupImage from '@images/Concessions/copo-toy-story-5.png';
import type { ProductCustomizationGroup } from '@components/Overlays/SlideOver/ProductCustomizationSlideOver';

export type ConcessionCategoryId = 'combos' | 'popcorn' | 'beverages' | 'candy' | 'collectibles';

export type ConcessionProduct = {
  id: string;
  title: string;
  imageUrl: string;
  imageUrls?: string[];
  price: number;
  customizationGroups?: ProductCustomizationGroup[];
};

const popcornCustomization: ProductCustomizationGroup[] = [
  {
    id: 'popcorn-flavor', title: 'Pipoca', requiredCount: 1,
    options: [{ id: 'salted', name: 'Salgada' }, { id: 'caramel', name: 'Caramelo' }, { id: 'chocolate', name: 'Chocolate' }],
  },
  {
    id: 'butter', title: 'Opções de Manteiga', optional: true,
    options: [{ id: 'no-butter', name: 'Sem Manteiga' }, { id: 'buttered', name: 'Amanteigada' }, { id: 'extra-butter', name: 'Dupla Amanteigada', priceDelta: 3 }],
  },
];

const drinkCustomization: ProductCustomizationGroup[] = [{
  id: 'ice', title: 'Opções de Gelo', optional: true,
  options: [{ id: 'regular-ice', name: 'Com Gelo' }, { id: 'little-ice', name: 'Pouco Gelo' }, { id: 'no-ice', name: 'Sem Gelo' }],
}];

const comboCustomization: ProductCustomizationGroup[] = [
  ...popcornCustomization,
  {
    id: 'drink', title: 'Bebida', requiredCount: 1,
    options: [{ id: 'coke', name: 'Coca-Cola' }, { id: 'coke-zero', name: 'Coca-Cola Zero' }, { id: 'guarana', name: 'Guaraná Antarctica' }],
  },
  ...drinkCustomization,
];

export const CONCESSION_PRODUCTS: Record<ConcessionCategoryId, ConcessionProduct[]> = {
  combos: [
    { id: 'double-combo', title: '2 Pipocas Médias + 2 Refrigerantes 700ml', imageUrl: ComboDoubleImage, price: 160, customizationGroups: comboCustomization },
    { id: 'medium-combo', title: 'Pipoca Média + Refrigerante 700ml', imageUrl: ComboMediumImage, price: 160, customizationGroups: comboCustomization },
    { id: 'small-combo', title: 'Pipoca Pequena + Refrigerante 500ml', imageUrl: ComboSmallImage, price: 160, customizationGroups: comboCustomization },
    { id: 'minions-one', title: 'Balde 1 Minions + Pipoca', imageUrl: MinionsBucketOneImage, price: 160 },
    { id: 'minions-two', title: 'Balde 2 Minions + Pipoca', imageUrl: MinionsBucketTwoImage, price: 160 },
    { id: 'toy-story', title: 'Balde Toy Story 5 + Pipoca', imageUrl: ToyStoryBucketImage, price: 160 },
    { id: 'moana', title: 'Balde Moana + Pipoca', imageUrl: MoanaBucketImage, price: 160 },
  ],
  popcorn: [
    { id: 'popcorn-large', title: 'Pipoca Grande', imageUrl: PopcornLargeImage, price: 160, customizationGroups: popcornCustomization },
    { id: 'popcorn-medium', title: 'Pipoca Média', imageUrl: PopcornMediumImage, price: 160, customizationGroups: popcornCustomization },
    {
      id: 'popcorn-small',
      title: 'Pipoca Pequena',
      imageUrl: PopcornSmallOverlayImage,
      imageUrls: [PopcornSmallBaseImage, PopcornSmallOverlayImage],
      price: 160,
      customizationGroups: popcornCustomization,
    },
  ],
  beverages: [
    { id: 'drink-refill-1000', title: 'Copo de Refrigerante 1000ml Free Refill', imageUrl: RefillDrinkImage, price: 160, customizationGroups: drinkCustomization },
    { id: 'drink-1000', title: 'Copo de Refrigerante 1000ml', imageUrl: Drink1000Image, price: 160, customizationGroups: drinkCustomization },
    { id: 'drink-700', title: 'Copo de Refrigerante 700ml', imageUrl: Drink700Image, price: 160, customizationGroups: drinkCustomization },
    { id: 'drink-500', title: 'Copo de Refrigerante 500ml', imageUrl: Drink500Image, price: 160, customizationGroups: drinkCustomization },
    { id: 'water-still-500', title: 'Água Mineral Sem Gás 500ml', imageUrl: StillWaterImage, price: 160 },
    { id: 'water-sparkling-500', title: 'Água Mineral Com Gás 500ml', imageUrl: SparklingWaterImage, price: 160 },
    { id: 'grape-juice', title: 'Suco de Uva Del Valle', imageUrl: GrapeJuiceImage, price: 160 },
  ],
  candy: [
    { id: 'kitkat', title: 'KitKat', imageUrl: KitKatImage, price: 160 },
    { id: 'diamante-negro', title: 'Diamante Negro', imageUrl: DiamanteNegroImage, price: 160 },
    { id: 'mentos-red-fruits', title: 'Mentos Frutas Vermelhas', imageUrl: MentosImage, price: 160 },
  ],
  collectibles: [
    { id: 'minions-collectible', title: 'Balde 2 Minions Sem Pipoca', imageUrl: MinionsCollectibleImage, price: 160 },
    { id: 'mario-collectible', title: 'Balde Super Mário Galaxy Sem Pipoca', imageUrl: MarioCollectibleImage, price: 160 },
    { id: 'toy-story-cup', title: 'Copo Toy Story 5 Sem Bebida', imageUrl: ToyStoryCupImage, price: 160 },
  ],
};

export const CONCESSION_CATEGORIES: Array<{
  id: ConcessionCategoryId;
  label: string;
  imageUrl: string;
}> = [
  { id: 'combos', label: 'Combos', imageUrl: CONCESSION_PRODUCTS.combos[0].imageUrl },
  { id: 'popcorn', label: 'Pipoca', imageUrl: CONCESSION_PRODUCTS.popcorn[0].imageUrl },
  { id: 'beverages', label: 'Bebidas', imageUrl: CONCESSION_PRODUCTS.beverages[0].imageUrl },
  { id: 'candy', label: 'Doces', imageUrl: CONCESSION_PRODUCTS.candy[0].imageUrl },
  { id: 'collectibles', label: 'Colecionáveis', imageUrl: CONCESSION_PRODUCTS.collectibles[0].imageUrl },
];

export const ALL_CONCESSION_PRODUCTS = Object.values(CONCESSION_PRODUCTS).flat();

export const formatConcessionPrice = (price: number) => price.toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
