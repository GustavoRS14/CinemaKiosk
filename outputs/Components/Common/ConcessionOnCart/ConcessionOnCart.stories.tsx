import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { ConcessionOnCart } from './ConcessionOnCart';

const meta = {
  title: 'Components/ConcessionOnCart',
  component: ConcessionOnCart,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story/>
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['Default', 'Removed'],
    },
    flowType: {
      control: 'select',
      options: ['Express', 'Personalized'],
    },
    quantity: {
      control: 'number',
    },
    onQuantityChange: { action: 'quantity changed' },
    onEdit: { action: 'edit clicked' },
    onUndo: { action: 'undo clicked' },
    hasModifiers: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ConcessionOnCart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Use a placeholder image from an external source or local assets if available
const placeholderImg = "https://via.placeholder.com/150";

// 1. Playground
export const Playground: Story = {
  args: {
    status: 'Default',
    flowType: 'Express',
    productName: 'Pipoca Grande Salgada',
    price: '25,00',
    imageUrl: placeholderImg,
    quantity: 1,
  },
};

// 2. Dark Theme Playground
export const DarkTheme: Story = {
  args: {
    ...Playground.args,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    theme: 'dark',
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};

// 3. Variant: Default Express
export const ExpressDefault: Story = {
  args: {
    status: 'Default',
    flowType: 'Express',
    productName: 'Refrigerante 500ml',
    price: '12,00',
    imageUrl: placeholderImg,
    quantity: 2,
  },
};

// 4. Variant: Default Personalized
export const PersonalizedDefault: Story = {
  args: {
    status: 'Default',
    flowType: 'Personalized',
    productName: 'Combo Família',
    price: '85,00',
    imageUrl: placeholderImg,
    quantity: 1,
    hasModifiers: true,
  },
};

// 5. Variant: Removed Express
export const ExpressRemoved: Story = {
  args: {
    status: 'Removed',
    flowType: 'Express',
    productName: 'Refrigerante 500ml',
    price: '12,00',
    imageUrl: placeholderImg,
  },
};

// 6. Variant: Removed Personalized
export const PersonalizedRemoved: Story = {
  args: {
    status: 'Removed',
    flowType: 'Personalized',
    productName: 'Combo Famlia',
    price: '85,00',
    imageUrl: placeholderImg,
  },
};
