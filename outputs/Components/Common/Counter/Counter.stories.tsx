import type { Meta, StoryObj } from '@storybook/react';
import { Counter } from './Counter';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/Counter',
  component: Counter,
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
    state: {
      control: 'radio',
      options: ['Minimum', 'Default', 'Maximum', 'Disabled'],
      description: 'Figma State property',
    },
    value: {
      control: 'number',
      description: 'Controlled value of the counter',
    },
    defaultValue: {
      control: 'number',
      description: 'Uncontrolled initial value',
    },
    onChange: {
      action: 'changed',
      description: 'Fired when a button is clicked',
    },
    showValidationTooltip: {
      control: 'boolean',
      description: 'Toggles the validation tooltip visibility',
    },
    validationMessage: {
      control: 'text',
      description: 'Text for the validation tooltip',
    },
  },
} satisfies Meta<typeof Counter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    state: 'Default',
    defaultValue: 0,
    showValidationTooltip: false,
    validationMessage: 'Selecione 3 ingressos para continuar',
  },
};

export const Default: Story = {
  args: {
    state: 'Default',
    defaultValue: 5,
  },
};

export const Minimum: Story = {
  args: {
    state: 'Minimum',
    defaultValue: 0,
  },
};

export const Maximum: Story = {
  args: {
    state: 'Maximum',
    defaultValue: 10,
  },
};

export const Disabled: Story = {
  args: {
    state: 'Disabled',
    defaultValue: 0,
  },
};

export const DarkTheme: Story = {
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
