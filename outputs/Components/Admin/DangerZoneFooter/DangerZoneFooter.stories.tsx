import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DangerZoneFooter } from './DangerZoneFooter';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Admin/DangerZoneFooter',
  component: DangerZoneFooter,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  args: {
    title: 'Controles do Sistema',
    subtitle: 'Estas ações deixarão o totem indisponível para os clientes.',
    primaryActionLabel: 'Fechar Sistema',
    secondaryActionLabel: 'Reiniciar Sistema',
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    primaryActionLabel: { control: 'text' },
    secondaryActionLabel: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    onPrimaryAction: { action: 'onPrimaryAction' },
    onSecondaryAction: { action: 'onSecondaryAction' },
  },
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=6377-52065',
    },
  },
} satisfies Meta<typeof DangerZoneFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => <StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>],
};
