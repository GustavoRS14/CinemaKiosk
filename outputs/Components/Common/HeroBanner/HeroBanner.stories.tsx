import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HeroBanner } from './HeroBanner';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import placeholderImg from '@images/placeholder.png';

const meta: Meta<typeof HeroBanner> = {
  title: 'Components/HeroBanner',
  component: HeroBanner,
  decorators: [(Story) => (
    <StoryTokenCanvas>
      <Story />
    </StoryTokenCanvas>
  )],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['Auto', 'Horizontal', 'Vertical'],
      description: 'Testa a troca de imagens manualmente sem precisar girar o monitor',
    },
    imageUrlHorizontal: { control: 'text' },
    imageUrlVertical: { control: 'text' },
    altText: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof HeroBanner>;

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
      <HeroBanner {...args} />
    </div>
  ),
  args: {
    orientation: 'Auto',
    imageUrlHorizontal: placeholderImg,
    imageUrlVertical: placeholderImg,
    altText: 'Campanha Promocional',
  },
};

export const HorizontalContainerPreview: Story = {
  render: (args) => (
    <div style={{ width: '800px', height: '400px', border: '2px dashed #1650AE', position: 'relative' }}>
      <HeroBanner {...args} />
    </div>
  ),
  args: {
    orientation: 'Horizontal',
    imageUrlHorizontal: placeholderImg,
    imageUrlVertical: placeholderImg,
    altText: 'Campanha Horizontal',
  },
};

export const VerticalContainerPreview: Story = {
  render: (args) => (
    <div style={{ width: '400px', height: '800px', border: '2px dashed #980038', position: 'relative' }}>
      <HeroBanner {...args} />
    </div>
  ),
  args: {
    orientation: 'Vertical',
    imageUrlHorizontal: placeholderImg,
    imageUrlVertical: placeholderImg,
    altText: 'Campanha Vertical',
  },
};
