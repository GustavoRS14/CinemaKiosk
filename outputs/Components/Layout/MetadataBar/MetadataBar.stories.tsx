import type { Meta, StoryObj } from '@storybook/react';
import { MetadataBar } from './MetadataBar';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta = {
  title: 'Layout/MetadataBar',
  component: MetadataBar,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story/>
      </StoryTokenCanvas>
    ),
  ],
  args: {
    version: '1.0.0.1',
  },
  argTypes: {
    version: { control: 'text' },
  },
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=5776-57644&t=xmTw1hftwCXuH5c2-1',
    },
  },
} satisfies Meta<typeof MetadataBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
