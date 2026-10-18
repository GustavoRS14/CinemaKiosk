import { useState, type ChangeEvent } from 'react';
import ChevronDownIcon from '../../../../../Assets/Icons/chevron-down.svg';
import PopcornIcon from '../../../../../Assets/Icons/popcorn.svg';

import { Button } from '../../../Common/Button';
import { Input } from '../../../Common/Input';
import { SelectionCard } from '../../../Common/SelectionCard';
import { useI18n } from '../../../../i18n';
import '../../overlayDialog.css';
import './OrderFulfillmentDialog.css';

export type OrderFulfillmentMethod = 'pickup' | 'seat-delivery';
export type OrderFulfillmentStep = 'method' | 'delivery-details';
export type OrderFulfillmentOption = { value: string; label: string };

export type OrderFulfillmentDetails = {
  movie: string;
  session: string;
  recipientName: string;
  seat: string;
};

export type OrderFulfillmentDialogProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  step?: OrderFulfillmentStep;
  defaultStep?: OrderFulfillmentStep;
  selectedMethod?: OrderFulfillmentMethod;
  defaultSelectedMethod?: OrderFulfillmentMethod;
  movies?: OrderFulfillmentOption[];
  sessions?: OrderFulfillmentOption[];
  details?: OrderFulfillmentDetails;
  onDetailsChange?: (details: OrderFulfillmentDetails) => void;
  onMovieFieldClick?: () => void;
  onSessionFieldClick?: () => void;
  onRecipientFieldClick?: () => void;
  onSeatFieldClick?: () => void;
  onStepChange?: (step: OrderFulfillmentStep) => void;
  onMethodChange?: (method: OrderFulfillmentMethod) => void;
  onBack?: () => void;
  onSubmit?: (method: OrderFulfillmentMethod, details?: OrderFulfillmentDetails) => void;
  deliveryEstimate?: string;
  seatDeliveryRequiresDetails?: boolean;
  seatDeliveryEnabled?: boolean;
  className?: string;
};

const EMPTY_DETAILS: OrderFulfillmentDetails = {
  movie: '',
  session: '',
  recipientName: '',
  seat: '',
};

