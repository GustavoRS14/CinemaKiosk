import { AccessibilityOverlay } from '@components/Overlays/Accessibility';
import type { PageOrientation } from '../useOrientation';

type CustomerAccessibilityOverlayProps = {
  open: boolean;
  orientation: PageOrientation;
  onClose: () => void;
};

export function CustomerAccessibilityOverlay({
  open,
  orientation,
  onClose,
}: CustomerAccessibilityOverlayProps) {
  return (
    <AccessibilityOverlay
      open={open}
      orientation={orientation}
      onClose={onClose}
    />
  );
}
