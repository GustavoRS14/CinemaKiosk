import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AOdisseiaPoster from '@images/a-odisseia-2.png';
import ComboDoubleImage from '@images/Concessions/combo-duplo-700ml.png';
import MinionsBucketImage from '@images/Concessions/balde-minions-1.png';
import Soda1000Image from '@images/Checkout/refrigerante-1000ml.png';
import Soda500Image from '@images/Checkout/refrigerante-500ml.png';
import PixIcon from '@icons/pix.svg';
import CreditCardIcon from '@icons/credit-card.svg';
import DebitCardIcon from '@icons/debit-card.svg';
import ExpiredQrIllustration from '@illustrations/ExpiredQR.svg';
import PaymentFailedIllustration from '@illustrations/PaymentFailed.svg';
import TimeOutIllustration from '@illustrations/TimeOut.svg';
import AlertIllustration from '@illustrations/Alert.svg';
import { CheckoutSummary } from '@components/Common/CheckoutSummary';
import { DisclosureButton } from '@components/Common/DisclosureButton';
import { Divider } from '@components/Common/Divider';
import { Input } from '@components/Common/Input';
import { PaymentOption } from '@components/Common/PaymentOption';
import { ActionDialog } from '@components/Overlays/Dialog/ActionDialog';
import { PaymentDialog, type PaymentDialogMethod } from '@components/Overlays/Dialog/PaymentDialog';
import { KeyboardDialog } from '@components/Overlays/KeyboardDialog/KeyboardDialog';
import { SuccessDialog } from '@components/Overlays/Dialog/SuccessDialog';
import { SurveyDialog, type SurveyAnswers } from '@components/Overlays/Dialog/SurveyDialog';
import { PrintingFailureDialog } from '@components/Overlays/Dialog/PrintingFailureDialog';
import { InputDialog } from '@components/Overlays/InputDialog';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import { setInactivityMonitoringEnabled } from '@components/Overlays/SystemSessionOverlays';
import { resetCustomerIdentitySession } from '../../../customerIdentitySession';
import { resetConcessionsCartSession, useConcessionsCart } from '../../../Concessions/useConcessionsCart';
import { ALL_CONCESSION_PRODUCTS, formatConcessionPrice } from '../../../Concessions/concessionsCatalog';
import { resetConcessionOfferSession } from '../../../Concessions/useConcessionOfferFlow';
import { Tag } from '@components/Common/Tag';
import { TextButton } from '@components/Common/TextButton';
import { Footer } from '@components/Layout/Footer/Footer';
import { PurchaseHeader, requestPurchaseCancellation } from '../../PurchaseHeader';
import { useI18n } from '../../../../../i18n';
import { useOrientation } from '../../../../useOrientation';
import { useFeaturePreferences } from '../../../../featurePreferences';
import { registerCompletedPurchaseForSurvey } from '../../../surveyPurchaseCounter';
import { CUSTOMER_FLOW_RESET_EVENT } from '../../../customerFlowReset';
import { formatPhoneNumber } from '../../../../../Utilities/inputFormatters';
import { isSeatDeliveryConfigured } from '../../../../deliveryPreferences';
import {
  PurchaseSessionClosingAlert,
  useSalesClosingCountdown,
} from '../../PurchaseSessionClosingAlert';
import './MovieOrderCheckoutPage.css';
import { getMovieTicketTotal } from '../moviePurchaseTotal';

export const useCheckoutOrientation = useOrientation;

const ticketsProps = {
  movieTitle: 'A Odisséia',
  ratingValue: '18' as const,
  movieTags: ['Aventura'],
  duration: '180',
  movieImageUrl: AOdisseiaPoster,
  dateStr: 'Hoje, 20 Jul',
  startTime: '10:00',
  auditorium: '5',
  language: 'Dub',
  experienceTags: ['2D', 'VIP', 'Laser'],
  seatTags: ['B4', 'B5', 'B6'],
  selectedTickets: [
    { label: '1x Combo 2 Ingressos', price: '30,00' },
    { label: '1x Inteira', price: '40,00' },
  ],
  totalTicketsCount: 3,
  totalPrice: '70,00',
};

