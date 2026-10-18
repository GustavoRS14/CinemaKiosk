import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NestedSelectionGroup } from './NestedSelectionGroup';
import { Choice_Chip } from '../Choice_Chip';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Components/NestedSelectionGroup',
  component: NestedSelectionGroup,
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
  },
} satisfies Meta<typeof NestedSelectionGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    groupTitle: 'Título do grupo',
    children: (
      <>
        <Choice_Chip optionName="Opção 1" />
        <Choice_Chip optionName="Opção 2" />
        <Choice_Chip optionName="Opção 3" />
        <Choice_Chip optionName="Opção 4" />
        <Choice_Chip optionName="Opção 5" />
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