export function OrderFulfillmentDialog({
  size = 'lg',
  step,
  defaultStep = 'method',
  selectedMethod,
  defaultSelectedMethod,
  movies = [],
  sessions = [],
  details: controlledDetails,
  onDetailsChange,
  onMovieFieldClick,
  onSessionFieldClick,
  onRecipientFieldClick,
  onSeatFieldClick,
  onStepChange,
  onMethodChange,
  onBack,
  onSubmit,
  deliveryEstimate,
  seatDeliveryRequiresDetails = true,
  seatDeliveryEnabled = true,
  className = '',
}: OrderFulfillmentDialogProps) {
  const { t } = useI18n();
  const [internalStep, setInternalStep] = useState(defaultStep);
  const [internalMethod, setInternalMethod] = useState<OrderFulfillmentMethod | undefined>(defaultSelectedMethod);
  const [internalDetails, setInternalDetails] = useState(EMPTY_DETAILS);
  const details = controlledDetails ?? internalDetails;
  const currentStep = step ?? internalStep;
  const currentMethod = selectedMethod ?? internalMethod;
  const isDeliveryStep = currentStep === 'delivery-details';
  const availableSessions = details.movie ? sessions : [];
  const detailsComplete = Boolean(details.movie && details.session && details.recipientName.trim() && details.seat.trim());

  const updateDetails = (nextDetails: OrderFulfillmentDetails) => {
    if (controlledDetails === undefined) setInternalDetails(nextDetails);
    onDetailsChange?.(nextDetails);
  };

  const setCurrentStep = (nextStep: OrderFulfillmentStep) => {
    if (step === undefined) setInternalStep(nextStep);
    onStepChange?.(nextStep);
  };

  const chooseMethod = (method: OrderFulfillmentMethod) => {
    if (selectedMethod === undefined) setInternalMethod(method);
    onMethodChange?.(method);
  };

  const continueToPayment = () => {
    if (!currentMethod) return;
    if (currentMethod === 'seat-delivery' && !isDeliveryStep && seatDeliveryRequiresDetails) {
      setCurrentStep('delivery-details');
      return;
    }
    onSubmit?.(currentMethod, currentMethod === 'seat-delivery' ? details : undefined);
  };

  const goBack = () => {
    if (isDeliveryStep) setCurrentStep('method');
    onBack?.();
  };

  return (
    <section
      className={`overlay-dialog overlay-dialog--size-${size} order-fulfillment-dialog ${className}`.trim()}
      aria-labelledby="order-fulfillment-dialog-title"
    >
      <div className="order-fulfillment-dialog__content">
        <header className="order-fulfillment-dialog__header">
          {!isDeliveryStep && <PopcornIcon className="order-fulfillment-dialog__icon" aria-hidden="true" />}
          <div>
            <h2 id="order-fulfillment-dialog-title">
              {isDeliveryStep ? t('fulfillment.seatDelivery') : t('fulfillment.title')}
            </h2>
            <p>
              {isDeliveryStep
                ? t('fulfillment.deliveryDescription')
                : t('fulfillment.description')}
            </p>
          </div>
        </header>

        {isDeliveryStep ? (
          <div className="order-fulfillment-dialog__form">
            <SelectField
              label={t('fulfillment.movie')}
              value={details.movie}
              options={movies}
              onClick={onMovieFieldClick}
              onChange={(movie) => updateDetails({ ...details, movie, session: '' })}
            />
            <div className="order-fulfillment-dialog__session-fields">
              <SelectField
                label={t('fulfillment.showtime')}
                value={details.session}
                options={availableSessions}
                disabled={!details.movie}
                onClick={onSessionFieldClick}
                onChange={(session) => updateDetails({ ...details, session })}
              />
              <Input
                showTitle
                title={t('fulfillment.estimate')}
                value={deliveryEstimate || '--'}
                state={details.session ? 'Read Only' : 'Disabled'}
                readOnly={Boolean(details.session)}
                disabled={!details.session}
              />
            </div>
            <div className="order-fulfillment-dialog__client-fields">
              <Input
                showTitle
                title={t('fulfillment.deliverTo')}
                placeholder={t('fulfillment.name')}
                value={details.recipientName}
                disabled={!details.session}
                state={!details.session ? 'Disabled' : details.recipientName ? 'Filled' : 'Default'}
                controlRole={details.session && onRecipientFieldClick ? 'button' : undefined}
                controlTabIndex={details.session && onRecipientFieldClick ? 0 : undefined}
                onControlClick={details.session ? onRecipientFieldClick : undefined}
                onControlKeyDown={details.session && onRecipientFieldClick ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') onRecipientFieldClick();
                } : undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateDetails({ ...details, recipientName: event.target.value })
                }
              />
              <Input
                showTitle
                title={t('fulfillment.seat')}
                placeholder="Ex: A10"
                value={details.seat}
                disabled={!details.session}
                state={!details.session ? 'Disabled' : details.seat ? 'Filled' : 'Default'}
                controlRole={details.session && onSeatFieldClick ? 'button' : undefined}
                controlTabIndex={details.session && onSeatFieldClick ? 0 : undefined}
                onControlClick={details.session ? onSeatFieldClick : undefined}
                onControlKeyDown={details.session && onSeatFieldClick ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') onSeatFieldClick();
                } : undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateDetails({ ...details, seat: event.target.value.toUpperCase() })
                }
              />
            </div>
          </div>
        ) : (
          <div className="order-fulfillment-dialog__options" role="radiogroup" aria-label={t('fulfillment.method')}>
            <SelectionCard
              selected={currentMethod === 'pickup'}
              title={t('fulfillment.pickup')}
              supportingText={t('fulfillment.pickupDescription')}
              textSize="lg"
              textWeight="Semibold"
              onClick={() => chooseMethod('pickup')}
            />
            <SelectionCard
              selected={currentMethod === 'seat-delivery'}
              state={seatDeliveryEnabled ? 'Default' : 'Disabled'}
              title={t('fulfillment.seatDelivery')}
              supportingText={t('fulfillment.seatDeliveryDescription')}
              textSize="lg"
              textWeight="Semibold"
              showTag={Boolean(deliveryEstimate)}
              tagText={deliveryEstimate ? t('checkout.estimate', { value: deliveryEstimate }) : undefined}
              tagStatus="Information"
              onClick={() => chooseMethod('seat-delivery')}
            />
          </div>
        )}
      </div>

      <footer className="order-fulfillment-dialog__footer">
        <div>
          <Button
            label={t('action.back')}
            variant="ghost"
            radius="md"
            showLeftIcon={false}
            showRightIcon={false}
            showSecondaryLabel={false}
            onClick={goBack}
          />
        </div>
        <Button
          label={currentMethod === 'seat-delivery' && !isDeliveryStep && seatDeliveryRequiresDetails
            ? t('action.next')
            : t('fulfillment.goToPayment')}
          variant="solid"
          radius="md"
          disabled={isDeliveryStep ? !detailsComplete : !currentMethod}
          showLeftIcon={false}
          showRightIcon={false}
          showSecondaryLabel={false}
          onClick={continueToPayment}
        />
      </footer>
    </section>
  );
}

function SelectField({
  label,
  value,
  options,
  disabled = false,
  onClick,
  onChange,
}: {
  label: string;
  value: string;
  options: OrderFulfillmentOption[];
  disabled?: boolean;
  onClick?: () => void;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <label className="order-fulfillment-dialog__select-field">
      <span>{label}</span>
      <span className="order-fulfillment-dialog__select-control" data-disabled={disabled}>
        <select
          value={value}
          disabled={disabled}
          onPointerDown={onClick ? (event) => { event.preventDefault(); onClick(); } : undefined}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{t('onboarding.location.select')}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <ChevronDownIcon aria-hidden="true" />
      </span>
    </label>
  );
}
