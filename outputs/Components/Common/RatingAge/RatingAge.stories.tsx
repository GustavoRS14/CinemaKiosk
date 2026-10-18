import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { RatingAge, RatingAgeVariant } from './RatingAge';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';

const meta: Meta<typeof RatingAge> = {
  title: 'Components/RatingAge',
  component: RatingAge,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    rating: {
      control: 'select',
      options: [
        'L', '6', '10', '12', '14', '16', '18',
        'AL', 'A6', 'A10', 'A12', 'A14', 'A16', 'A18', '?'
      ],
    },
    borderType: {
      control: 'radio',
      options: ['Fixed White', 'Theme Adaptive'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof RatingAge>;

export const Playground: Story = {
  args: {
    rating: 'A18',
    borderType: 'Fixed White',
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    rating: 'A18',
    borderType: 'Fixed White',
  },
};

const allVariants: RatingAgeVariant[] = [
  'L', '6', '10', '12', '14', '16', '18',
  'AL', 'A6', 'A10', 'A12', 'A14', 'A16', 'A18', '?'
];

export const AllRatings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Responsive-Spacing-lg, var(--Spacing-lg, 24px))' }}>
      <div>
        <h4 style={{ color: 'var(--Contextual-Text-Default-body, #fff)', marginBottom: '8px' }}>Fixed White</h4>
        <div style={{ display: 'flex', gap: 'var(--Responsive-Spacing-md, var(--Spacing-md, 16px))', flexWrap: 'wrap' }}>
          {allVariants.map((variant) => (
            <RatingAge key={`fixed-${variant}`} rating={variant} borderType="Fixed White" />
          ))}
        </div>
      </div>
      <div>
        <h4 style={{ color: 'var(--Contextual-Text-Default-body, #fff)', marginBottom: '8px' }}>Theme Adaptive</h4>
        <div style={{ display: 'flex', gap: 'var(--Responsive-Spacing-md, var(--Spacing-md, 16px))', flexWrap: 'wrap' }}>
          {allVariants.map((variant) => (
            <RatingAge key={`adaptive-${variant}`} rating={variant} borderType="Theme Adaptive" />
          ))}
        </div>
      </div>
    </div>
  ),
};
