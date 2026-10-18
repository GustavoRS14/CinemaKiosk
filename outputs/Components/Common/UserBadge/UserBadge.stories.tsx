import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { UserBadge } from './UserBadge';
import { StoryTokenCanvas } from '../../../StoryTokenCanvas';

const meta: Meta<typeof UserBadge> = {
  title: 'Components/UserBadge',
  component: UserBadge,
  decorators: [(Story) => (<StoryTokenCanvas><Story /></StoryTokenCanvas>)],
  argTypes: {
    authState: {
      control: 'radio',
      options: ['Guest', 'Member', 'Unidentified'],
    },
    clubStatus: {
      control: 'radio',
      options: ['active', 'inactive'],
    },
    contextFlow: {
      control: 'radio',
      options: ['Browsing', 'Checkout'],
    },
    label: { control: 'text' },
    clubName: { control: 'text' },
    documentType: { control: 'radio', options: ['CPF', 'CNPJ'] },
    schoolProjectRegistered: { control: 'boolean' },
    organizationName: { control: 'text' },
    organizationNameParts: { control: 'object' },
    value: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof UserBadge>;

export const Playground: Story = {
  args: {
    authState: 'Guest',
    clubStatus: 'active',
    contextFlow: 'Browsing',
    clubName: 'Clube Sercla+',
    label: 'CPF',
    value: '123.XXX.XXX-99',
  },
};

export const DarkTheme: Story = {
  decorators: [(Story) => (<StoryTokenCanvas theme="Dark"><Story /></StoryTokenCanvas>)],
  args: {
    authState: 'Guest',
    clubStatus: 'active',
    contextFlow: 'Browsing',
    clubName: 'Clube Sercla+',
    label: 'CPF',
    value: '123.XXX.XXX-99',
  },
};

export const RegisteredSchoolProjectCnpj: Story = {
  args: {
    authState: 'Guest',
    clubStatus: 'inactive',
    contextFlow: 'Browsing',
    documentType: 'CNPJ',
    schoolProjectRegistered: true,
    organizationNameParts: ['Escola', 'BH do Sul'],
    value: '12345678000195',
  },
};

export const LoyaltyMemberWithFullName: Story = {
  args: {
    authState: 'Member',
    clubStatus: 'active',
    contextFlow: 'Browsing',
    documentType: 'CPF',
    clubName: 'Clube Sercla+',
    label: 'João da Silva',
    value: '12345678910',
  },
};

export const UnregisteredCnpj: Story = {
  args: {
    authState: 'Guest',
    clubStatus: 'inactive',
    contextFlow: 'Browsing',
    documentType: 'CNPJ',
    schoolProjectRegistered: false,
    value: '98765432000110',
  },
};
