import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SettingsGroup } from './SettingsGroup';
import { CheckableCard } from '../../Admin/CheckableCard';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/SettingsGroup',
  component: SettingsGroup,
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
  },
} satisfies Meta<typeof SettingsGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    settingsTitle: 'Título da configuração',
    settingsDescription: 'Descrição da configuração',
    children: (
      <>
        <CheckableCard selected />
        <CheckableCard />
      </>
    ),
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
  args: {
    ...Playground.args,
  },
};
