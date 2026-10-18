import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HeroCarousel } from './HeroCarousel';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import placeholderImg from '@images/placeholder.png';

const meta: Meta<typeof HeroCarousel> = {
  title: 'Components/HeroCarousel',
  component: HeroCarousel,
  decorators: [(Story) => (
    <StoryTokenCanvas>
      <Story />
    </StoryTokenCanvas>
  )],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['Auto', 'Horizontal', 'Vertical'],
      description: 'Testa a troca de orientação em massa para todos os banners do carrossel',
    },
    interval: {
      control: { type: 'number', min: 1000, max: 15000, step: 1000 },
      description: 'Tempo de transição entre os slides (ms)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeroCarousel>;

const mockItems = [
  {
    id: '1',
    imageUrlHorizontal: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    imageUrlVertical: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&h=1200&q=80',
    altText: 'Slide 1 - Cinema',
  },
  {
    id: '2',
    imageUrlHorizontal: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=80',
    imageUrlVertical: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&h=1200&q=80',
    altText: 'Slide 2 - Filme Clássico',
  },
  {
    id: '3',
    imageUrlHorizontal: placeholderImg,
    imageUrlVertical: placeholderImg,
    altText: 'Slide 3 - Placeholder Promocional',
  }
];

export const Playground: Story = {
  render: (args) => (
    <div style={{
      width: '800px',
      height: '500px',
      maxWidth: '100%',
      border: '2px solid #CBD5E1',
      position: 'relative',
      resize: 'both',
      overflow: 'hidden',
      padding: '0'
    }}>
      <HeroCarousel {...args} />
    </div>
  ),
  args: {
    orientation: 'Auto',
    interval: 3000, // Speeding up to 3 seconds for easier testing in Storybook
    items: mockItems,
  },
};

export const HorizontalContainerPreview: Story = {
  render: (args) => (
    <div style={{ width: '800px', height: '400px', border: '2px dashed #1650AE', position: 'relative' }}>
      <HeroCarousel {...args} />
    </div>
  ),
  args: {
    orientation: 'Horizontal',
    interval: 7000,
    items: mockItems,
  },
};

export const VerticalContainerPreview: Story = {
  render: (args) => (
    <div style={{ width: '400px', height: '800px', border: '2px dashed #980038', position: 'relative' }}>
      <HeroCarousel {...args} />
    </div>
  ),
  args: {
    orientation: 'Vertical',
    interval: 7000,
    items: mockItems,
  },
};
