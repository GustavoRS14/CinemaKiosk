import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MapOfSeats, SeatRowData } from './MapOfSeats';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof MapOfSeats> = {
  title: 'Components/MapOfSeats',
  component: MapOfSeats,
  decorators: [(Story) => (<StoryTokenCanvas><Story/></StoryTokenCanvas>)],
  argTypes: {
    className: { control: 'text' },
    onSeatClick: { action: 'seatClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof MapOfSeats>;

const createStandardMockRows = (): SeatRowData[] => {
  return [
    {
      rowLabel: 'G',
      seats: [
        { id: 'G1', seatNumber: 'G1', type: 'Standard', state: 'Occupied' },
        { id: 'G2', seatNumber: 'G2', type: 'Standard', state: 'Occupied' },
        { id: 'G3', seatNumber: 'G3', type: 'Standard', state: 'Occupied' },
        { id: 'G4', seatNumber: 'G4', type: 'Standard', state: 'Occupied' },
        { id: 'G5', seatNumber: 'G5', type: 'Standard', state: 'Available' },
        { id: 'G6', seatNumber: 'G6', type: 'Companion', state: 'Available' },
        { id: 'G7', seatNumber: 'G7', type: 'Wheelchair', state: 'Available' },
        null, // Center aisle gap
        { id: 'G8', seatNumber: 'G8', type: 'Wheelchair', state: 'Available' },
        { id: 'G9', seatNumber: 'G9', type: 'Companion', state: 'Available' },
        { id: 'G10', seatNumber: 'G10', type: 'Standard', state: 'Available' },
        { id: 'G11', seatNumber: 'G11', type: 'Standard', state: 'Available' },
        { id: 'G12', seatNumber: 'G12', type: 'Standard', state: 'Occupied' },
        { id: 'G13', seatNumber: 'G13', type: 'Standard', state: 'Occupied' },
        { id: 'G14', seatNumber: 'G14', type: 'Standard', state: 'Occupied' },
      ]
    },
    {
      rowLabel: 'F',
      seats: [
        { id: 'F1', seatNumber: 'F1', type: 'Standard', state: 'Available' },
        { id: 'F2', seatNumber: 'F2', type: 'Standard', state: 'Available' },
        { id: 'F3', seatNumber: 'F3', type: 'Standard', state: 'Available' },
        { id: 'F4', seatNumber: 'F4', type: 'Standard', state: 'Available' },
        { id: 'F5', seatNumber: 'F5', type: 'Standard', state: 'Occupied' },
        { id: 'F6', seatNumber: 'F6', type: 'Standard', state: 'Occupied' },
        { id: 'F7', seatNumber: 'F7', type: 'Standard', state: 'Occupied' },
        null,
        { id: 'F8', seatNumber: 'F8', type: 'Standard', state: 'Available' },
        { id: 'F9', seatNumber: 'F9', type: 'Standard', state: 'Available' },
        { id: 'F10', seatNumber: 'F10', type: 'Standard', state: 'Occupied' },
        { id: 'F11', seatNumber: 'F11', type: 'Standard', state: 'Occupied' },
        { id: 'F12', seatNumber: 'F12', type: 'Standard', state: 'Available' },
        { id: 'F13', seatNumber: 'F13', type: 'Standard', state: 'Available' },
        { id: 'F14', seatNumber: 'F14', type: 'Standard', state: 'Available' },
      ]
    },
    {
      rowLabel: 'E',
      seats: [
        { id: 'E1', seatNumber: 'E1', type: 'Standard', state: 'Available' },
        { id: 'E2', seatNumber: 'E2', type: 'Standard', state: 'Available' },
        { id: 'E3', seatNumber: 'E3', type: 'Standard', state: 'Occupied' },
        { id: 'E4', seatNumber: 'E4', type: 'Standard', state: 'Occupied' },
        { id: 'E5', seatNumber: 'E5', type: 'Standard', state: 'Available' },
        { id: 'E6', seatNumber: 'E6', type: 'Standard', state: 'Occupied' },
        { id: 'E7', seatNumber: 'E7', type: 'Standard', state: 'Occupied' },
        null,
        { id: 'E8', seatNumber: 'E8', type: 'Standard', state: 'Occupied' },
        { id: 'E9', seatNumber: 'E9', type: 'Standard', state: 'Occupied' },
        { id: 'E10', seatNumber: 'E10', type: 'Standard', state: 'Available' },
        { id: 'E11', seatNumber: 'E11', type: 'Standard', state: 'Available' },
        { id: 'E12', seatNumber: 'E12', type: 'Standard', state: 'Occupied' },
        { id: 'E13', seatNumber: 'E13', type: 'Standard', state: 'Occupied' },
        { id: 'E14', seatNumber: 'E14', type: 'Standard', state: 'Available' },
      ]
    },
    {
      rowLabel: 'D',
      seats: [
        { id: 'D1', seatNumber: 'D1', type: 'Standard', state: 'Available' },
        { id: 'D2', seatNumber: 'D2', type: 'Standard', state: 'Available' },
        { id: 'D3', seatNumber: 'D3', type: 'Standard', state: 'Available' },
        { id: 'D4', seatNumber: 'D4', type: 'Standard', state: 'Occupied' },
        { id: 'D5', seatNumber: 'D5', type: 'Standard', state: 'Occupied' },
        { id: 'D6', seatNumber: 'D6', type: 'Standard', state: 'Occupied' },
        { id: 'D7', seatNumber: 'D7', type: 'Standard', state: 'Occupied' },
        null,
        { id: 'D8', seatNumber: 'D8', type: 'Standard', state: 'Available' },
        { id: 'D9', seatNumber: 'D9', type: 'Standard', state: 'Available' },
        { id: 'D10', seatNumber: 'D10', type: 'Standard', state: 'Occupied' },
        { id: 'D11', seatNumber: 'D11', type: 'Standard', state: 'Occupied' },
        { id: 'D12', seatNumber: 'D12', type: 'Standard', state: 'Available' },
        { id: 'D13', seatNumber: 'D13', type: 'Standard', state: 'Available' },
        { id: 'D14', seatNumber: 'D14', type: 'Standard', state: 'Available' },
      ]
    },
    {
      rowLabel: 'C',
      seats: [
        { id: 'C1', seatNumber: 'C1', type: 'Standard', state: 'Available' },
        { id: 'C2', seatNumber: 'C2', type: 'Standard', state: 'Available' },
        { id: 'C3', seatNumber: 'C3', type: 'Standard', state: 'Available' },
        { id: 'C4', seatNumber: 'C4', type: 'Standard', state: 'Available' },
        { id: 'C5', seatNumber: 'C5', type: 'Standard', state: 'Available' },
        { id: 'C6', seatNumber: 'C6', type: 'Standard', state: 'Available' },
        { id: 'C7', seatNumber: 'C7', type: 'Standard', state: 'Available' },
        null,
        { id: 'C8', seatNumber: 'C8', type: 'Standard', state: 'Occupied' },
        { id: 'C9', seatNumber: 'C9', type: 'Standard', state: 'Available' },
        { id: 'C10', seatNumber: 'C10', type: 'Standard', state: 'Available' },
        { id: 'C11', seatNumber: 'C11', type: 'Standard', state: 'Available' },
        { id: 'C12', seatNumber: 'C12', type: 'Standard', state: 'Available' },
        { id: 'C13', seatNumber: 'C13', type: 'Standard', state: 'Available' },
        { id: 'C14', seatNumber: 'C14', type: 'Standard', state: 'Available' },
      ]
    },
    {
      rowLabel: 'B',
      seats: [
        { id: 'B1', seatNumber: 'B1', type: 'Standard', state: 'Available' },
        { id: 'B2', seatNumber: 'B2', type: 'Standard', state: 'Available' },
        { id: 'B3', seatNumber: 'B3', type: 'Standard', state: 'Available' },
        { id: 'B4', seatNumber: 'B4', type: 'Standard', state: 'Available' },
        { id: 'B5', seatNumber: 'B5', type: 'Standard', state: 'Available' },
        { id: 'B6', seatNumber: 'B6', type: 'Standard', state: 'Available' },
        { id: 'B7', seatNumber: 'B7', type: 'Standard', state: 'Available' },
        null,
        { id: 'B8', seatNumber: 'B8', type: 'Standard', state: 'Available' },
        { id: 'B9', seatNumber: 'B9', type: 'Standard', state: 'Available' },
        { id: 'B10', seatNumber: 'B10', type: 'Standard', state: 'Available' },
        { id: 'B11', seatNumber: 'B11', type: 'Standard', state: 'Available' },
        { id: 'B12', seatNumber: 'B12', type: 'Standard', state: 'Available' },
        { id: 'B13', seatNumber: 'B13', type: 'Standard', state: 'Available' },
        { id: 'B14', seatNumber: 'B14', type: 'Standard', state: 'Available' },
      ]
    },
    {
      rowLabel: 'A',
      seats: [
        { id: 'A1', seatNumber: 'A1', type: 'Obese', state: 'Available' },
        { id: 'A2', seatNumber: 'A2', type: 'Standard', state: 'Available' },
        { id: 'A3', seatNumber: 'A3', type: 'Standard', state: 'Available' },
        { id: 'A4', seatNumber: 'A4', type: 'Standard', state: 'Available' },
        { id: 'A5', seatNumber: 'A5', type: 'Standard', state: 'Available' },
        { id: 'A6', seatNumber: 'A6', type: 'Companion', state: 'Occupied' },
        { id: 'A7', seatNumber: 'A7', type: 'Wheelchair', state: 'Occupied' },
        null,
        { id: 'A8', seatNumber: 'A8', type: 'Wheelchair', state: 'Available' },
        { id: 'A9', seatNumber: 'A9', type: 'Companion', state: 'Occupied' },
        { id: 'A10', seatNumber: 'A10', type: 'Standard', state: 'Available' },
        { id: 'A11', seatNumber: 'A11', type: 'Standard', state: 'Available' },
        { id: 'A12', seatNumber: 'A12', type: 'Standard', state: 'Available' },
        { id: 'A13', seatNumber: 'A13', type: 'Standard', state: 'Available' },
        { id: 'A14', seatNumber: 'A14', type: 'Obese', state: 'Occupied' },
      ]
    }
  ];
};

const createVipOnlyRows = (): SeatRowData[] => {
  return [
    {
      rowLabel: 'A',
      seats: [
        { id: 'V1', seatNumber: 'V1', type: 'VIP', state: 'Available' },
        { id: 'V2', seatNumber: 'V2', type: 'VIP', state: 'Available' },
        null,
        { id: 'V3', seatNumber: 'V3', type: 'Wheelchair', state: 'Available' },
        { id: 'V4', seatNumber: 'V4', type: 'Companion', state: 'Available' },
      ]
    }
  ];
};

export const Playground: Story = {
  args: {
    rows: createStandardMockRows(),
  },
};

export const VIPOnlyMap: Story = {
  args: {
    rows: createVipOnlyRows(),
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story/></StoryTokenCanvas>)],
  args: {
    ...Playground.args,
  },
};
