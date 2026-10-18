import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { StoryTokenCanvas } from '../../../../StoryTokenCanvas';
import { useOrientation } from '../../useOrientation';
import { OfflinePage } from './OfflinePage';

function ResponsiveStoryCanvas({ children }: { children: ReactNode }) {
const orientation = useOrientation();
const canvasOrientation = orientation === 'horizontal' ? 'Horizontal' : 'Vertical';

return (
  <StoryTokenCanvas orientation={canvasOrientation} theme="Light">
    {children}
  </StoryTokenCanvas>
);
}

const meta = {
title: 'Pages/OnBoarding/OfflinePage',
component: OfflinePage,
decorators: [
(Story) => (
  <ResponsiveStoryCanvas>
    <Story />
  </ResponsiveStoryCanvas>
),
],
parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof OfflinePage>;

export default meta;
type Story = StoryObj<typeof OfflinePage>;

export const Default: Story = {};
