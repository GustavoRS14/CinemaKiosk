import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SectionHeader } from './SectionHeader';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import { TextButton } from '../../Common/TextButton';
import IconTrash from '@icons/trash.svg';

const meta = {
  title: 'Admin/SectionHeader',
  component: SectionHeader,
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
    title: { control: 'text' },
    showActions: { control: 'boolean' },
    showSecondaryAction: { control: 'boolean' },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: 'Título da Seção',
    showActions: false,
    showSecondaryAction: false,
    primaryAction: <TextButton label="Action" hasRightIcon={true} intent="Information" />,
    secondaryAction: <TextButton label="Cancelar" hasRightIcon={true} rightIcon={<IconTrash />} intent="Danger" />,
  },
};

export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  args: {
    title: 'Título da Seção',
    showActions: false,
    showSecondaryAction: false,
    primaryAction: <TextButton label="Action" hasRightIcon={true} intent="Information" />,
    secondaryAction: <TextButton label="Cancelar" hasRightIcon={true} rightIcon={<IconTrash />} intent="Danger" />,
  },
};
