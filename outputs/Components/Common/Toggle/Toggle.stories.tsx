import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { StoryTokenCanvas } from '../../../StoryTokenCanvas';
import { Toggle, type ToggleState } from './Toggle';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  decorators: [
    (Story) => (
      <StoryTokenCanvas>
        <Story />
      </StoryTokenCanvas>
    ),
  ],
  args: {
    defaultActive: false,
    state: 'default',
    disabled: false,
    htmlType: 'button',
  },
  argTypes: {
    isActive: {
      control: 'boolean',
      description: 'Active (on) state. Omit for uncontrolled mode (component manages its own state).',
    },
    defaultActive: {
      control: 'boolean',
      description: 'Initial active state for uncontrolled mode.',
    },
    state: {
      control: 'inline-radio',
      options: ['default', 'pressed', 'disabled'],
    },
    disabled: { control: 'boolean' },
    htmlType: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
    onActiveChange: { action: 'activeChange' },
  },
  parameters: {
    controls: { expanded: true },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=5153-12270',
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Interactive playground.
 * Uses a stateful wrapper to sync with Storybook controls, so both
 * clicking the component AND toggling the control panel work perfectly.
 */
export const Playground: Story = {};

/**
 * Starts in the active/on state. Still interactive — click to toggle off.
 */
export const ActiveByDefault: Story = {
  render: (args) => {
    function ActiveToggle() {
      const [isActive, setIsActive] = useState(true);
      return (
        <Toggle
          {...args}
          isActive={isActive}
          onActiveChange={(next) => {
            setIsActive(next);
            args.onActiveChange?.(next);
          }}
          aria-label="Active toggle"
        />
      );
    }
    return <ActiveToggle />;
  },
};

/** Visual — inactive track in held-down pressed state. */
export const InactivePressed: Story = {
  args: { state: 'pressed' },
};

/** Visual — active track in held-down pressed state. */
export const ActivePressed: Story = {
  render: (args) => {
    function ActivePressedToggle() {
      const [isActive, setIsActive] = useState(true);
      return (
        <Toggle
          {...args}
          isActive={isActive}
          state="pressed"
          onActiveChange={(next) => {
            setIsActive(next);
            args.onActiveChange?.(next);
          }}
          aria-label="Active pressed toggle"
        />
      );
    }
    return <ActivePressedToggle />;
  },
};

/** Disabled and inactive — cannot be toggled. */
export const DisabledInactive: Story = {
  args: { state: 'disabled' },
};

/** Disabled and active — muted brand colour, white thumb. */
export const DisabledActive: Story = {
  render: (args) => (
    <Toggle
      {...args}
      isActive={true}
      state="disabled"
      aria-label="Disabled active toggle"
    />
  ),
};

/**
 * Dark theme — click to toggle.
 * CRITICAL CHECK: the thumb must remain WHITE in both inactive and active states.
 * If the thumb appears dark in the inactive state, the Surface/Static/Default
 * token is not resolving correctly.
 */
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <StoryTokenCanvas theme="Dark">
        <Story />
      </StoryTokenCanvas>
    ),
  ],
};

/** All six Figma variants (active × inactive × 3 states) — Light theme. */
const states: ToggleState[] = ['default', 'pressed', 'disabled'];

/** All six Figma variants (active × inactive × 3 states) — Light theme. */
export const AllFigmaVariants: Story = {
  render: () => (
    <StoryTokenCanvas>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, max-content)',
          gap: 'var(--Primitive-Scale-400)',
          alignItems: 'center',
        }}
      >
        {[false, true].flatMap((active) =>
          states.map((state) => (
            <Toggle
              key={`${String(active)}-${state}`}
              isActive={active}
              state={state}
              aria-label={`Toggle ${active ? 'active' : 'inactive'} – ${state}`}
            />
          )),
        )}
      </div>
    </StoryTokenCanvas>
  ),
};

/** Same grid in Dark theme — verify that the thumb is white in ALL cells. */
export const AllFigmaVariantsDark: Story = {
  render: () => (
    <StoryTokenCanvas theme="Dark">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, max-content)',
          gap: 'var(--Primitive-Scale-400)',
          alignItems: 'center',
        }}
      >
        {[false, true].flatMap((active) =>
          states.map((state) => (
            <Toggle
              key={`${String(active)}-${state}`}
              isActive={active}
              state={state}
              aria-label={`Toggle ${active ? 'active' : 'inactive'} – ${state} (dark)`}
            />
          )),
        )}
      </div>
    </StoryTokenCanvas>
  ),
};