const toCheckoutDateValue = (value?: Date | string) => {
  if (!value) return ticketsProps.dateStr;
  if (typeof value === 'string') return value;
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
};

const concessionsProps = {
  items: [
    { productName: 'Balde 1 Minions + Pipoca', price: '160,00', quantity: 1, imageUrl: MinionsBucketImage },
    { productName: '2 Pipocas Médias + 2 Refrigerantes 700ml', price: '160,00', quantity: 1, imageUrl: ComboDoubleImage, imagePosition: 'left' as const },
    { productName: 'Copo de Refrigerante 1000ml', price: '160,00', quantity: 2, imageUrl: Soda1000Image },
    { productName: 'Copo de Refrigerante 500ml', price: '160,00', quantity: 1, imageUrl: Soda500Image },
  ],
  totalPrice: '800,00',
};

type CouponState = 'closed' | 'editing' | 'applied-expanded' | 'applied-collapsed';

export type MovieOrderCheckoutPageProps = {
  sessionStartTime?: string;
  showtimeDate?: Date | string;
  salesCutoffMinutes?: number;
  availableSeats?: number;
  movieDetailsPath?: string;
  onViewNextShowtimes?: () => void;
  orderContents?: 'TicketsAndConcessions' | 'TicketsOnly' | 'ConcessionsOnly';
  fulfillmentMethod?: 'pickup' | 'seat-delivery';
  deliveryEstimate?: string;
  /** Status reported by the PIX provider or the connected pinpad/TEF. */
  paymentStatus?: 'processing' | 'approved' | 'failed' | 'cancelled' | 'timed-out';
  /** Card-terminal timeout used when the integration does not report one. */
  cardPaymentTimeoutSeconds?: number;
  onPaymentAttempt?: (method: PaymentDialogMethod) => void;
  validateCoupon?: (code: string) => boolean | Promise<boolean>;
  /** Live status reported by the order-printer integration after payment approval. */
  orderPrintStatus?: 'idle' | 'printing' | 'completed' | 'failed';
  /** Starts printing the paid order. Resolve on completion and reject on failure. */
  onPrintOrder?: () => void | Promise<void>;
  /** Sends the digital order to the confirmed phone number. */
  onSendOrder?: (method: 'SMS' | 'WhatsApp', phoneNumber: string) => void | Promise<void>;
  /** Persists the optional satisfaction survey shown after every fifteenth completed purchase. */
  onSubmitSurvey?: (answers: SurveyAnswers) => void | Promise<void>;
};

type PaymentFlowState =
  | 'waiting'
  | 'confirmed'
  | 'survey'
  | 'printing-failed'
  | 'qr-ready'
  | 'finish-confirmation'
  | 'phone-entry'
  | 'phone-confirmation'
  | 'order-sent'
  | 'order-sent-retry'
  | 'pix-expired'
  | 'timed-out'
  | 'failed'
  | 'cancelled';

