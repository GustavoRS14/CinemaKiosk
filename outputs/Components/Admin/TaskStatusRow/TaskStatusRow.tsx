import React from 'react';
import './TaskStatusRow.css';
import { ProgressBar } from '../../Common/ProgressBar';
import { TextButton } from '../../Common/TextButton';
import CloseIcon from '@icons/close.svg';
import { useI18n } from '../../../i18n';

export interface TaskStatusRowProps {
  /** Optional class name */
  className?: string;
  /** Current step number */
  currentStep?: string;
  /** Description text */
  description?: string;
  /** Percentage value, e.g. "50" or "[x]" */
  percentage?: string;
  /** Whether to show the cancel button */
  showCancelButton?: boolean;
  /** Whether to show the step indicator */
  showStepIndicator?: boolean;
  /** Whether to show the title suffix */
  showTitleSuffix?: boolean;
  /** Title text */
  title?: string;
  /** Title suffix text */
  titleSuffix?: string;
  /** Total number of steps */
  totalSteps?: string;
  /** Callback fired when the cancel action is pressed. */
  onCancel?: () => void;
}

export const TaskStatusRow: React.FC<TaskStatusRowProps> = ({
  className = '',
  currentStep = '1',
  description = 'Descrição',
  percentage = '[x]',
  showCancelButton = true,
  showStepIndicator = true,
  showTitleSuffix = false,
  title = 'Título',
  titleSuffix = 'Sufixo',
  totalSteps = '2',
  onCancel,
}) => {
  const { t } = useI18n();
  // Try to parse the percentage string to a number for the progress bar
  const parsedProgress = parseInt(percentage, 10);
  const safeProgress = isNaN(parsedProgress) ? 0 : parsedProgress;

  return (
    <div className={`task-status-row ${className}`.trim()}>
      <div className="task-status-row-header">
        <div className="task-status-row-text">
          <div className="task-status-row-title-container">
            <h6 className="task-status-row-title">{title}</h6>
            {showTitleSuffix && (
              <>
                <span className="task-status-row-title-suffix">|</span>
                <span className="task-status-row-title-suffix">{titleSuffix}</span>
              </>
            )}
          </div>
          <p className="task-status-row-description">{description}</p>
        </div>
        
        <div className="task-status-row-percentage">
          <span>{percentage}</span>
          <span>%</span>
        </div>
      </div>

      <div className="task-status-row-progress-action">
        <ProgressBar intent="Information" progress={safeProgress} />
        {showCancelButton && (
          <TextButton 
            intent="Danger" 
            label={t('checkout.cancel')} 
            hasRightIcon 
            rightIcon={<CloseIcon />}
            onClick={onCancel}
          />
        )}
      </div>

      {showStepIndicator && (
        <div className="task-status-row-step-indicator">
          <p>{t('admin.task.step')}</p>
          <p>{currentStep}</p>
          <p>{t('admin.task.of')}</p>
          <p>{totalSteps}</p>
        </div>
      )}
    </div>
  );
};
