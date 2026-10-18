import React from 'react';
import './UserBadge.css';
import UserIcon from '@icons/user.svg';
import ChevronDownIcon from '@icons/chevron-down.svg';
import { useI18n } from '../../../i18n';

export type UserBadgeClubStatus = 'active' | 'inactive';
type UserBadgeAuthState = 'Guest' | 'Member' | 'Unidentified';

type UserBadgeBaseProps = {
  /**
   * Additional class names
   */
  className?: string;
  /**
   * The authentication state of the user.
   * @default 'Guest'
   */
  /**
   * The context flow of the user.
   * @default 'Browsing'
   */
  contextFlow?: 'Browsing' | string;
  /**
   * The label text (e.g. CPF).
   */
  label?: string;
  /** Loyalty-program name supplied by the tenant API. */
  clubName?: string;
  documentType?: 'CPF' | 'CNPJ';
  schoolProjectRegistered?: boolean;
  organizationName?: string;
  organizationNameParts?: string[];
  /** Optional split member-name fields returned by the loyalty API. */
  memberFirstName?: string;
  memberLastName?: string;
  /**
   * The value text (e.g. the formatted CPF).
   */
  value?: string;
  /** Opens the customer identification flow. */
  onClick?: () => void;
};

export type UserBadgeProps = UserBadgeBaseProps & (
  | { clubStatus?: 'active'; authState?: UserBadgeAuthState }
  | { clubStatus: 'inactive'; authState?: Exclude<UserBadgeAuthState, 'Member'> }
);

export const UserBadge: React.FC<UserBadgeProps> = ({
  className = '',
  authState = 'Guest',
  clubStatus = 'active',
  contextFlow = 'Browsing',
  label = 'CPF',
  clubName = 'Clube',
  documentType,
  schoolProjectRegistered = false,
  organizationName,
  organizationNameParts,
  memberFirstName,
  memberLastName: _memberLastName,
  value = '123.XXX.XXX-99',
  onClick,
}) => {
  const { t } = useI18n();
  const formatMaskedDocument = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 14);

    if (digits.length === 14) {
      return `${digits.slice(0, 2)}.XXX.XXX/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
    }
    
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}.XXX.XXX-${digits.slice(9, 11)}`;
    }
    
    return rawValue; 
  };

  const effectiveAuthState = clubStatus === 'inactive' && authState === 'Member'
    ? 'Unidentified'
    : authState;
  let displayLabel = label;
  let displayValue = formatMaskedDocument(value);
  const firstWord = (text: string) => text.trim().split(/\s+/)[0] ?? '';
  const truncateOrganizationName = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length > 3 ? `${words.slice(0, 3).join(' ')}...` : words.join(' ');
  };
  const resolvedOrganizationName = (organizationNameParts?.filter((part) => part.trim()).join(' ')
    || organizationName
    || '').trim();

  if (documentType === 'CNPJ' || value.replace(/\D/g, '').length === 14) {
    displayLabel = schoolProjectRegistered && resolvedOrganizationName
      ? truncateOrganizationName(resolvedOrganizationName)
      : t('user.identification');
  } else if (effectiveAuthState === 'Guest') {
    displayLabel = 'CPF';
  } else if (effectiveAuthState === 'Member') {
    const memberName = memberFirstName?.trim()
      || (label !== 'CPF' && label !== clubName ? label : '');
    displayLabel = memberName
      ? firstWord(memberName)
      : label !== 'CPF'
        ? label
        : '[ClientName]';
  } else if (effectiveAuthState === 'Unidentified') {
    const resolvedClubName = clubName.trim() || 'Clube';
    displayLabel = clubStatus === 'inactive'
      ? t('user.identifyPurchase')
      : t('user.earnClubPoints', { clubName: resolvedClubName });
    displayValue = t('user.enterCpf');
  }

  return (
    <button
      type="button"
      className={`user-badge ${className}`.trim()}
      data-context={contextFlow}
      data-club-status={clubStatus}
      onClick={onClick}
    >
      <div className="user-badge-master">
        <div className="user-badge-icon">
          <UserIcon aria-hidden="true" />
        </div>
        
        <div className="user-badge-text-container">
          <p className="user-badge-label">{displayLabel}</p>
          <p className="user-badge-value">{displayValue}</p>
        </div>
        
        <div className="user-badge-icon">
          <ChevronDownIcon aria-hidden="true" />
        </div>
      </div>
    </button>
  );
};
