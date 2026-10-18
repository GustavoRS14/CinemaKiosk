import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { SettingsGroup } from './SettingsGroup';

const meta = {
  title: 'Admin/SettingsGroup',
  component: SettingsGroup,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    settingsTitle: { control: 'text' },
    settingsDescription: { control: 'text' },
    state: {
      control: 'radio',
      options: ['Default', 'Disabled', 'Read Only'],
    },
  },
} satisfies Meta<typeof SettingsGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    settingsTitle: 'Título da configuração',
    settingsDescription: 'Descrição da configuração',
    state: 'Default',
  },
};

export const DarkTheme: Story = {
  args: {
    ...Playground.args,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};