export function MovieOrderCheckoutPage({
  sessionStartTime,
  showtimeDate,
  salesCutoffMinutes,
  availableSeats,
  movieDetailsPath,
  onViewNextShowtimes,
  orderContents = 'TicketsAndConcessions',
  fulfillmentMethod,
  deliveryEstimate,
  paymentStatus = 'processing',
  cardPaymentTimeoutSeconds = 120,
  onPaymentAttempt,
  validateCoupon,
  orderPrintStatus,
  onPrintOrder,
  onSendOrder,
  onSubmitSurvey,
}: MovieOrderCheckoutPageProps) {
  const orientation = useCheckoutOrientation();
  const location = useLocation();
  const navigate = useNavigate();
  const { finishCustomerSession, t } = useI18n();
  const { acceptCouponsAndVouchers, showEstimatedEndTime, formatDurationToMinutes } = useFeaturePreferences();
  const concessionsCart = useConcessionsCart();
  const [detailsVisible, setDetailsVisible] = useState(true);
  const [couponState, setCouponState] = useState<CouponState>('closed');
  const [couponCode, setCouponCode] = useState('');
  const [couponInvalid, setCouponInvalid] = useState(false);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [couponDraft, setCouponDraft] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentDialogMethod | null>(null);
  const [paymentFlowState, setPaymentFlowState] = useState<PaymentFlowState>('waiting');
  const [paymentAttempt, setPaymentAttempt] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState<'SMS' | 'WhatsApp'>('SMS');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sendingOrder, setSendingOrder] = useState(false);
  const [finishConfirmationReturn, setFinishConfirmationReturn] = useState<'qr-ready' | 'order-sent' | 'order-sent-retry'>('qr-ready');
  const printStartedRef = useRef(false);
  const completedPurchaseRegisteredRef = useRef(false);
  const couponApplied = couponState === 'applied-expanded' || couponState === 'applied-collapsed';
  const couponDiscountApplied = acceptCouponsAndVouchers && couponApplied;
  const couponContentVisible = couponState === 'editing' || couponState === 'applied-expanded';
  const navigationState = location.state as Partial<{
    orderContents: MovieOrderCheckoutPageProps['orderContents'];
    fulfillmentMethod: MovieOrderCheckoutPageProps['fulfillmentMethod'];
    deliveryEstimate: string;
    returnPath: string;
  }> | null;
  const resolvedOrderContents = navigationState?.orderContents ?? orderContents;
  const resolvedFulfillmentMethod = navigationState?.fulfillmentMethod ?? fulfillmentMethod;
  const resolvedDeliveryEstimate = navigationState?.deliveryEstimate ?? deliveryEstimate;
  const showTickets = resolvedOrderContents !== 'ConcessionsOnly';
  const showConcessions = resolvedOrderContents !== 'TicketsOnly';
  const ticketTotal = showTickets ? getMovieTicketTotal(70) : 0;
  const concessionsBaseTotal = ALL_CONCESSION_PRODUCTS.reduce(
    (total, product) => total + (concessionsCart.quantities[product.id] ?? 0) * product.price,
    0,
  );
  const comboOfferDiscount = ALL_CONCESSION_PRODUCTS.reduce((total, product) => {
    const offeredPrice = concessionsCart.discountedPrices[product.id];
    const quantity = concessionsCart.quantities[product.id] ?? 0;
    return offeredPrice === undefined
      ? total
      : total + Math.max(0, product.price - offeredPrice) * quantity;
  }, 0);
  const showComboOfferDiscount = showConcessions && comboOfferDiscount > 0;
  const showSeatDeliveryOption = showConcessions
    && resolvedFulfillmentMethod === 'seat-delivery'
    && isSeatDeliveryConfigured(resolvedOrderContents === 'ConcessionsOnly' ? 'standalone' : 'combined');
  const orderDescription = resolvedOrderContents === 'TicketsOnly'
    ? t('checkout.tickets')
    : resolvedOrderContents === 'ConcessionsOnly'
      ? t('checkout.concessions')
      : `${t('checkout.tickets')} + ${t('checkout.concessions')}`;
  const baseOrderTotal = resolvedOrderContents === 'TicketsOnly'
    ? ticketTotal
    : resolvedOrderContents === 'ConcessionsOnly'
      ? (concessionsBaseTotal || 800)
      : ticketTotal + concessionsBaseTotal;
  const orderTotal = (baseOrderTotal - (couponDiscountApplied ? 20 : 0) - comboOfferDiscount)
    .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const remainingSalesMinutes = useSalesClosingCountdown(sessionStartTime ? {
    time: sessionStartTime,
    showtimeDate,
    salesCutoffMinutes,
  } : undefined);
  const returnToConcessionsOrigin = () => {
    if (navigationState?.returnPath) {
      navigate(navigationState.returnPath);
      return;
    }
    navigate(-1);
  };

  useEffect(() => {
    const resetPageState = () => {
      setDetailsVisible(true);
      setCouponState('closed');
      setCouponCode('');
      setCouponInvalid(false);
      setCouponDialogOpen(false);
      setCouponDraft('');
      setCouponValidating(false);
      setPaymentMethod(null);
      setPaymentFlowState('waiting');
      setPaymentAttempt(0);
      setDeliveryMethod('SMS');
      setPhoneNumber('');
      setSendingOrder(false);
      setFinishConfirmationReturn('qr-ready');
      printStartedRef.current = false;
      completedPurchaseRegisteredRef.current = false;
    };
    window.addEventListener(CUSTOMER_FLOW_RESET_EVENT, resetPageState);
    return () => window.removeEventListener(CUSTOMER_FLOW_RESET_EVENT, resetPageState);
  }, []);

  useEffect(() => {
    if (!paymentMethod || paymentStatus === 'processing') return;
    if (paymentStatus === 'approved') setPaymentFlowState('confirmed');
    if (paymentStatus === 'failed') setPaymentFlowState('failed');
    if (paymentStatus === 'cancelled') setPaymentFlowState('cancelled');
    if (paymentStatus === 'timed-out') setPaymentFlowState('timed-out');
  }, [paymentMethod, paymentStatus]);

  useEffect(() => {
    setInactivityMonitoringEnabled(paymentMethod === null);
    return () => setInactivityMonitoringEnabled(true);
  }, [paymentMethod]);

  const navigateHome = () => {
    setPaymentMethod(null);
    finishCustomerSession();
    resetCustomerIdentitySession();
    resetConcessionsCartSession();
    resetConcessionOfferSession();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const completePrintedPurchase = () => {
    if (completedPurchaseRegisteredRef.current) return;
    completedPurchaseRegisteredRef.current = true;
    if (registerCompletedPurchaseForSurvey()) {
      setPaymentFlowState('survey');
      return;
    }
    navigateHome();
  };

  const submitSurvey = async (answers: SurveyAnswers) => {
    try {
      await onSubmitSurvey?.(answers);
    } finally {
      navigateHome();
    }
  };

  useEffect(() => {
    if (paymentFlowState !== 'confirmed' || printStartedRef.current) return undefined;
    printStartedRef.current = true;

    if (onPrintOrder) {
      const printRequest = Promise.resolve().then(() => onPrintOrder());
      if (orderPrintStatus === undefined) {
        void printRequest
          .then(completePrintedPurchase)
          .catch(() => setPaymentFlowState('printing-failed'));
      } else {
        void printRequest.catch(() => setPaymentFlowState('printing-failed'));
      }
      return undefined;
    }

    if (orderPrintStatus !== undefined) return undefined;
    const fallback = window.setTimeout(completePrintedPurchase, 2_000);
    return () => window.clearTimeout(fallback);
  }, [onPrintOrder, orderPrintStatus, paymentFlowState]);

  useEffect(() => {
    if (paymentFlowState !== 'confirmed') return;
    if (orderPrintStatus === 'completed') completePrintedPurchase();
    if (orderPrintStatus === 'failed') setPaymentFlowState('printing-failed');
  }, [orderPrintStatus, paymentFlowState]);

  useEffect(() => {
    if (!paymentMethod || paymentMethod === 'pix' || paymentFlowState !== 'waiting') return undefined;
    const timeoutSeconds = Math.max(0, Math.floor(cardPaymentTimeoutSeconds));
    if (timeoutSeconds === 0) return undefined;
    const timeout = window.setTimeout(() => setPaymentFlowState('timed-out'), timeoutSeconds * 1000);
    return () => window.clearTimeout(timeout);
  }, [cardPaymentTimeoutSeconds, paymentAttempt, paymentFlowState, paymentMethod]);

  const beginPayment = (method: PaymentDialogMethod) => {
    printStartedRef.current = false;
    completedPurchaseRegisteredRef.current = false;
    setPaymentMethod(method);
    setPaymentFlowState('waiting');
    setPaymentAttempt((current) => current + 1);
    onPaymentAttempt?.(method);
  };

  const changePaymentMethod = () => {
    printStartedRef.current = false;
    setPaymentMethod(null);
    setPaymentFlowState('waiting');
  };

  const openPhoneEntry = (method: 'SMS' | 'WhatsApp') => {
    setDeliveryMethod(method);
    setPhoneNumber('');
    setPaymentFlowState('phone-entry');
  };

  const openFinishConfirmation = (
    returnTo: 'qr-ready' | 'order-sent' | 'order-sent-retry',
  ) => {
    setFinishConfirmationReturn(returnTo);
    setPaymentFlowState('finish-confirmation');
  };

  const sendOrder = async (keepRetryState = false) => {
    if (phoneNumber.length !== 11 || sendingOrder) return;
    setSendingOrder(true);
    try {
      await onSendOrder?.(deliveryMethod, phoneNumber);
      setPaymentFlowState(keepRetryState ? 'order-sent-retry' : 'order-sent');
    } finally {
      setSendingOrder(false);
    }
  };

  const retryPayment = () => {
    if (!paymentMethod) return;
    setPaymentFlowState('waiting');
    setPaymentAttempt((current) => current + 1);
    onPaymentAttempt?.(paymentMethod);
  };

  const cancelOrderAfterPinpadAbort = () => {
    changePaymentMethod();
    requestPurchaseCancellation();
  };

  const openCouponDialog = () => {
    setCouponDraft(couponApplied ? couponCode : '');
    setCouponInvalid(false);
    setCouponDialogOpen(true);
  };

  const applyCoupon = async () => {
    const normalizedCode = couponDraft.trim().toUpperCase();
    if (!normalizedCode || couponValidating) return;
    setCouponValidating(true);
    setCouponInvalid(false);
    const [isValid] = await Promise.all([
      validateCoupon ? validateCoupon(normalizedCode) : normalizedCode === 'CODIGOSERCLA123',
      new Promise((resolve) => window.setTimeout(resolve, 500)),
    ]);
    setCouponValidating(false);
    if (!isValid) {
      setCouponInvalid(true);
      return;
    }
    setCouponCode(normalizedCode);
    setCouponState('applied-collapsed');
    setCouponDialogOpen(false);
  };

  return (
    <div data-purchase-page data-orientation={orientation} className={`movie-order-checkout-page movie-order-checkout-page--${orientation}${remainingSalesMinutes !== null ? ' movie-order-checkout-page--sales-closing' : ''}`}>
      <PurchaseHeader
        orientation={orientation}
        sessionStartTime={sessionStartTime}
        showtimeDate={showtimeDate}
        salesCutoffMinutes={salesCutoffMinutes}
        availableSeats={availableSeats}
        movieDetailsPath={movieDetailsPath}
        onViewNextShowtimes={onViewNextShowtimes}
      />

      <main className="movie-order-checkout-page__main">
        <div className="movie-order-checkout-page__layout">
          <section className="movie-order-checkout-page__summary-column" aria-label={t('checkout.orderSummaryAria')}>
            <div className="movie-order-checkout-page__summary-card">
              <div className="movie-order-checkout-page__summary-heading">
                <h1>{t('checkout.orderSummary')}</h1>
                <TextButton
                  intent="Information"
                  size="sm"
                  weight="SemiBold"
                  label={detailsVisible ? t('checkout.hideDetails') : t('checkout.showDetails')}
                  onClick={() => setDetailsVisible((visible) => !visible)}
                />
              </div>

              {detailsVisible && (
                <>
                  <div className={`movie-order-checkout-page__summaries${showTickets && showConcessions ? '' : ' movie-order-checkout-page__summaries--single'}`}>
                    {showTickets && (
                      <CheckoutSummary
                        variant="Tickets"
                        ticketsProps={{
                          ...ticketsProps,
                          totalPrice: formatConcessionPrice(ticketTotal),
                          showEndTime: showEstimatedEndTime,
                          formatDurationToMinutes,
                          dateStr: toCheckoutDateValue(showtimeDate),
                          startTime: sessionStartTime ?? ticketsProps.startTime,
                        }}
                      />
                    )}
                    {showConcessions && (
                      <CheckoutSummary
                        variant="Concessions"
                        concessionsProps={{
                          ...concessionsProps,
                          totalPrice: formatConcessionPrice(Math.max(0, concessionsBaseTotal - comboOfferDiscount)),
                          showDeliveryOption: showSeatDeliveryOption,
                          deliveryEstimate: resolvedDeliveryEstimate,
                        }}
                      />
                    )}
                  </div>

                  <div className="movie-order-checkout-page__summary-divider">
                    <Divider />
                  </div>

                  {(couponDiscountApplied || showComboOfferDiscount) && (
                    <>
                      <div className="movie-order-checkout-page__discount-summary">
                        <div>
                          <strong>{t('checkout.couponsDiscounts')}</strong>
                          {showComboOfferDiscount && <span>{t('cart.comboOffer')}</span>}
                          {couponDiscountApplied && <span>{couponCode.trim().toUpperCase()}</span>}
                        </div>
                        <div className="movie-order-checkout-page__discount-values">
                          {showComboOfferDiscount && <strong>− R$ {formatConcessionPrice(comboOfferDiscount)}</strong>}
                          {couponDiscountApplied && <strong>− R$ 20,00</strong>}
                        </div>
                      </div>

                      <div className="movie-order-checkout-page__summary-divider">
                        <Divider />
                      </div>
                    </>
                  )}

                  <div className="movie-order-checkout-page__order-total">
                    <div>
                      <strong>{t('checkout.orderTotal')}</strong>
                      <span>{orderDescription}</span>
                    </div>
                    <strong>R$ {orderTotal}</strong>
                  </div>
                </>
              )}
            </div>

            {acceptCouponsAndVouchers && couponState === 'closed' && (
              <DisclosureButton
                border="md"
                label={t('checkout.couponVoucher')}
                hasRightIcon
                aria-expanded={false}
                onClick={() => setCouponState('editing')}
              />
            )}

            {acceptCouponsAndVouchers && couponState !== 'closed' && (
              <section
                className={`movie-order-checkout-page__coupon${couponContentVisible ? '' : ' movie-order-checkout-page__coupon--collapsed'}`}
                aria-label={t('checkout.couponVoucherAria')}
              >
                <div className="movie-order-checkout-page__coupon-heading">
                  <h2>{t('checkout.couponVoucherTitle')}</h2>
                  <TextButton
                    intent="Information"
                    size="sm"
                    weight="SemiBold"
                    label={
                      couponState === 'editing'
                        ? t('checkout.cancel')
                        : couponState === 'applied-expanded'
                          ? t('checkout.hideField')
                          : t('checkout.showField')
                    }
                    onClick={() => {
                      if (couponState === 'editing') {
                        setCouponCode('');
                        setCouponInvalid(false);
                        setCouponState('closed');
                        return;
                      }

                      setCouponState((current) => (
                        current === 'applied-expanded' ? 'applied-collapsed' : 'applied-expanded'
                      ));
                    }}
                  />
                </div>

                {couponContentVisible && (
                  <div className="movie-order-checkout-page__coupon-content">
                    <Input
                      id="checkout-coupon"
                      value={couponCode}
                      onClick={openCouponDialog}
                      onChange={() => undefined}
                      placeholder={t('checkout.codePlaceholder')}
                      aria-label={t('checkout.codeAria')}
                      state={couponInvalid ? 'Invalid' : 'Default'}
                      actionRight
                      ctaLabel={couponApplied ? t('checkout.remove') : t('checkout.apply')}
                      ctaDisabled={!couponApplied && !couponCode.trim()}
                      onCtaClick={() => {
                        if (couponApplied) {
                          setCouponInvalid(false);
                          setCouponState('editing');
                          return;
                        }

                        openCouponDialog();
                      }}
                      showSupportingText={couponInvalid}
                      supportingText={t('checkout.invalidCode')}
                    />

                    {couponApplied && (
                      <Tag status="Success" text="R$ 20,00 OFF" />
                    )}

                    {!couponInvalid && (
                      <p className="movie-order-checkout-page__coupon-supporting-text">
                        {t('checkout.codeHelp')}
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}
          </section>

          <section className="movie-order-checkout-page__payment" aria-labelledby="payment-title">
            <h2 id="payment-title">{t('checkout.paymentTitle')}</h2>
            <div className="movie-order-checkout-page__payment-options">
              <PaymentOption
                title="PIX"
                description={t('checkout.pixDescription')}
                icon={<PixIcon />}
                onClick={() => beginPayment('pix')}
              />
              <PaymentOption
                title={t('checkout.credit')}
                description={t('checkout.cardDescription')}
                icon={<CreditCardIcon />}
                onClick={() => beginPayment('credit')}
              />
              <PaymentOption
                title={t('checkout.debit')}
                description={t('checkout.cardDescription')}
                icon={<DebitCardIcon />}
                onClick={() => beginPayment('debit')}
              />
            </div>
          </section>
        </div>

        {remainingSalesMinutes !== null && (
          <PurchaseSessionClosingAlert remainingMinutes={remainingSalesMinutes} />
        )}
      </main>

      <Footer
        showCenterAction={false}
        showMainCta={false}
        price={orderTotal}
        onBack={resolvedOrderContents === 'ConcessionsOnly' ? returnToConcessionsOrigin : undefined}
      />

      <OverlaySurface
        open={paymentMethod !== null}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={changePaymentMethod}
      >
        {paymentMethod && paymentFlowState === 'waiting' && (
          <PaymentDialog
            key={`${paymentMethod}-${paymentAttempt}`}
            method={paymentMethod}
            size="md"
            pixExpirationSeconds={5 * 60}
            qrValue={`totem-pix-payment-${paymentAttempt}`}
            onChangeMethod={changePaymentMethod}
            onPixExpired={() => setPaymentFlowState('pix-expired')}
          />
        )}

        {paymentFlowState === 'confirmed' && (
          <SuccessDialog variant="payment-confirmed" size="md" />
        )}

        {paymentFlowState === 'survey' && (
          <SurveyDialog
            size="lg"
            onSkip={navigateHome}
            onSubmit={(answers) => void submitSurvey(answers)}
          />
        )}

        {(paymentFlowState === 'printing-failed' || paymentFlowState === 'qr-ready') && (
          <PrintingFailureDialog
            scenario="totem"
            initialStage={paymentFlowState === 'qr-ready' ? 'qr-ready' : 'generating'}
            autoAdvance
            size="md"
            qrValue={`paid-order-${paymentAttempt}`}
            onSms={() => openPhoneEntry('SMS')}
            onWhatsApp={() => openPhoneEntry('WhatsApp')}
            onFinish={() => openFinishConfirmation('qr-ready')}
          />
        )}

        {paymentFlowState === 'finish-confirmation' && (
          <ActionDialog
            size="md"
            illustration={<AlertIllustration aria-hidden="true" />}
            title={t('checkout.savedTicketsTitle')}
            description={t('checkout.savedTicketsDescription')}
            secondaryActionLabel={t('checkout.finishExit')}
            primaryActionLabel={t('action.back')}
            onSecondaryAction={navigateHome}
            onPrimaryAction={() => setPaymentFlowState(finishConfirmationReturn)}
          />
        )}

        {paymentFlowState === 'phone-entry' && (
          <InputDialog
            size="lg"
            value={phoneNumber}
            onChange={setPhoneNumber}
            inputFormat="phone"
            methodText={<>{t('checkout.digitalOrderVia')} <strong>{deliveryMethod}</strong></>}
            primaryDisabled={phoneNumber.length !== 11}
            onPrimaryAction={() => setPaymentFlowState('phone-confirmation')}
            onSecondaryAction={() => setPaymentFlowState('qr-ready')}
          />
        )}

        {paymentFlowState === 'phone-confirmation' && (
          <ActionDialog
            size="md"
            illustration={<AlertIllustration aria-hidden="true" />}
            title={t('checkout.confirmPhoneTitle')}
            description={(
              <>
                <p>{t('checkout.confirmPhoneDescription')}</p>
                <p className="movie-order-checkout-page__confirmed-phone">{formatPhoneNumber(phoneNumber)}</p>
              </>
            )}
            secondaryActionLabel={t('checkout.correctPhone')}
            primaryActionLabel={sendingOrder ? t('checkout.sending') : t('checkout.sendOrder')}
            onSecondaryAction={() => setPaymentFlowState('phone-entry')}
            onPrimaryAction={() => void sendOrder()}
          />
        )}

        {(paymentFlowState === 'order-sent' || paymentFlowState === 'order-sent-retry') && (
          <SuccessDialog
            variant={paymentFlowState}
            size="md"
            deliveryMethod={deliveryMethod}
            phoneNumber={phoneNumber}
            onExit={() => openFinishConfirmation(paymentFlowState)}
            onNotReceived={() => setPaymentFlowState('order-sent-retry')}
            onChangeMethod={() => setPaymentFlowState('qr-ready')}
            onResend={() => void sendOrder(true)}
          />
        )}

        {paymentFlowState === 'pix-expired' && (
          <ActionDialog
            size="md"
            illustration={<ExpiredQrIllustration aria-hidden="true" />}
            title={t('checkout.pixExpiredTitle')}
            description={t('checkout.pixExpiredDescription')}
            secondaryActionLabel={t('success.changeMethod')}
            primaryActionLabel={t('checkout.newCode')}
            onSecondaryAction={changePaymentMethod}
            onPrimaryAction={retryPayment}
          />
        )}

        {paymentFlowState === 'timed-out' && (
          <ActionDialog
            size="md"
            illustration={<TimeOutIllustration aria-hidden="true" />}
            title={t('checkout.timeoutTitle')}
            description={t('checkout.timeoutDescription')}
            secondaryActionLabel={t('success.changeMethod')}
            primaryActionLabel={t('checkout.tryAgain')}
            onSecondaryAction={changePaymentMethod}
            onPrimaryAction={retryPayment}
          />
        )}

        {paymentFlowState === 'failed' && (
          <ActionDialog
            size="md"
            illustration={<PaymentFailedIllustration aria-hidden="true" />}
            title={t('checkout.paymentFailedTitle')}
            description={t('checkout.paymentFailedDescription')}
            secondaryActionLabel={t('success.changeMethod')}
            primaryActionLabel={t('checkout.tryAgain')}
            onSecondaryAction={changePaymentMethod}
            onPrimaryAction={retryPayment}
          />
        )}

        {paymentFlowState === 'cancelled' && (
          <ActionDialog
            size="md"
            illustration={<PaymentFailedIllustration aria-hidden="true" />}
            title={t('checkout.operationCancelledTitle')}
            description={t('checkout.operationCancelledDescription')}
            secondaryActionLabel={t('checkout.cancelOrder')}
            primaryActionLabel={t('success.changeMethod')}
            onSecondaryAction={cancelOrderAfterPinpadAbort}
            onPrimaryAction={changePaymentMethod}
          />
        )}
      </OverlaySurface>

      <OverlaySurface
        open={couponDialogOpen}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => setCouponDialogOpen(false)}
      >
        <KeyboardDialog
          variant="alphanumeric"
          size="lg"
          title={t('checkout.insertCouponVoucher')}
          description={t('checkout.couponDescription')}
          inputPlaceholder={t('checkout.codePlaceholder')}
          value={couponDraft}
          onChange={(value) => {
            setCouponDraft(value);
            setCouponInvalid(false);
          }}
          inputState={couponInvalid ? 'Invalid' : couponDraft ? 'Filled' : 'Default'}
          supportingText={couponInvalid ? t('checkout.invalidCode') : undefined}
          secondaryActionLabel={t('checkout.cancel')}
          primaryActionLabel={t('checkout.applyCode')}
          primaryDisabled={!couponDraft.trim()}
          busy={couponValidating}
          busyPrimaryActionLabel={t('checkout.validating')}
          onSecondaryAction={() => setCouponDialogOpen(false)}
          onPrimaryAction={applyCoupon}
        />
      </OverlaySurface>
    </div>
  );
}

