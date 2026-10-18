import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ListItemGroup } from './ListItemGroup';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/ListItemGroup',
  component: ListItemGroup,
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
    state: {
      control: 'radio',
      options: ['Default', 'Disabled', 'Read Only'],
    },
    defaultSelected: {
      control: 'boolean',
    },
    selected: {
      control: 'boolean',
    },
    showSettingsGroup: {
      control: 'boolean',
    },
    showSubfeatures: {
      control: 'boolean',
    },
    showSuffix: { control: 'boolean' },
    showSecondaryTitle: { control: 'boolean' },
    showDescription: { control: 'boolean' },
    suffix: { control: 'text' },
    secondaryTitle: { control: 'text' },
    description: { control: 'text' },
    actionSlot: {
      control: 'text',
    },
    bottomSlot: {
      control: 'text',
    },
  },
} satisfies Meta<typeof ListItemGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: 'Título',
    showSuffix: false,
    suffix: 'Sufixo',
    showSecondaryTitle: false,
    secondaryTitle: 'Título Secundário',
    showDescription: false,
    description: 'Descrição',
    defaultSelected: true,
    state: 'Default',
    showSettingsGroup: true,
    showSubfeatures: true,
    subfeatures: [
      {
        groupTitle: 'SubFeatures 1',
        items: [{ label: 'Opção' }, { label: 'Opção' }]
      },
      {
        groupTitle: 'SubFeatures 2',
        items: [{ label: 'Opção' }, { label: 'Opção' }]
      }
    ]
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
  args: {
    ...Playground.args,
  },
};
