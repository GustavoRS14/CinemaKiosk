import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ArrowUpIcon from '@icons/arrow-up.svg';
import ChevronRightIcon from '@icons/chevron-right.svg';
import CheckIcon from '@icons/check.svg';
import CloseIcon from '@icons/close.svg';
import SearchIcon from '@icons/search.svg';

import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import {
  Button,
  type ButtonIntent,
  type ButtonState,
  type ButtonVariant,
} from './Button';



const meta = {
  title: 'Components/Button',
  component: Button,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  args: {
    intent: 'primary',
    variant: 'solid',
    state: 'default',
    label: 'Label',
    secondaryLabel: 'Secondary Label',
    showSecondaryLabel: true,
    showLeftIcon: true,
    showRightIcon: true,
    leftIcon: <ArrowUpIcon />,
    rightIcon: <ChevronRightIcon />,
    radius: 'lg',
    htmlType: 'button',
    disabled: false,
  },
  argTypes: {
    intent: {
      control: 'select',
      options: ['primary', 'information', 'neutral'],
    },
    variant: {
      control: 'select',
      options: ['solid', 'subtle', 'ghost', 'outlined'],
    },
    state: {
      control: 'inline-radio',
      options: ['default', 'pressed', 'disabled'],
    },
    radius: {
      control: 'select',
      options: ['2xs', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    label: { control: 'text' },
    secondaryLabel: { control: 'text' },
    showSecondaryLabel: { control: 'boolean' },
    showLeftIcon: { control: 'boolean' },
    showRightIcon: { control: 'boolean' },
    leftIcon: {
      options: ['None', 'ArrowUp', 'ChevronRight', 'Check', 'Close', 'Search'],
      mapping: {
        None: null,
        ArrowUp: <ArrowUpIcon />,
        ChevronRight: <ChevronRightIcon />,
        Check: <CheckIcon />,
        Close: <CloseIcon />,
        Search: <SearchIcon />,
      },
      control: { type: 'select' },
    },
    rightIcon: {
      options: ['None', 'ArrowUp', 'ChevronRight', 'Check', 'Close', 'Search'],
      mapping: {
        None: null,
        ArrowUp: <ArrowUpIcon />,
        ChevronRight: <ChevronRightIcon />,
        Check: <CheckIcon />,
        Close: <CloseIcon />,
        Search: <SearchIcon />,
      },
      control: { type: 'select' },
    },
    htmlType: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
  parameters: {
    controls: { expanded: true },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=5071-6789',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Pressed: Story = {
  args: { state: 'pressed' },
};

export const Disabled: Story = {
  args: { state: 'disabled' },
};

export const InformationGhost: Story = {
  args: { intent: 'information', variant: 'ghost' },
};

export const DarkTheme: Story = {
  render: (args) => (
    <StoryTokenCanvas theme="Dark">
      <Button {...args} />
    </StoryTokenCanvas>
  ),
};

export const HorizontalOrientation: Story = {
  render: (args) => (
    <StoryTokenCanvas orientation="Horizontal">
      <Button {...args} />
    </StoryTokenCanvas>
  ),
};

const validVariants: Array<{ intent: ButtonIntent; variant: ButtonVariant }> = [
  { intent: 'primary', variant: 'solid' },
  { intent: 'primary', variant: 'subtle' },
  { intent: 'information', variant: 'ghost' },
  { intent: 'neutral', variant: 'ghost' },
  { intent: 'primary', variant: 'outlined' },
  { intent: 'primary', variant: 'ghost' },
];
const states: ButtonState[] = ['default', 'pressed', 'disabled'];

export const AllFigmaVariants: Story = {
  args: {},
  render: () => (
    <StoryTokenCanvas>
      <div
        style={{
          display: 'grid',
          gap: 'var(--Primitive-Scale-400)',
          gridTemplateColumns: 'repeat(3, max-content)',
        }}
      >
        {validVariants.flatMap(({ intent, variant }) =>
          states.map((state) => (
            <Button
              key={`${intent}-${variant}-${state}`}
              intent={intent}
              variant={variant}
              state={state}
            />
          )),
        )}
      </div>
    </StoryTokenCanvas>
  ),
};

export const RadiusVariants: Story = {
  render: (args) => (
    <StoryTokenCanvas>
      {(['2xs', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map((radius) => (
        <Button key={radius} {...args} radius={radius} label={`Radius ${radius}`} />
      ))}
    </StoryTokenCanvas>
  ),
};

export const ContentProperties: Story = {
  args: {
    label: 'Continue',
    secondaryLabel: 'Review details',
    showSecondaryLabel: true,
    showLeftIcon: true,
    showRightIcon: false,
  },
};
