import AccessibilityIcon from '@icons/accessibility.svg';
import { useI18n } from '../../../i18n';
import type { PageOrientation } from '../../../Pages/useOrientation';
import { NavbarButton } from './NavbarButton';
import './ModalAccessibilityTrigger.css';

export type ModalAccessibilityTriggerProps = {
  visible: boolean;
  orientation: PageOrientation;
  onClick: () => void;
};

export function ModalAccessibilityTrigger({
  visible,
  orientation,
  onClick,
}: ModalAccessibilityTriggerProps) {
  const { t } = useI18n();
  if (!visible) return null;

  return (
    <div
      className="modal-accessibility-trigger"
      data-orientation={orientation}
    >
      <NavbarButton
        label={t('navigation.accessibility')}
        icon={<AccessibilityIcon />}
        orientation={orientation}
        variant="Accessibility"
        onClick={onClick}
      />
    </div>
  );
}
