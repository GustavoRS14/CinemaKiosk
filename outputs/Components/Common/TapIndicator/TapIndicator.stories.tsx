import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TapIndicator } from './TapIndicator';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof TapIndicator> = {
  title: 'Components/TapIndicator',
  component: TapIndicator,
  decorators: [(Story) => (
    <StoryTokenCanvas>
      {/* A photographic background is required to actually see the translucent glassmorphism & backdrop-blur effects. */}
      <div style={{ padding: '100px', background: 'url(https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80) center/cover no-repeat', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Story />
      </div>
    </StoryTokenCanvas>
  )],
  argTypes: {
    label: { control: 'text' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof TapIndicator>;

export const Playground: Story = {
  args: {
    label: 'TOQUE NA TELA',
  },
};
