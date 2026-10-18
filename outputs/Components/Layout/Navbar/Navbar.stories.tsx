import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from './Navbar';
import { NavbarButton } from './NavbarButton/NavbarButton'; // Fixed path to subfolder
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

// Fixed paths: Stepping out from Layout/Navbar -> Layout -> Components -> Root -> Assets
import homeRaw from '../../../../Assets/Icons/home.svg?raw';
import videoRaw from '../../../../Assets/Icons/video.svg?raw';
import popcornRaw from '../../../../Assets/Icons/popcorn.svg?raw';
import accessibilityRaw from '../../../../Assets/Icons/accessibility.svg?raw';

const InlineSvg = ({ svgString }: { svgString: string }) => (
  <span dangerouslySetInnerHTML={{ __html: svgString }} style={{ display: 'contents' }} />
);

const NavbarStoryWrapper = ({ orientation }: { orientation: 'horizontal' | 'vertical' }) => {
  const [activeTab, setActiveTab] = useState('inicio');

  return (
    <Navbar orientation={orientation}>
      <NavbarButton 
        label="Início" 
        icon={<InlineSvg svgString={homeRaw} />} 
        variant="Default" 
        selected={activeTab === 'inicio'}
        onClick={() => setActiveTab('inicio')}
      />
      <NavbarButton 
        label="Filmes" 
        icon={<InlineSvg svgString={videoRaw} />} 
        variant="Default" 
        selected={activeTab === 'filmes'}
        onClick={() => setActiveTab('filmes')}
      />
      <NavbarButton 
        label="Bomboniere" 
        icon={<InlineSvg svgString={popcornRaw} />} 
        variant="Default" 
        selected={activeTab === 'bomboniere'}
        onClick={() => setActiveTab('bomboniere')}
      />
      <NavbarButton 
        label="Acessibilidade" 
        icon={<InlineSvg svgString={accessibilityRaw} />} 
        variant="Accessibility" 
      />
    </Navbar>
  );
};

const meta = {
  title: 'Layout/Navbar/Navbar', // Organizes visually into Layout > Navbar > Navbar
  component: Navbar,
  tags: ['autodocs'],
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => <NavbarStoryWrapper orientation={args.orientation as 'horizontal' | 'vertical'} />,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story, context) => (
      <div style={{ 
        width: context.args.orientation === 'vertical' ? '1080px' : '178px', 
        height: context.args.orientation === 'horizontal' ? '800px' : 'auto',
        maxWidth: '100%',
        backgroundColor: '#e0e0e0',
        padding: '2rem',
        display: 'flex'
      }}>
        <Story />
      </div>
    ),
  ],
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
  args: {
    ...Playground.args,
  },
  render: Playground.render,
};
