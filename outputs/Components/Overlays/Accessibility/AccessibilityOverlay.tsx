import type { PageOrientation } from '../../../Pages/useOrientation';
import { OverlaySurface } from '../OverlaySurface';
import { Accessibility } from './Accessibility';
import type { AccessibilityPreferenceValues } from './Accessibility';

export type AccessibilityOverlayProps = {
  open: boolean;
  orientation: PageOrientation;
  onClose: () => void;
  preferences?: AccessibilityPreferenceValues;
  onPreferencesChange?: (preferences: AccessibilityPreferenceValues) => void;
};

export function AccessibilityOverlay({
  open,
  orientation,
  onClose,
  preferences,
  onPreferencesChange,
}: AccessibilityOverlayProps) {
  return (
    <OverlaySurface open={open} kind="modal" orientation={orientation} modalPlacement="above-navigation" onClose={onClose}>
      <Accessibility
        orientation={orientation}
        onComplete={onClose}
        preferences={preferences}
        onPreferencesChange={onPreferencesChange}
      />
    </OverlaySurface>
  );
}
