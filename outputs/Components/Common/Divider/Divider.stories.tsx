import React from 'react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['Solid', 'Dashed'],
    },
    state: {
      control: 'radio',
      options: ['Default', 'Disabled', 'Read Only'],
    },
  },
  args: {
    type: 'Solid',
    vertical: false,
    state: 'Default',
  },
  decorators: [
    (Story, context) => {
      const isVertical = context.args.vertical;
      return (
        <StoryTokenCanvas>
          <div style={{ width: isVertical ? '100px' : '300px', height: isVertical ? '300px' : '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Story/>
          </div>
        </StoryTokenCanvas>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Playground: Story = {};

export const DarkTheme: Story = {
  decorators: [
    (Story, context) => {
      const isVertical = context.args.vertical;
      return (
        <StoryTokenCanvas theme="Dark">
          <div style={{ width: isVertical ? '100px' : '300px', height: isVertical ? '300px' : '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Story/>
          </div>
        </StoryTokenCanvas>
      );
    },
  ],
};

export const Solid: Story = {
  args: {
    type: 'Solid',
  },
};

export const Dashed: Story = {
  args: {
    type: 'Dashed',
  },
};

export const VerticalSolid: Story = {
  args: {
    type: 'Solid',
    vertical: true,
  },
};

export const VerticalDashed: Story = {
  args: {
    type: 'Dashed',
    vertical: true,
  },
};

export const Disabled: Story = {
  args: {
    type: 'Solid',
    state: 'Disabled',
  },
};

export const ReadOnly: Story = {
  args: {
    type: 'Solid',
    state: 'Read Only',
  },
};
