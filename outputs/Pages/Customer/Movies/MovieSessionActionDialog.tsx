import Age18Illustration from '@illustrations/+18.svg';
import AutismShowtimeIllustration from '@illustrations/AutismShowtime.svg';
import ShowtimeUnavailableIllustration from '@illustrations/ShowtimeUnavailable.svg';
import { ActionDialog } from '@components/Overlays/Dialog/ActionDialog';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import type { PageOrientation } from '../../useOrientation';
import { useI18n } from '../../../i18n';

export type MovieSessionNotice = 'age-18' | 'blue' | 'unavailable' | null;

type MovieSessionActionDialogProps = {
  notice: MovieSessionNotice;
  orientation: PageOrientation;
  onClose: () => void;
  onContinue?: () => void;
};

export function MovieSessionActionDialog({
  notice,
  orientation,
  onClose,
  onContinue,
}: MovieSessionActionDialogProps) {
  const { t } = useI18n();
  const isAgeRestricted = notice === 'age-18';
  const isUnavailable = notice === 'unavailable';

  return (
    <OverlaySurface open={notice !== null} kind="modal" orientation={orientation} onClose={onClose}>
      <ActionDialog
        size="md"
        illustration={isUnavailable
          ? <ShowtimeUnavailableIllustration aria-hidden="true" />
          : isAgeRestricted
          ? <Age18Illustration aria-hidden="true" />
          : <AutismShowtimeIllustration aria-hidden="true" />}
        title={isUnavailable
          ? t('movieNotice.closedTitle')
          : isAgeRestricted
          ? t('movieNotice.ageTitle')
          : t('movieNotice.blueTitle')}
        description={isUnavailable
          ? t('movieNotice.closedDescription')
          : isAgeRestricted ? (
          <div className="movie-session-notice movie-session-notice--age">
            <p>{t('movieNotice.ageIntro')}</p>
            <ul>
              <li>{t('movieNotice.ageRule18')}</li>
              <li>{t('movieNotice.ageRule16')}</li>
              <li>{t('movieNotice.ageRuleUnder16')}</li>
            </ul>
            <strong>{t('movieNotice.ageDocument')}</strong>
          </div>
        ) : (
          t('movieNotice.blueDescription')
        )}
        secondaryActionLabel={isUnavailable ? t('purchase.nextShowtimes') : isAgeRestricted ? t('movieNotice.backMovies') : t('movieNotice.changeTime')}
        primaryActionLabel={t('movieNotice.continuePurchase')}
        showPrimaryButton={!isUnavailable}
        onSecondaryAction={onClose}
        onPrimaryAction={() => {
          onContinue?.();
          onClose();
        }}
      />
    </OverlaySurface>
  );
}
