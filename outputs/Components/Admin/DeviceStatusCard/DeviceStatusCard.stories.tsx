import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DeviceStatusCard } from './DeviceStatusCard';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

import ServerIcon from '@icons/server.svg';
import KeyboardIcon from '@icons/keyboard.svg';

const meta = {
  title: 'Admin/DeviceStatusCard',
  component: DeviceStatusCard,
  decorators: [(Story) => <StoryTokenCanvas><Story /></StoryTokenCanvas>],
  args: {
    deviceName: 'Impressora Fiscal',
    deviceMetadata: 'A1B2-C3D4-E5F6',
    statusText: 'Online',
    actionLabel: 'Imprimir Teste',
  },
  argTypes: {
    deviceName: { control: 'text' },
    deviceMetadata: { control: 'text' },
    statusText: { control: 'text' },
    actionLabel: { control: 'text' },
    onAction: { action: 'onAction' },
  },
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Dc6wSUldS37E5mvi3MaJMa/Totem-ATM--Autoatendimento-?node-id=6373-45342',
    },
  },
} satisfies Meta<typeof DeviceStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const DisconnectedPrinter: Story = {
  args: {
    deviceType: 'printer',
    detectedDevices: [],
    actionLabel: 'Imprimir Teste',
    deviceName: undefined,
    deviceMetadata: undefined,
    statusText: undefined,
  },
};

export const ConnectedPrinter: Story = {
  args: {
    deviceType: 'printer',
    detectedDevices: [{
      id: 'epson-tm-t88vi',
      type: 'printer',
      connected: true,
      model: 'Epson TM-T88VI',
      connection: 'COM3',
      paperStatus: 'ok',
    }],
    actionLabel: 'Imprimir Teste',
    deviceName: undefined,
    deviceMetadata: undefined,
    statusText: undefined,
  },
};

export const LowPaperPrinter: Story = {
  args: {
    ...ConnectedPrinter.args,
    detectedDevices: [{
      id: 'epson-tm-t88vi',
      type: 'printer',
      connected: true,
      model: 'Epson TM-T88VI',
      connection: 'COM3',
      paperStatus: 'low',
    }],
  },
};

export const EmptyPaperPrinter: Story = {
  args: {
    ...ConnectedPrinter.args,
    detectedDevices: [{
      id: 'epson-tm-t88vi',
      type: 'printer',
      connected: true,
      model: 'Epson TM-T88VI',
      connection: 'COM3',
      paperStatus: 'empty',
    }],
  },
};

export const ConnectedPaymentTerminal: Story = {
  args: {
    deviceType: 'payment-terminal',
    detectedDevices: [{
      id: 'verifone-p400',
      type: 'payment-terminal',
      connected: true,
      model: 'Verifone P400',
      connection: 'USB',
    }],
    actionLabel: 'Testar Comunicação',
    deviceName: undefined,
    deviceMetadata: undefined,
    statusText: undefined,
  },
};

export const CustomIcon: Story = {
  args: {
    deviceName: 'Servidor Local',
    deviceMetadata: 'IP: 192.168.0.100',
    deviceIcon: <ServerIcon aria-hidden="true" />,
  },
};

export const KeyboardDevice: Story = {
  args: {
    deviceName: 'Teclado Pinpad',
    deviceMetadata: 'USB-C Conectado',
    deviceIcon: <KeyboardIcon aria-hidden="true" />,
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => <StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>],
};
