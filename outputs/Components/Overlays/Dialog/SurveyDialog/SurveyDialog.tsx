import { useState } from 'react';

import { Button } from '../../../Common/Button';
import { SelectionCard } from '../../../Common/SelectionCard';
import { useI18n } from '../../../../i18n';
import '../../overlayDialog.css';
import './SurveyDialog.css';

export type SurveyRating = 'negative' | 'neutral' | 'positive';
export type SurveyOrientationPreference = 'vertical' | 'horizontal' | 'indifferent';

export type SurveyAnswers = {
  findingProducts?: SurveyRating;
  checkoutSpeed?: SurveyRating;
  orientation?: SurveyOrientationPreference;
};

export type SurveyDialogProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  defaultAnswers?: SurveyAnswers;
  onSkip?: () => void;
  onSubmit?: (answers: SurveyAnswers) => void;
};

const ratingValues: SurveyRating[] = ['negative', 'neutral', 'positive'];
const ratingEmoji: Record<SurveyRating, string> = {
  negative: '🙁',
  neutral: '🙂',
  positive: '🤩',
};

export function SurveyDialog({
  size = 'lg',
  className = '',
  defaultAnswers = {},
  onSkip,
  onSubmit,
}: SurveyDialogProps) {
  const { t } = useI18n();
  const [answers, setAnswers] = useState<SurveyAnswers>(defaultAnswers);
  const questionsAnswered = Boolean(
    answers.findingProducts
    && answers.checkoutSpeed
    && answers.orientation,
  );
  const orientationOptions: Array<{ value: SurveyOrientationPreference; label: string }> = [
    { value: 'vertical', label: t('survey.orientationVertical') },
    { value: 'horizontal', label: t('survey.orientationHorizontal') },
    { value: 'indifferent', label: t('survey.orientationIndifferent') },
  ];

  const selectAnswer = <Key extends keyof SurveyAnswers>(
    key: Key,
    value: NonNullable<SurveyAnswers[Key]>,
  ) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  return (
    <section
      className={`overlay-dialog overlay-dialog--size-${size} survey-dialog ${className}`.trim()}
      aria-labelledby="survey-dialog-title"
    >
      <div className="survey-dialog__content">
        <header className="survey-dialog__intro">
          <h2 id="survey-dialog-title">{t('survey.title')}</h2>
          <p>{t('survey.description')}</p>
        </header>

        <RatingQuestion
          id="survey-finding-products-question"
          legend={t('survey.findingProducts')}
          selected={answers.findingProducts}
          labels={{ negative: t('survey.difficult'), neutral: t('survey.easy'), positive: t('survey.veryEasy') }}
          onSelect={(value) => selectAnswer('findingProducts', value)}
        />

        <RatingQuestion
          id="survey-checkout-speed-question"
          legend={t('survey.checkoutSpeed')}
          selected={answers.checkoutSpeed}
          labels={{ negative: t('survey.slow'), neutral: t('survey.fast'), positive: t('survey.veryFast') }}
          onSelect={(value) => selectAnswer('checkoutSpeed', value)}
        />

        <div
          className="survey-dialog__question survey-dialog__orientation-question"
          role="group"
          aria-labelledby="survey-orientation-question"
        >
          <p id="survey-orientation-question" className="survey-dialog__question-title">
            {t('survey.orientationQuestion')}
          </p>
          <div className="survey-dialog__orientation-options">
            {orientationOptions.map((option) => (
              <SelectionCard
                key={option.value}
                className="survey-dialog__orientation-card"
                selected={answers.orientation === option.value}
                title={option.label}
                supportingText=""
                textSize="sm"
                textWeight="Medium"
                onClick={() => selectAnswer('orientation', option.value)}
              />
            ))}
          </div>
        </div>

        <div className="survey-dialog__actions">
          <Button
            label={t('survey.skip')}
            intent="primary"
            variant="outlined"
            radius="md"
            showLeftIcon={false}
            showRightIcon={false}
            showSecondaryLabel={false}
            onClick={onSkip}
          />
          <Button
            label={t('survey.submit')}
            intent="primary"
            variant="solid"
            radius="md"
            showLeftIcon={false}
            showRightIcon={false}
            showSecondaryLabel={false}
            disabled={!questionsAnswered}
            onClick={() => {
              if (questionsAnswered) onSubmit?.(answers);
            }}
          />
        </div>
      </div>
    </section>
  );
}

function RatingQuestion({
  id,
  legend,
  selected,
  labels,
  onSelect,
}: {
  id: string;
  legend: string;
  selected?: SurveyRating;
  labels: Record<SurveyRating, string>;
  onSelect: (value: SurveyRating) => void;
}) {
  return (
    <div
      className="survey-dialog__question survey-dialog__rating-question"
      role="group"
      aria-labelledby={id}
    >
      <p id={id} className="survey-dialog__question-title">{legend}</p>
      <div className="survey-dialog__emoji-options">
        {ratingValues.map((value) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              type="button"
              className="survey-dialog__emoji-option"
              data-selected={isSelected}
              aria-label={labels[value]}
              aria-pressed={isSelected}
              onClick={() => onSelect(value)}
            >
              <span aria-hidden="true">{ratingEmoji[value]}</span>
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="survey-dialog__selected-label" aria-live="polite">
          {labels[selected]}
        </p>
      )}
    </div>
  );
}
