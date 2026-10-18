import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { RequirementTag } from './RequirementTag';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof RequirementTag> = {
  title: 'Components/RequirementTag',
  component: RequirementTag,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
};

export default meta;
type Story = StoryObj<typeof RequirementTag>;

export const Playground: Story = {
  args: {
    status: 'Incomplete',
    count: 1,
  },
};

export const Complete: Story = {
  args: {
    status: 'Complete',
    count: 1,
  },
};


export const DarkTheme: Story = {
  args: {
    status: 'Incomplete',
    count: 1,
  },
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
};
