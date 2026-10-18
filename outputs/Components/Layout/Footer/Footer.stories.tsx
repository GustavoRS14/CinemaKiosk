import type { Meta, StoryObj } from '@storybook/react';

import { Footer } from './Footer';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Layout/Footer',
  component: Footer,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  args: {
    actionLeft: true,
    price: '0,00',
    showCenterAction: true,
    showMainCta: true,
    showPrice: true,
    showTotalPrice: true,
  },
  argTypes: {
    actionLeft: { control: 'boolean' },
    price: { control: 'text' },
    showCenterAction: { control: 'boolean' },
    showMainCta: { control: 'boolean' },
    showPrice: { control: 'boolean' },
    showTotalPrice: { control: 'boolean' },
  },
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=5274-20450',
    },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    showCenterAction: false
  }
};
export const WithoutCenterAction: Story = { args: { showCenterAction: false } };
export const WithoutPrice: Story = { args: { showPrice: false } };
export const WithoutMainCta: Story = { args: { showMainCta: false } };

export const DarkTheme: Story = {
  decorators: [(Story) => <StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>],
};
