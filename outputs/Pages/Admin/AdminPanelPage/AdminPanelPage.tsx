import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import IdIcon from '@icons/ID.svg';
import ChipIcon from '@icons/chip.svg';
import ColorPaletteIcon from '@icons/color-palette.svg';
import EditIcon from '@icons/edit.svg';
import KeyIcon from '@icons/key.svg';
import LocationIcon from '@icons/location.svg';
import OrientationIcon from '@icons/orientation.svg';
import PuzzleIcon from '@icons/puzzle.svg';
import SaveIcon from '@icons/save.svg';
import ServerIcon from '@icons/server.svg';
import TrashIcon from '@icons/trash.svg';
import TranslationIcon from '@icons/translation.svg';
import UpdateIcon from '@icons/update.svg';
import ChevronDownIcon from '@icons/chevron-down.svg';
import SunIcon from '@icons/Sun.svg';
import MoonIcon from '@icons/Moon.svg';
import AlertIllustration from '@illustrations/Alert.svg';
import ServerErrorIllustration from '@illustrations/ServerError.svg';
import PreviousStepNeededIllustration from '@illustrations/PreviousStepNeeded.svg';

import { ColorSample } from '@components/Admin/ColorSample';
import { DangerZoneFooter } from '@components/Admin/DangerZoneFooter/DangerZoneFooter';
import { CheckableCard } from '@components/Admin/CheckableCard';
import {
  DeviceStatusCard,
  type DetectedHardwareDevice,
} from '@components/Admin/DeviceStatusCard/DeviceStatusCard';
import { LocaleAvatar } from '@components/Admin/LocaleAvatar';
import { NestedSelectionGroup } from '@components/Admin/NestedSelectionGroup';
import { NestedWrapper } from '@components/Admin/NestedWrapper';
import { IndeterminateLinearProgress } from '@components/Admin/IndeterminateLinearProgress';
import { SectionHeader } from '@components/Admin/SectionHeader';
import { TaskStatusRow } from '@components/Admin/TaskStatusRow';
import { ThemePreviewCard } from '@components/Admin/ThemePreviewCard';
import { Button } from '@components/Common/Button';
import { Alert, type AlertIntent } from '@components/Common/Alert';
import { Choice_Chip } from '@components/Common/Choice_Chip';
import { Divider } from '@components/Common/Divider';
import { Input } from '@components/Common/Input';
import { ListItemGroup } from '@components/Common/ListItemGroup';
import { SelectionCard } from '@components/Common/SelectionCard';
import { SelectionTile } from '@components/Common/SelectionTile';
import { TextButton } from '@components/Common/TextButton';
import { Toggle } from '@components/Common/Toggle';
import { Footer } from '@components/Layout/Footer/Footer';
import { AccessibilityOverlay } from '@components/Overlays/Accessibility';
import { KeyboardDialog } from '@components/Overlays/KeyboardDialog';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import { ActionDialog } from '@components/Overlays/Dialog/ActionDialog';
import {
  OrganizationSelectionSlideOver,
  type OrganizationSelectionType,
} from '@components/Overlays/SlideOver/OrganizationSelectionSlideOver';
import { Header } from '@components/Layout/Header';
import { recommendThemeForTenant, tokenStyles } from '../../../StoryTokenCanvas';
import {
  ACCESSIBILITY_PREFERENCES_EVENT,
  getHighContrastPreference,
  getTextScalePreference,
} from '../../accessibilityPreferences';
import {
  EXPERIENCE_LOGO_OPTIONS,
  getFeaturePreferences,
  setFeaturePreferences,
  type TicketCategoryFilterPreference,
} from '../../featurePreferences';
import {
  DEFAULT_DELIVERY_SCHEDULE,
  getDeliveryPreferences,
  setDeliveryPreferences,
} from '../../deliveryPreferences';
import {
  getOrientationPreference,
  getThemePreference,
  hasManualThemePreference,
  setOrientationPreference,
  setThemePreference,
} from '../../displayPreferences';
import { useOrientation } from '../../useOrientation';
import { getAdminAccessLevel, setAdminPin, validateAdminAccessPin } from '../../adminPinPreferences';
import {
  validateLocationPinAccess,
  type LocationPinAccess,
} from '../../masterPinPreferences';
import { getTerminalId, setTerminalId as persistTerminalId } from '../../terminalPreferences';
import {
  getLastInstalledSystemUpdate,
  setLastInstalledSystemUpdate,
} from '../../systemUpdatePreferences';
import {
  getLocationPreferences,
  getTenantFromNetwork,
  setLocationPreferences,
} from '../../locationPreferences';
import { publishComplexTheme } from '../../complexThemePreferences';
import {
  getLanguagePreferences,
  setLanguagePreferences,
  translate,
  useI18n,
  type AppLocale,
  type TranslationKey,
  type TerminalLocale,
} from '../../../i18n';
import { OnboardingUpdatePage } from '../../OnBoarding/OnboardingUpdatePage';
import './AdminPanelPage.css';

type AdminSectionProps = {
  title: string;
  icon: ReactNode;
  editable?: boolean;
  isEditing?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  children: ReactNode;
  className?: string;
};

export type EditableSectionId =
  | 'terminal'
  | 'features'
  | 'language'
  | 'appearance'
  | 'orientation'
  | 'location'
  | 'updates';

export type AdminSettings = {
  terminalId: string;
  features: boolean[];
  deliveryModes: boolean[];
  deliverySchedule: boolean[][];
  experienceLogoMode: 'all' | 'custom';
  selectedExperienceLogos: string[];
  ticketCategoryFilterDefault: TicketCategoryFilterPreference;
  language: TerminalLocale;
  multilingual: boolean;
  appearance: 'light' | 'dark';
  orientation: 'automatic' | 'vertical' | 'horizontal';
  network: string;
  complex: string;
  automaticUpdates: boolean;
};

export type AdminSaveContext = {
  scope: 'device' | 'unit';
  location?: { network: string; complex: string };
  applyToOtherDevices?: 'when-home-or-session-ends';
};

const FEATURE_INDEX = {
  ageRatingNotice: 0,
  acceptCouponsAndVouchers: 1,
  productCustomization: 2,
  loyaltyProgram: 4,
  crossSellUpsell: 5,
  inclusiveSessionNotice: 6,
  seatDelivery: 7,
  showEstimatedEndTime: 8,
  showAuditorium: 9,
  showExperienceBadges: 10,
  showOccupancyLevel: 3,
  formatDurationToMinutes: 11,
  groupSalesSchoolProject: 12,
  ticketCategoryFilter: 13,
} as const;

const deliveryDayKeys: TranslationKey[] = ['admin.day.sunday', 'admin.day.monday', 'admin.day.tuesday', 'admin.day.wednesday', 'admin.day.thursday', 'admin.day.friday', 'admin.day.saturday', 'admin.day.holiday'];
const deliveryRoomGroups = ['2D', '3D', 'Laser', 'Azul', 'VIP'];

const defaultDetectedHardwareDevices: readonly DetectedHardwareDevice[] = [
  {
    id: 'epson-tm-t88vi',
    type: 'printer',
    connected: true,
    model: 'Epson TM-T88VI',
    connection: 'COM3',
    paperStatus: 'low',
  },
  {
    id: 'verifone-p400',
    type: 'payment-terminal',
    connected: true,
    model: 'Verifone P400',
    connection: 'USB',
  },
];

type RecommendedTheme = 'light' | 'dark';

type FeatureOption = {
  id: keyof typeof FEATURE_INDEX;
  index: (typeof FEATURE_INDEX)[keyof typeof FEATURE_INDEX];
  titleKey: TranslationKey;
  descriptionKey?: TranslationKey;
  selected: boolean;
};

const featureFlags: ReadonlyArray<FeatureOption> = [
  { id: 'ageRatingNotice', index: FEATURE_INDEX.ageRatingNotice, titleKey: 'admin.feature.ageRating', selected: false },
  { id: 'acceptCouponsAndVouchers', index: FEATURE_INDEX.acceptCouponsAndVouchers, titleKey: 'admin.feature.coupons', selected: true },
  { id: 'productCustomization', index: FEATURE_INDEX.productCustomization, titleKey: 'admin.feature.productCustomization', selected: false },
  { id: 'showOccupancyLevel', index: FEATURE_INDEX.showOccupancyLevel, titleKey: 'admin.feature.occupancy', selected: false },
  { id: 'loyaltyProgram', index: FEATURE_INDEX.loyaltyProgram, titleKey: 'admin.feature.loyalty', selected: true },
  {
    id: 'groupSalesSchoolProject',
    index: FEATURE_INDEX.groupSalesSchoolProject,
    titleKey: 'admin.feature.groupSalesSchoolProject',
    descriptionKey: 'admin.feature.groupSalesSchoolProjectDescription',
    selected: false,
  },
  {
    id: 'ticketCategoryFilter',
    index: FEATURE_INDEX.ticketCategoryFilter,
    titleKey: 'admin.feature.ticketCategoryFilter',
    descriptionKey: 'admin.feature.ticketCategoryFilterDescription',
    selected: false,
  },
  { id: 'crossSellUpsell', index: FEATURE_INDEX.crossSellUpsell, titleKey: 'admin.feature.upsell', selected: true },
  { id: 'inclusiveSessionNotice', index: FEATURE_INDEX.inclusiveSessionNotice, titleKey: 'admin.feature.inclusiveSession', selected: true },
  { id: 'seatDelivery', index: FEATURE_INDEX.seatDelivery, titleKey: 'admin.feature.seatDelivery', selected: false },
  { id: 'showEstimatedEndTime', index: FEATURE_INDEX.showEstimatedEndTime, titleKey: 'admin.feature.estimatedEnd', selected: false },
  {
    id: 'showAuditorium',
    index: FEATURE_INDEX.showAuditorium,
    titleKey: 'admin.feature.auditorium',
    descriptionKey: 'admin.feature.auditoriumDescription',
    selected: false,
  },
  {
    id: 'showExperienceBadges',
    index: FEATURE_INDEX.showExperienceBadges,
    titleKey: 'admin.feature.experienceLogos',
    descriptionKey: 'admin.feature.experienceLogosDescription',
    selected: false,
  },
  {
    id: 'formatDurationToMinutes',
    index: FEATURE_INDEX.formatDurationToMinutes,
    titleKey: 'admin.feature.durationFormat',
    descriptionKey: 'admin.feature.durationFormatDescription',
    selected: false,
  },
] as const;

function getInitialAdminSettings(): AdminSettings {
  const savedFeatures = getFeaturePreferences();
  const savedDelivery = getDeliveryPreferences();
  const savedLanguage = getLanguagePreferences();
  const savedLocation = getLocationPreferences();
  const features = Array.from({ length: Object.keys(FEATURE_INDEX).length }, () => false);
  featureFlags.forEach((feature) => {
    features[feature.index] = feature.selected;
  });
  features[FEATURE_INDEX.ageRatingNotice] = savedFeatures.ageRatingNotice;
  features[FEATURE_INDEX.acceptCouponsAndVouchers] = savedFeatures.acceptCouponsAndVouchers;
  features[FEATURE_INDEX.productCustomization] = savedFeatures.productCustomization;
  features[FEATURE_INDEX.loyaltyProgram] = savedFeatures.loyaltyProgram;
  features[FEATURE_INDEX.groupSalesSchoolProject] = savedFeatures.groupSalesSchoolProject;
  features[FEATURE_INDEX.crossSellUpsell] = savedFeatures.crossSellUpsell;
  features[FEATURE_INDEX.inclusiveSessionNotice] = savedFeatures.inclusiveSessionNotice;
  features[FEATURE_INDEX.seatDelivery] = savedFeatures.seatDelivery && savedDelivery.modes.some(Boolean);
  features[FEATURE_INDEX.showOccupancyLevel] = savedFeatures.showOccupancyLevel;
  features[FEATURE_INDEX.showEstimatedEndTime] = savedFeatures.showEstimatedEndTime;
  features[FEATURE_INDEX.showAuditorium] = savedFeatures.showAuditorium;
  features[FEATURE_INDEX.showExperienceBadges] = savedFeatures.showExperienceBadges;
  features[FEATURE_INDEX.formatDurationToMinutes] = savedFeatures.formatDurationToMinutes;
  features[FEATURE_INDEX.ticketCategoryFilter] = savedFeatures.ticketCategoryFilter;

  return {
    terminalId: getTerminalId(),
    features,
    deliveryModes: [...savedDelivery.modes],
    deliverySchedule: savedDelivery.schedule.length
      ? savedDelivery.schedule.map((days) => [...days])
      : DEFAULT_DELIVERY_SCHEDULE.map((days) => [...days]),
    experienceLogoMode: savedFeatures.experienceLogoMode,
    selectedExperienceLogos: [...savedFeatures.selectedExperienceLogos],
    ticketCategoryFilterDefault: savedFeatures.ticketCategoryFilterDefault,
    language: savedLanguage.defaultLocale,
    multilingual: savedLanguage.multilingual,
    appearance: getThemePreference(),
    orientation: getOrientationPreference(),
    network: savedLocation.network,
    complex: savedLocation.complex,
    automaticUpdates: true,
  };
}

function cloneSettings(settings: AdminSettings): AdminSettings {
  return {
    ...settings,
    features: [...settings.features],
    deliveryModes: [...settings.deliveryModes],
    deliverySchedule: settings.deliverySchedule.map((days) => [...days]),
    selectedExperienceLogos: [...settings.selectedExperienceLogos],
  };
}

function sectionValue(settings: AdminSettings, section: EditableSectionId) {
  switch (section) {
    case 'terminal':
      return settings.terminalId;
    case 'features':
      return [settings.features, settings.deliveryModes, settings.deliverySchedule, settings.experienceLogoMode, settings.selectedExperienceLogos, settings.ticketCategoryFilterDefault];
    case 'language':
      return [settings.language, settings.multilingual];
    case 'appearance':
      return settings.appearance;
    case 'orientation':
      return settings.orientation;
    case 'location':
      return [settings.network, settings.complex];
    case 'updates':
      return settings.automaticUpdates;
  }
}

function copySection(
  target: AdminSettings,
  source: AdminSettings,
  section: EditableSectionId,
): AdminSettings {
  switch (section) {
    case 'terminal':
      return { ...target, terminalId: source.terminalId };
    case 'features':
      return {
        ...target,
        features: [...source.features],
        deliveryModes: [...source.deliveryModes],
        deliverySchedule: source.deliverySchedule.map((days) => [...days]),
        experienceLogoMode: source.experienceLogoMode,
        selectedExperienceLogos: [...source.selectedExperienceLogos],
        ticketCategoryFilterDefault: source.ticketCategoryFilterDefault,
      };
    case 'language':
      return { ...target, language: source.language, multilingual: source.multilingual };
    case 'appearance':
      return { ...target, appearance: source.appearance };
    case 'orientation':
      return { ...target, orientation: source.orientation };
    case 'location':
      return { ...target, network: source.network, complex: source.complex };
    case 'updates':
      return { ...target, automaticUpdates: source.automaticUpdates };
  }
}

function AdminSection({
  title,
  icon,
  editable = false,
  isEditing = false,
  isDirty = false,
  isSaving = false,
  onEdit,
  onCancel,
  onSave,
  children,
  className = '',
}: AdminSectionProps) {
  const { t } = useI18n();
  const primaryAction = editable ? (
    isEditing ? (
      <TextButton
        intent="Information"
        size="sm"
        weight="Medium"
        label={t('admin.action.save')}
        rightIcon={<SaveIcon />}
        disabled={!isDirty || isSaving}
        onClick={onSave}
      />
    ) : (
      <TextButton
        intent="Information"
        size="sm"
        weight="Medium"
        label={t('admin.action.edit')}
        rightIcon={<EditIcon />}
        onClick={onEdit}
      />
    )
  ) : undefined;

  const secondaryAction = isEditing ? (
    <TextButton
      intent="Danger"
      size="sm"
      weight="Medium"
      label={t('checkout.cancel')}
      rightIcon={<TrashIcon />}
      onClick={onCancel}
    />
  ) : undefined;

  return (
    <section className={`admin-panel-page__section ${className}`.trim()}>
      <SectionHeader
        title={title}
        icon={icon}
        showActions={editable}
        showSecondaryAction={isEditing}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
      />
      <div className="admin-panel-page__section-body">{children}</div>
    </section>
  );
}

function SettingToggle({
  selected,
  editable = false,
  onChange,
}: {
  selected: boolean;
  editable?: boolean;
  onChange?: (selected: boolean) => void;
}) {
  const { t } = useI18n();
  return (
    <Toggle
      isActive={selected}
      state={editable ? 'default' : 'disabled'}
      disabled={!editable}
      aria-label={selected ? t('admin.state.enabled') : t('admin.state.disabled')}
      onActiveChange={onChange}
    />
  );
}

function StaticSetting({
  title,
  description,
  selected = false,
  action,
  editable = false,
  onSelectedChange,
}: {
  title: string;
  description?: string;
  selected?: boolean;
  action?: ReactNode;
  editable?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}) {
  return (
    <ListItemGroup
      title={title}
      showDescription={Boolean(description)}
      description={description}
      showSettingsGroup={false}
      showSubfeatures={false}
      actionSlot={action ?? (
        <SettingToggle selected={selected} editable={editable} onChange={onSelectedChange} />
      )}
    />
  );
}

export type SystemUpdateInfo = {
  version: string;
  size: string;
  changes: string[];
};

export type ServerSynchronizationSnapshot = unknown;

type SystemUpdateStage =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'installing'
  | 'restart-required'
  | 'up-to-date';

const defaultSystemUpdate: SystemUpdateInfo = {
  version: 'v1.0.0.7',
  size: '500MB',
  changes: [
    'Melhoria na velocidade do sistema',
    'Correção de bugs na seleção de assentos',
    'Novos métodos de pagamento',
  ],
};

const SERVER_SYNCHRONIZATION_POLLING_INTERVAL = 5 * 60 * 1000;
const SYSTEM_UPDATE_POLLING_INTERVAL = 24 * 60 * 60 * 1000;

const waitForUiFeedback = (milliseconds: number) => new Promise<void>((resolve) => {
  window.setTimeout(resolve, milliseconds);
});

function formatTodayTime(value: Date, locale: AppLocale) {
  return `${translate('calendar.today', undefined, locale)}, ${new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value)}`;
}

function formatFullDate(value: Date, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(value);
}

export interface AdminPanelPageProps {
  /** Device snapshots supplied by the machine/native hardware integration. */
  detectedDevices?: readonly DetectedHardwareDevice[];
  /** Persists a section. Return false or throw to display the error alert. */
  onSaveSection?: (
    section: EditableSectionId,
    settings: AdminSettings,
    context?: AdminSaveContext,
  ) => boolean | void | Promise<boolean | void>;
  /** Restarts the terminal after committing settings that require a new session. */
  onRestartSystem?: () => void;
  /** Lets the host application navigate to its location-update route. */
  onNavigateToLocationUpdate?: (location: { network: string; complex: string }) => void;
  /** Closes the terminal after committing settings for its next initialization. */
  onCloseSystem?: () => void;
  /** Requests fresh catalog, pricing and schedule data from the central server. */
  onSynchronize?: () => void | Promise<void>;
  /** Fetches new catalog data without applying it to the active Customer session. */
  onFetchSynchronization?: () => ServerSynchronizationSnapshot | Promise<ServerSynchronizationSnapshot>;
  /** Applies fetched catalog data after the Customer purchase session has ended. */
  onApplySynchronization?: (snapshot: ServerSynchronizationSnapshot) => void | Promise<void>;
  /** Reports whether a Customer purchase session is currently active. */
  isCustomerSessionActive?: () => boolean;
  /** Catalog polling interval. Defaults to five minutes. */
  synchronizationPollingIntervalMs?: number;
  /** Checks the update service. Return null when the installed version is current. */
  onCheckForUpdates?: () => SystemUpdateInfo | null | Promise<SystemUpdateInfo | null>;
  /** Automatic system-update polling interval. Defaults to 24 hours. */
  systemUpdatePollingIntervalMs?: number;
  /** Reports whether the product catalog has the data required for personalized concessions. */
  productCustomizationConfigured?: boolean;
  /** Validates the credential required to edit the terminal location. */
  onValidateLocationMasterPin?: (
    pin: string,
  ) => boolean | LocationPinAccess | Promise<boolean | LocationPinAccess>;
}

type SaveAlertState = {
  intent: Extract<AlertIntent, 'Success' | 'Error'>;
  title: string;
  description: string;
};

export function AdminPanelPage({
  detectedDevices = defaultDetectedHardwareDevices,
  onSaveSection,
  onRestartSystem,
  onNavigateToLocationUpdate,
  onCloseSystem,
  onSynchronize,
  onFetchSynchronization,
  onApplySynchronization,
  isCustomerSessionActive,
  synchronizationPollingIntervalMs = SERVER_SYNCHRONIZATION_POLLING_INTERVAL,
  onCheckForUpdates,
  systemUpdatePollingIntervalMs = SYSTEM_UPDATE_POLLING_INTERVAL,
  productCustomizationConfigured = false,
  onValidateLocationMasterPin,
}: AdminPanelPageProps) {
  const { locale, t, setLocale } = useI18n();
  const [savedSettings, setSavedSettings] = useState<AdminSettings>(() => getInitialAdminSettings());
  const [draftSettings, setDraftSettings] = useState<AdminSettings>(() => getInitialAdminSettings());
  const [appliedLocation, setAppliedLocation] = useState(() => {
    const initialSettings = getInitialAdminSettings();
    return { network: initialSettings.network, complex: initialSettings.complex };
  });
  const [editingSections, setEditingSections] = useState<EditableSectionId[]>([]);
  const [savingSections, setSavingSections] = useState<EditableSectionId[]>([]);
  const [saveAlert, setSaveAlert] = useState<SaveAlertState | null>(null);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const [hasPendingSynchronization, setHasPendingSynchronization] = useState(false);
  const [lastSynchronization, setLastSynchronization] = useState(() => new Date());
  const [updateStage, setUpdateStage] = useState<SystemUpdateStage>('idle');
  const [updateProgress, setUpdateProgress] = useState(0);
  const [availableUpdate, setAvailableUpdate] = useState<SystemUpdateInfo>(defaultSystemUpdate);
  const [lastUpdateCheck, setLastUpdateCheck] = useState(() => new Date());
  const [lastInstalledUpdate, setLastInstalledUpdate] = useState<Date | null>(getLastInstalledSystemUpdate);
  const [isThemeRecommendationOpen, setIsThemeRecommendationOpen] = useState(false);
  const [recommendedTheme, setRecommendedTheme] = useState<RecommendedTheme>('light');
  const adminPanelRef = useRef<HTMLDivElement>(null);
  const saveAlertTimeoutRef = useRef<number | null>(null);
  const saveAlertShellRef = useRef<HTMLDivElement>(null);
  const syncInFlightRef = useRef(false);
  const pendingSynchronizationSnapshotRef = useRef<ServerSynchronizationSnapshot>(undefined);
  const hasFetchedPendingSynchronizationRef = useRef(false);
  const checkForSystemUpdatesRef = useRef<() => Promise<void>>(async () => undefined);
  const orientation = useOrientation(draftSettings.orientation);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [accessibilityPreferences, setAccessibilityPreferences] = useState(() => ({
    highContrast: getHighContrastPreference(),
    textScale: getTextScalePreference(),
  }));
  const [pinDialogStep, setPinDialogStep] = useState<'closed' | 'current' | 'new' | 'confirm'>('closed');
  const [pinValue, setPinValue] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinInvalid, setPinInvalid] = useState(false);
  const [systemDialog, setSystemDialog] = useState<'restart' | 'close'>('restart');
  const [systemDialogOpen, setSystemDialogOpen] = useState(false);
  const [systemPin, setSystemPin] = useState('');
  const [systemPinInvalid, setSystemPinInvalid] = useState(false);
  const [locationAccessOpen, setLocationAccessOpen] = useState(false);
  const [locationMasterPin, setLocationMasterPin] = useState('');
  const [locationMasterPinInvalid, setLocationMasterPinInvalid] = useState(false);
  const [locationMasterPinBusy, setLocationMasterPinBusy] = useState(false);
  const [locationEditAccess, setLocationEditAccess] = useState<LocationPinAccess | null>(null);
  const [languageAccessOpen, setLanguageAccessOpen] = useState(false);
  const [languageAccessPin, setLanguageAccessPin] = useState('');
  const [languageAccessPinInvalid, setLanguageAccessPinInvalid] = useState(false);
  const [languageEditAccess, setLanguageEditAccess] = useState<'multilingual' | 'full' | null>(null);
  const [organizationSlideOver, setOrganizationSlideOver] = useState<OrganizationSelectionType | null>(null);
  const [terminalKeyboardOpen, setTerminalKeyboardOpen] = useState(false);
  const [terminalKeyboardValue, setTerminalKeyboardValue] = useState('');
  const [pendingCancelSection, setPendingCancelSection] = useState<EditableSectionId | null>(null);
  const [pendingUnsavedAction, setPendingUnsavedAction] = useState<'exit' | 'restart' | 'close' | null>(null);
  const [pendingSaveConfirmation, setPendingSaveConfirmation] = useState<'location' | 'features' | null>(null);
  const [isPendingLocationRestartPromptOpen, setIsPendingLocationRestartPromptOpen] = useState(false);
  const [showLocationUpdatePage, setShowLocationUpdatePage] = useState(false);
  const [featuresAwaitingPrerequisites, setFeaturesAwaitingPrerequisites] = useState<string[]>([]);
  const [communicationErrorRetry, setCommunicationErrorRetry] = useState<(() => void | Promise<void>) | null>(null);

  useEffect(() => {
    const updateAccessibilityPreferences = () => {
      setAccessibilityPreferences({
        highContrast: getHighContrastPreference(),
        textScale: getTextScalePreference(),
      });
    };
    window.addEventListener(ACCESSIBILITY_PREFERENCES_EVENT, updateAccessibilityPreferences);
    window.addEventListener('storage', updateAccessibilityPreferences);
    return () => {
      window.removeEventListener(ACCESSIBILITY_PREFERENCES_EVENT, updateAccessibilityPreferences);
      window.removeEventListener('storage', updateAccessibilityPreferences);
    };
  }, []);
  const recommendedThemeLabel = recommendedTheme === 'light' ? t('admin.theme.light') : t('admin.theme.dark');
  const recommendedThemeDescription = t('admin.theme.recommendedDescription');
  const adjustedThemeDescription = t('admin.theme.adjustedDescription');
  const localizedUpdateChanges = availableUpdate === defaultSystemUpdate
    ? [t('admin.update.changePerformance'), t('admin.update.changeSeats'), t('admin.update.changePayments')]
    : availableUpdate.changes;
  const hasPendingLocationChanges = savedSettings.network !== appliedLocation.network
    || savedSettings.complex !== appliedLocation.complex;

  useEffect(() => {
    if (!adminPanelRef.current) return;

    const tokenOrientation = orientation === 'horizontal' ? 'Horizontal' : 'Vertical';
    const tenant = getTenantFromNetwork(appliedLocation.network);
    const nextRecommendedTheme = recommendThemeForTenant(tokenOrientation, tenant);
    setRecommendedTheme(nextRecommendedTheme);

    if (!hasManualThemePreference()) {
      setThemePreference(nextRecommendedTheme, 'automatic');
      setSavedSettings((current) => ({ ...current, appearance: nextRecommendedTheme }));
      setDraftSettings((current) => ({ ...current, appearance: nextRecommendedTheme }));
    }
  }, [appliedLocation.network, orientation]);

  const customerSessionIsActive = useCallback(() => {
    if (isCustomerSessionActive) return isCustomerSessionActive();
    return typeof document !== 'undefined' && document.querySelector('[data-purchase-page]') !== null;
  }, [isCustomerSessionActive]);

  const synchronizeWithServer = useCallback(async () => {
    if (syncInFlightRef.current) return;

    syncInFlightRef.current = true;
    setIsSynchronizing(true);
    try {
      if (onFetchSynchronization) {
        const snapshot = await onFetchSynchronization();
        if (customerSessionIsActive()) {
          pendingSynchronizationSnapshotRef.current = snapshot;
          hasFetchedPendingSynchronizationRef.current = true;
          setHasPendingSynchronization(true);
          return;
        }
        await onApplySynchronization?.(snapshot);
      } else if (customerSessionIsActive()) {
        setHasPendingSynchronization(true);
        return;
      } else if (onSynchronize) {
        await onSynchronize();
      } else {
        await waitForUiFeedback(1200);
      }
      setLastSynchronization(new Date());
      setHasPendingSynchronization(false);
    } catch {
      // Keep the previous timestamp when the server request fails.
    } finally {
      syncInFlightRef.current = false;
      setIsSynchronizing(false);
    }
  }, [customerSessionIsActive, onApplySynchronization, onFetchSynchronization, onSynchronize]);

  useEffect(() => {
    const pollingInterval = Math.max(1000, synchronizationPollingIntervalMs);
    const interval = window.setInterval(() => {
      void synchronizeWithServer();
    }, pollingInterval);

    return () => window.clearInterval(interval);
  }, [synchronizationPollingIntervalMs, synchronizeWithServer]);

  useEffect(() => {
    if (!hasPendingSynchronization) return undefined;

    const applyWhenCustomerSessionEnds = async () => {
      if (customerSessionIsActive() || syncInFlightRef.current) return;

      syncInFlightRef.current = true;
      setIsSynchronizing(true);
      try {
        if (hasFetchedPendingSynchronizationRef.current) {
          await onApplySynchronization?.(pendingSynchronizationSnapshotRef.current);
          pendingSynchronizationSnapshotRef.current = undefined;
          hasFetchedPendingSynchronizationRef.current = false;
        } else if (onSynchronize) {
          await onSynchronize();
        } else {
          await waitForUiFeedback(1200);
        }
        setLastSynchronization(new Date());
        setHasPendingSynchronization(false);
      } catch {
        // Keep the snapshot queued so the next idle check can retry it.
      } finally {
        syncInFlightRef.current = false;
        setIsSynchronizing(false);
      }
    };

    void applyWhenCustomerSessionEnds();
    const interval = window.setInterval(() => {
      void applyWhenCustomerSessionEnds();
    }, 1000);

    return () => window.clearInterval(interval);
  }, [customerSessionIsActive, hasPendingSynchronization, onApplySynchronization, onSynchronize]);

  useEffect(() => {
    if (updateStage !== 'downloading' && updateStage !== 'installing') return undefined;

    const interval = window.setInterval(() => {
      setUpdateProgress((current) => Math.min(current + 10, 100));
    }, 250);

    return () => window.clearInterval(interval);
  }, [updateStage]);

  useEffect(() => {
    if (updateProgress < 100) return undefined;

    const transition = window.setTimeout(() => {
      if (updateStage === 'downloading') {
        if (savedSettings.automaticUpdates) {
          setUpdateProgress(0);
          setUpdateStage('installing');
        } else {
          setUpdateStage('ready');
        }
      } else if (updateStage === 'installing') {
        setUpdateStage('restart-required');
      }
    }, 350);

    return () => window.clearTimeout(transition);
  }, [savedSettings.automaticUpdates, updateProgress, updateStage]);

  useEffect(() => () => {
    if (saveAlertTimeoutRef.current !== null) {
      window.clearTimeout(saveAlertTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    const shell = saveAlertShellRef.current;
    const page = shell?.closest<HTMLElement>('.admin-panel-page');
    if (!saveAlert || !shell || !page) return undefined;

    const updateAlertHeight = () => {
      page.style.setProperty('--admin-save-alert-height', `${shell.offsetHeight}px`);
    };
    updateAlertHeight();
    const observer = new ResizeObserver(updateAlertHeight);
    observer.observe(shell);

    return () => {
      observer.disconnect();
      page.style.removeProperty('--admin-save-alert-height');
    };
  }, [saveAlert]);

  const isEditing = (section: EditableSectionId) => editingSections.includes(section);
  const isDirty = (section: EditableSectionId) => (
    isEditing(section)
    && JSON.stringify(sectionValue(draftSettings, section)) !== JSON.stringify(sectionValue(savedSettings, section))
  );
  const dirtySections = editingSections.filter((section) => isDirty(section));
  const hasUnsavedChanges = dirtySections.length > 0;

  const beginEdit = (section: EditableSectionId) => {
    setDraftSettings((current) => copySection(current, savedSettings, section));
    setEditingSections((current) => current.includes(section) ? current : [...current, section]);
  };

  const cancelEdit = (section: EditableSectionId) => {
    setDraftSettings((current) => copySection(current, savedSettings, section));
    setEditingSections((current) => current.filter((item) => item !== section));
    if (section === 'language') void setLocale(savedSettings.language);
  };

  const showSaveAlert = (alert: SaveAlertState) => {
    if (saveAlertTimeoutRef.current !== null) {
      window.clearTimeout(saveAlertTimeoutRef.current);
    }

    setSaveAlert(alert);
    saveAlertTimeoutRef.current = window.setTimeout(() => {
      setSaveAlert(null);
      saveAlertTimeoutRef.current = null;
    }, 5000);
  };

  const dismissSaveAlert = () => {
    if (saveAlertTimeoutRef.current !== null) {
      window.clearTimeout(saveAlertTimeoutRef.current);
      saveAlertTimeoutRef.current = null;
    }
    setSaveAlert(null);
  };

  const saveSections = async (
    sections: EditableSectionId[],
    contexts: Partial<Record<EditableSectionId, AdminSaveContext>> = {},
    settingsToSave: AdminSettings = draftSettings,
  ) => {
    let nextSettings = savedSettings;
    setSavingSections((current) => [...new Set([...current, ...sections])]);

    try {
      for (const section of sections) {
        nextSettings = copySection(nextSettings, settingsToSave, section);
        const saveResult = await onSaveSection?.(section, nextSettings, contexts[section]);
        if (saveResult === false) {
          throw new Error('The settings persistence handler reported a failure.');
        }
      }

      if (sections.includes('appearance')) {
        setThemePreference(settingsToSave.appearance);
        publishComplexTheme(settingsToSave.appearance, appliedLocation);
      }
      if (sections.includes('terminal')) {
        persistTerminalId(settingsToSave.terminalId);
      }
      if (sections.includes('orientation')) {
        setOrientationPreference(settingsToSave.orientation);
      }
      if (sections.includes('features')) {
        const seatDeliveryEnabled = settingsToSave.features[FEATURE_INDEX.seatDelivery]
          && settingsToSave.deliveryModes.some(Boolean);
        setFeaturePreferences({
          ageRatingNotice: settingsToSave.features[FEATURE_INDEX.ageRatingNotice],
          acceptCouponsAndVouchers: settingsToSave.features[FEATURE_INDEX.acceptCouponsAndVouchers],
          productCustomization: settingsToSave.features[FEATURE_INDEX.productCustomization],
          loyaltyProgram: settingsToSave.features[FEATURE_INDEX.loyaltyProgram],
          groupSalesSchoolProject: settingsToSave.features[FEATURE_INDEX.groupSalesSchoolProject],
          crossSellUpsell: settingsToSave.features[FEATURE_INDEX.crossSellUpsell],
          inclusiveSessionNotice: settingsToSave.features[FEATURE_INDEX.inclusiveSessionNotice],
          seatDelivery: seatDeliveryEnabled,
          showOccupancyLevel: settingsToSave.features[FEATURE_INDEX.showOccupancyLevel],
          showEstimatedEndTime: settingsToSave.features[FEATURE_INDEX.showEstimatedEndTime],
          showAuditorium: settingsToSave.features[FEATURE_INDEX.showAuditorium],
          showExperienceBadges: settingsToSave.features[FEATURE_INDEX.showExperienceBadges],
          formatDurationToMinutes: settingsToSave.features[FEATURE_INDEX.formatDurationToMinutes],
          ticketCategoryFilter: settingsToSave.features[FEATURE_INDEX.ticketCategoryFilter],
          ticketCategoryFilterDefault: settingsToSave.ticketCategoryFilterDefault,
          experienceLogoMode: settingsToSave.experienceLogoMode,
          selectedExperienceLogos: [...settingsToSave.selectedExperienceLogos],
        });
        setDeliveryPreferences({
          enabled: seatDeliveryEnabled,
          modes: [Boolean(settingsToSave.deliveryModes[0]), Boolean(settingsToSave.deliveryModes[1])],
          schedule: settingsToSave.deliverySchedule.map((days) => [...days]),
        });
      }
      if (sections.includes('language')) {
        setLanguagePreferences({
          defaultLocale: settingsToSave.language,
          multilingual: settingsToSave.multilingual,
        });
      }

      setSavedSettings(nextSettings);
      setEditingSections((current) => current.filter((item) => !sections.includes(item)));
      showSaveAlert({
        intent: 'Success',
        title: t('admin.alert.savedTitle'),
        description: t('admin.alert.savedDescription'),
      });
      return true;
    } catch {
      setCommunicationErrorRetry(() => async () => {
        const saved = await saveSections(sections, contexts, settingsToSave);
        if (saved) setCommunicationErrorRetry(null);
      });
      return false;
    } finally {
      setSavingSections((current) => current.filter((item) => !sections.includes(item)));
    }
  };

  const saveEdit = (section: EditableSectionId) => {
    if (section === 'location' || section === 'features') {
      setPendingSaveConfirmation(section);
      return Promise.resolve(false);
    }
    if (section === 'appearance') {
      return saveSections([section], {
        appearance: {
          scope: 'unit',
          location: appliedLocation,
          applyToOtherDevices: 'when-home-or-session-ends',
        },
      });
    }
    return saveSections([section]);
  };

  const saveLocation = async (restartNow: boolean) => {
    const saved = await saveSections(['location']);
    if (!saved) return;
    setPendingSaveConfirmation(null);
    if (restartNow) {
      const location = { network: draftSettings.network, complex: draftSettings.complex };
      applyLocationChanges(location);
      if (onNavigateToLocationUpdate) {
        onNavigateToLocationUpdate(location);
      } else {
        setShowLocationUpdatePage(true);
      }
    }
  };

  const saveFeatures = async (scope: 'device' | 'unit') => {
    const blockedFeatures: string[] = [];
    const effectiveSettings: AdminSettings = {
      ...draftSettings,
      features: [...draftSettings.features],
    };

    const isEnablingProductCustomization = !savedSettings.features[FEATURE_INDEX.productCustomization]
      && draftSettings.features[FEATURE_INDEX.productCustomization];
    if (isEnablingProductCustomization && !productCustomizationConfigured) {
      effectiveSettings.features[FEATURE_INDEX.productCustomization] = false;
      blockedFeatures.push(t('admin.feature.productCustomization'));
    }

    const saved = await saveSections(['features'], {
      features: scope === 'unit'
        ? {
            scope,
            location: { network: savedSettings.network, complex: savedSettings.complex },
            applyToOtherDevices: 'when-home-or-session-ends',
          }
        : { scope },
    }, effectiveSettings);
    if (saved) {
      setPendingSaveConfirmation(null);
      setDraftSettings(effectiveSettings);
      setFeaturesAwaitingPrerequisites(blockedFeatures);
    }
  };

  function updateDraft<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    setDraftSettings((current) => ({ ...current, [key]: value }));
  }

  const selectLanguage = (language: TerminalLocale) => {
    updateDraft('language', language);
    void setLocale(language);
  };

  const applyLocationChanges = (location: { network: string; complex: string }) => {
    const tokenOrientation = orientation === 'horizontal' ? 'Horizontal' : 'Vertical';
    const nextRecommendedTheme = recommendThemeForTenant(
      tokenOrientation,
      getTenantFromNetwork(location.network),
    );
    setLocationPreferences(location);
    setAppliedLocation(location);
    setRecommendedTheme(nextRecommendedTheme);
    setThemePreference(nextRecommendedTheme, 'automatic');
    setSavedSettings((current) => ({ ...current, appearance: nextRecommendedTheme }));
    setDraftSettings((current) => ({ ...current, appearance: nextRecommendedTheme }));
  };

  const commitPendingLocationChanges = () => {
    if (!hasPendingLocationChanges) return;
    applyLocationChanges({
      network: savedSettings.network,
      complex: savedSettings.complex,
    });
  };

  const restartSystem = () => {
    commitPendingLocationChanges();
    if (updateStage === 'restart-required') {
      const appliedAt = new Date();
      setLastInstalledUpdate(appliedAt);
      setLastInstalledSystemUpdate(appliedAt);
      setUpdateProgress(0);
      setUpdateStage('idle');
    }
    onRestartSystem?.();
  };

  const startPendingLocationUpdate = () => {
    const location = { network: savedSettings.network, complex: savedSettings.complex };
    applyLocationChanges(location);
    setIsPendingLocationRestartPromptOpen(false);
    if (onNavigateToLocationUpdate) {
      onNavigateToLocationUpdate(location);
    } else {
      setShowLocationUpdatePage(true);
    }
  };

  const closeSystem = () => {
    commitPendingLocationChanges();
    onCloseSystem?.();
  };

  const discardPendingLocationChanges = async () => {
    if (!hasPendingLocationChanges) return;

    const revertedSettings = {
      ...savedSettings,
      network: appliedLocation.network,
      complex: appliedLocation.complex,
    };
    setSavingSections((current) => current.includes('location') ? current : [...current, 'location']);

    try {
      const saveResult = await onSaveSection?.('location', revertedSettings);
      if (saveResult === false) {
        throw new Error('The settings persistence handler reported a failure.');
      }

      setSavedSettings(revertedSettings);
      setDraftSettings((current) => copySection(current, revertedSettings, 'location'));
      setEditingSections((current) => current.filter((section) => section !== 'location'));
    } catch {
      setCommunicationErrorRetry(() => discardPendingLocationChanges);
    } finally {
      setSavingSections((current) => current.filter((section) => section !== 'location'));
    }
  };

  const checkForSystemUpdates = async () => {
    if (updateStage !== 'idle' && updateStage !== 'up-to-date') return;

    setUpdateProgress(0);
    setUpdateStage('checking');
    try {
      const result = onCheckForUpdates
        ? await onCheckForUpdates()
        : (await waitForUiFeedback(1200), defaultSystemUpdate);
      setLastUpdateCheck(new Date());

      if (!result) {
        setUpdateStage('up-to-date');
        return;
      }

      setAvailableUpdate(result);
      if (savedSettings.automaticUpdates) {
        setUpdateStage('downloading');
      } else {
        setUpdateStage('available');
      }
    } catch {
      setUpdateStage('idle');
      setCommunicationErrorRetry(() => checkForSystemUpdates);
    }
  };

  checkForSystemUpdatesRef.current = checkForSystemUpdates;

  useEffect(() => {
    if (!savedSettings.automaticUpdates) return undefined;

    const pollingInterval = Math.max(1000, systemUpdatePollingIntervalMs);
    const interval = window.setInterval(() => {
      void checkForSystemUpdatesRef.current();
    }, pollingInterval);

    return () => window.clearInterval(interval);
  }, [savedSettings.automaticUpdates, systemUpdatePollingIntervalMs]);

  const downloadSystemUpdate = () => {
    setUpdateProgress(0);
    setUpdateStage('downloading');
  };

  const installSystemUpdate = () => {
    setUpdateProgress(0);
    setUpdateStage('installing');
  };

  const cancelSystemUpdate = () => {
    setUpdateProgress(0);
    setUpdateStage('idle');
  };

  const restartToApplySystemUpdate = () => {
    restartSystem();
  };

  const editableSectionProps = (section: EditableSectionId) => ({
    editable: true,
    isEditing: isEditing(section),
    isDirty: isDirty(section),
    isSaving: savingSections.includes(section),
    onEdit: () => {
      if (section === 'language') {
        setLanguageEditAccess(null);
        setLanguageAccessPin('');
        setLanguageAccessPinInvalid(false);
        setLanguageAccessOpen(true);
        return;
      }
      if (section === 'location') {
        setLocationEditAccess(null);
        setLocationMasterPin('');
        setLocationMasterPinInvalid(false);
        setLocationAccessOpen(true);
        return;
      }
      beginEdit(section);
    },
    onCancel: () => {
      if (isDirty(section)) setPendingCancelSection(section);
      else cancelEdit(section);
    },
    onSave: () => saveEdit(section),
  });

  const closePinDialog = () => {
    setPinDialogStep('closed');
    setPinValue('');
    setNewPin('');
    setPinInvalid(false);
  };

  const closeLocationAccess = () => {
    if (locationMasterPinBusy) return;
    setLocationAccessOpen(false);
    setLocationMasterPin('');
    setLocationMasterPinInvalid(false);
  };

  const closeLanguageAccess = () => {
    setLanguageAccessOpen(false);
    setLanguageAccessPin('');
    setLanguageAccessPinInvalid(false);
  };

  const authenticateLanguageAccess = () => {
    const accessLevel = getAdminAccessLevel(languageAccessPin);
    if (!accessLevel) {
      setLanguageAccessPinInvalid(true);
      return;
    }
    setLanguageEditAccess(accessLevel >= 2 ? 'full' : 'multilingual');
    setLanguageAccessOpen(false);
    setLanguageAccessPin('');
    setLanguageAccessPinInvalid(false);
    beginEdit('language');
  };

  const authenticateLocationAccess = async () => {
    if (locationMasterPinBusy || locationMasterPin.length < 4) return;
    setLocationMasterPinBusy(true);
    try {
      const builtInAccess = validateLocationPinAccess(locationMasterPin);
      const validationResult = builtInAccess ?? (onValidateLocationMasterPin
        ? await onValidateLocationMasterPin(locationMasterPin)
        : null);
      const access = validationResult === true
        ? 'full'
        : validationResult === false
          ? null
          : validationResult;
      if (!access) {
        setLocationMasterPinInvalid(true);
        return;
      }
      setLocationAccessOpen(false);
      setLocationMasterPin('');
      setLocationMasterPinInvalid(false);
      setLocationEditAccess(access);
      beginEdit('location');
    } catch {
      setLocationMasterPinInvalid(true);
    } finally {
      setLocationMasterPinBusy(false);
    }
  };

  const openPinDialog = () => {
    setPinDialogStep('current');
    setPinValue('');
    setNewPin('');
    setPinInvalid(false);
  };

  const continuePinChange = () => {
    if (pinDialogStep === 'current') {
      if (!validateAdminAccessPin(pinValue)) {
        setPinInvalid(true);
        return;
      }
      setPinValue('');
      setPinInvalid(false);
      setPinDialogStep('new');
      return;
    }
    if (pinDialogStep === 'new') {
      setNewPin(pinValue);
      setPinValue('');
      setPinInvalid(false);
      setPinDialogStep('confirm');
      return;
    }
    if (pinValue !== newPin) {
      setPinInvalid(true);
      return;
    }
    if (setAdminPin(newPin)) closePinDialog();
  };

  const openSystemDialog = (dialog: 'restart' | 'close') => {
    setSystemDialog(dialog);
    setSystemDialogOpen(true);
    setSystemPin('');
    setSystemPinInvalid(false);
  };

  const closeSystemDialog = () => {
    setSystemDialogOpen(false);
    setSystemPin('');
    setSystemPinInvalid(false);
  };

  const confirmSystemRestart = () => {
    closeSystemDialog();
    restartSystem();
    if (!onRestartSystem) window.location.reload();
  };

  const confirmSystemClose = () => {
    if (!validateAdminAccessPin(systemPin)) {
      setSystemPinInvalid(true);
      return;
    }
    closeSystemDialog();
    closeSystem();
    if (!onCloseSystem) window.close();
  };

  const leaveAdminPanel = () => {
    if (hasUnsavedChanges) {
      setPendingUnsavedAction('exit');
      return;
    }
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const requestSystemRestart = () => {
    if (hasUnsavedChanges) {
      setPendingUnsavedAction('restart');
      return;
    }
    openSystemDialog('restart');
  };

  const requestSystemClose = () => {
    if (hasUnsavedChanges) {
      setPendingUnsavedAction('close');
      return;
    }
    openSystemDialog('close');
  };

  const executePendingAction = (action: 'exit' | 'restart' | 'close') => {
    setPendingUnsavedAction(null);
    if (action === 'exit') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    if (action === 'restart') {
      restartSystem();
      if (!onRestartSystem) window.location.reload();
      return;
    }
    openSystemDialog('close');
  };

  const saveAndExecutePendingAction = async () => {
    if (!pendingUnsavedAction) return;
    const action = pendingUnsavedAction;
    const saved = await saveSections(dirtySections);
    if (saved) executePendingAction(action);
  };

  const openOrganizationSelection = (type: OrganizationSelectionType) => {
    if (!isEditing('location')) return;
    if (type === 'network' && locationEditAccess !== 'full') return;
    if (type === 'complex' && !locationEditAccess) return;
    setOrganizationSlideOver(type);
  };

  const canEditDisplayLanguage = isEditing('language') && languageEditAccess === 'full';
  const canEditMultilingualMode = isEditing('language') && languageEditAccess !== null;

  if (showLocationUpdatePage) {
    return <OnboardingUpdatePage />;
  }

  return (
    <div
      ref={adminPanelRef}
      className={`admin-panel-page admin-panel-page--${orientation}${saveAlert ? ' admin-panel-page--save-alert-visible' : ''}`}
      data-theme={draftSettings.appearance}
      data-orientation={orientation}
      style={tokenStyles(
        draftSettings.appearance === 'dark' ? 'Dark' : 'Light',
        orientation === 'horizontal' ? 'Horizontal' : 'Vertical',
        getTenantFromNetwork(appliedLocation.network),
        accessibilityPreferences.highContrast,
        accessibilityPreferences.textScale,
      )}
    >
      <Header context="Admin" version="V 1.0.0.1" />

      <main className="admin-panel-page__content">
        <AdminSection
          title={t('admin.section.identification')}
          icon={<span className="section-header-icon section-header-icon--outlined" aria-hidden="true"><IdIcon /></span>}
          {...editableSectionProps('terminal')}
        >
          <Input
            showTitle
            title={t('onboarding.activation.terminalId')}
            value={draftSettings.terminalId}
            state={isEditing('terminal') ? 'Default' : 'Read Only'}
            border="md"
            controlRole="button"
            controlTabIndex={0}
            onControlClick={() => {
              if (!isEditing('terminal')) beginEdit('terminal');
              setTerminalKeyboardValue(draftSettings.terminalId);
              setTerminalKeyboardOpen(true);
            }}
            onControlKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              if (!isEditing('terminal')) beginEdit('terminal');
              setTerminalKeyboardValue(draftSettings.terminalId);
              setTerminalKeyboardOpen(true);
            }}
          />
        </AdminSection>

        <AdminSection
          title={t('admin.section.features')}
          icon={<span className="section-header-icon section-header-icon--outlined" aria-hidden="true"><PuzzleIcon /></span>}
          {...editableSectionProps('features')}
        >
          <div className="admin-panel-page__divided-list">
            {featureFlags.map((feature, arrayIndex) => (
              <Fragment key={feature.id}>
                {arrayIndex > 0 && <Divider />}
                <div className="admin-panel-page__divided-item">
                <StaticSetting
                  title={t(feature.titleKey)}
                  description={feature.descriptionKey ? t(feature.descriptionKey) : undefined}
                  selected={draftSettings.features[feature.index]}
                  editable={isEditing('features')}
                  onSelectedChange={(selected) => {
                    const features = [...draftSettings.features];
                    features[feature.index] = selected;
                    updateDraft('features', features);
                    if (feature.id === 'seatDelivery' && selected && !draftSettings.deliveryModes.some(Boolean)) {
                      updateDraft('deliveryModes', [true, false]);
                    }
                    if (feature.id === 'showExperienceBadges' && selected && draftSettings.selectedExperienceLogos.length === 0) {
                      updateDraft('selectedExperienceLogos', [...EXPERIENCE_LOGO_OPTIONS]);
                    }
                  }}
                />
                {feature.id === 'ticketCategoryFilter' && draftSettings.features[feature.index] && (
                  <div className="admin-panel-page__ticket-category-options">
                    <NestedSelectionGroup
                      groupTitle={t('admin.ticketCategoryFilter.defaultCategory')}
                      state={isEditing('features') ? 'Default' : 'Read Only'}
                    >
                      {([
                        ['all', t('tickets.filterAll')],
                        ['promotional', t('tickets.filterPromotional')],
                        ['full', t('tickets.filterFull')],
                        ['half', t('tickets.filterHalf')],
                      ] as const).map(([category, label]) => (
                        <Choice_Chip
                          key={category}
                          optionName={label}
                          selected={draftSettings.ticketCategoryFilterDefault === category}
                          controlledSelection
                          state={isEditing('features') ? 'Default' : 'Read Only'}
                          onClick={() => updateDraft('ticketCategoryFilterDefault', category)}
                        />
                      ))}
                    </NestedSelectionGroup>
                  </div>
                )}
                {feature.id === 'showExperienceBadges' && draftSettings.features[feature.index] && (
                  <div className="admin-panel-page__experience-options">
                    <div className="admin-panel-page__delivery-settings">
                      <div className="admin-panel-page__delivery-settings-header">
                        <p>{t('admin.experienceLogos.ruleTitle')}</p>
                        <span>{t('admin.experienceLogos.ruleDescription')}</span>
                      </div>
                      <div className="admin-panel-page__delivery-cards">
                        <CheckableCard
                          title={t('admin.experienceLogos.allTitle')}
                          description={t('admin.experienceLogos.allDescription')}
                          bottomText={t('admin.experienceLogos.globalDisplay')}
                          selected={draftSettings.experienceLogoMode === 'all'}
                          selectionMode="radio"
                          state={isEditing('features') ? 'Default' : 'Read Only'}
                          onClick={() => updateDraft('experienceLogoMode', 'all')}
                        />
                        <CheckableCard
                          title={t('admin.experienceLogos.customTitle')}
                          description={t('admin.experienceLogos.customDescription')}
                          bottomText={t('admin.experienceLogos.restrictedDisplay')}
                          selected={draftSettings.experienceLogoMode === 'custom'}
                          selectionMode="radio"
                          state={isEditing('features') ? 'Default' : 'Read Only'}
                          onClick={() => updateDraft('experienceLogoMode', 'custom')}
                        />
                      </div>
                    </div>
                    {draftSettings.experienceLogoMode === 'custom' && (
                      <NestedSelectionGroup
                        groupTitle={t('admin.experienceLogos.experiences')}
                        state={isEditing('features') ? 'Default' : 'Read Only'}
                      >
                        {EXPERIENCE_LOGO_OPTIONS.map((experience) => (
                          <Choice_Chip
                            key={experience}
                            optionName={experience}
                            selected={draftSettings.selectedExperienceLogos.includes(experience)}
                            state={isEditing('features') ? 'Default' : 'Read Only'}
                            onClick={() => {
                              const selectedExperienceLogos = draftSettings.selectedExperienceLogos.includes(experience)
                                ? draftSettings.selectedExperienceLogos.filter((item) => item !== experience)
                                : [...draftSettings.selectedExperienceLogos, experience];
                              updateDraft('selectedExperienceLogos', selectedExperienceLogos);
                            }}
                          />
                        ))}
                      </NestedSelectionGroup>
                    )}
                  </div>
                )}
                {feature.id === 'seatDelivery' && draftSettings.features[feature.index] && (
                  <div className="admin-panel-page__delivery-options">
                    <div className="admin-panel-page__delivery-settings">
                      <div className="admin-panel-page__delivery-settings-header">
                        <p>{t('admin.delivery.title')}</p>
                        <span>{t('admin.delivery.description')}</span>
                      </div>
                      <div className="admin-panel-page__delivery-cards">
                        <CheckableCard
                          title={t('admin.delivery.ticketAndConcessions')}
                          description={t('admin.delivery.ticketAndConcessionsDescription')}
                          bottomText={t('admin.delivery.combinedSale')}
                          selected={draftSettings.deliveryModes[0]}
                          state={isEditing('features') ? 'Default' : 'Read Only'}
                          onClick={() => {
                            const deliveryModes = [...draftSettings.deliveryModes];
                            deliveryModes[0] = !deliveryModes[0];
                            updateDraft('deliveryModes', deliveryModes);
                            if (!deliveryModes.some(Boolean)) {
                              const features = [...draftSettings.features];
                              features[FEATURE_INDEX.seatDelivery] = false;
                              updateDraft('features', features);
                            }
                          }}
                        />
                        <CheckableCard
                          title={t('admin.delivery.concessionsOnly')}
                          description={t('admin.delivery.concessionsOnlyDescription')}
                          bottomText={t('admin.delivery.standaloneSale')}
                          selected={draftSettings.deliveryModes[1]}
                          state={isEditing('features') ? 'Default' : 'Read Only'}
                          onClick={() => {
                            const deliveryModes = [...draftSettings.deliveryModes];
                            deliveryModes[1] = !deliveryModes[1];
                            updateDraft('deliveryModes', deliveryModes);
                            if (!deliveryModes.some(Boolean)) {
                              const features = [...draftSettings.features];
                              features[FEATURE_INDEX.seatDelivery] = false;
                              updateDraft('features', features);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="admin-panel-page__delivery-schedule">
                      {deliveryRoomGroups.map((room, roomIndex) => (
                        <NestedSelectionGroup
                          key={room}
                          groupTitle={room}
                          state={isEditing('features') ? 'Default' : 'Read Only'}
                        >
                          {deliveryDayKeys.map((dayKey, dayIndex) => (
                            <Choice_Chip
                              key={dayKey}
                              optionName={t(dayKey)}
                              selected={draftSettings.deliverySchedule[roomIndex][dayIndex]}
                              state={isEditing('features') ? 'Default' : 'Read Only'}
                              onClick={() => {
                                const deliverySchedule = draftSettings.deliverySchedule.map((days) => [...days]);
                                deliverySchedule[roomIndex][dayIndex] = !deliverySchedule[roomIndex][dayIndex];
                                updateDraft('deliverySchedule', deliverySchedule);
                              }}
                            />
                          ))}
                        </NestedSelectionGroup>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </Fragment>
            ))}
          </div>
        </AdminSection>

        <AdminSection title={t('onboarding.hardware.section')} icon={<span className="section-header-icon section-header-icon--outlined" aria-hidden="true"><ChipIcon /></span>}>
          <div className="admin-panel-page__hardware-grid">
            <DeviceStatusCard
              deviceType="printer"
              detectedDevices={detectedDevices}
              actionLabel={t('onboarding.hardware.printTest')}
            />
            <DeviceStatusCard
              deviceType="payment-terminal"
              detectedDevices={detectedDevices}
              actionLabel={t('onboarding.hardware.testCommunication')}
            />
          </div>
        </AdminSection>

        <AdminSection title={t('admin.section.server')} icon={<span className="section-header-icon section-header-icon--outlined" aria-hidden="true"><ServerIcon /></span>}>
          {isSynchronizing ? (
            <ListItemGroup
              className="admin-panel-page__operation-status"
              title={t('admin.server.syncing')}
              showSettingsGroup={false}
              showSubfeatures={false}
              bottomSlot={<IndeterminateLinearProgress aria-label={t('admin.server.syncingAria')} />}
              actionSlot={(
                <Button
                  intent="primary"
                  variant="outlined"
                  radius="xs"
                  label={t('admin.server.sync')}
                  showSecondaryLabel={false}
                  showLeftIcon={false}
                  showRightIcon={false}
                  disabled
                />
              )}
            />
          ) : (
            <StaticSetting
              title={t('admin.server.forcedSync')}
              description={t('admin.server.forcedSyncDescription')}
              action={
                <Button
                  intent="primary"
                  variant="outlined"
                  radius="xs"
                  label={t('admin.server.sync')}
                  showSecondaryLabel={false}
                  showLeftIcon={false}
                  showRightIcon={false}
                  onClick={() => void synchronizeWithServer()}
                />
              }
            />
          )}
          <Divider />
          <p className="admin-panel-page__sync-time">
            <strong>{t('admin.server.lastSync')}</strong> {formatTodayTime(lastSynchronization, locale)}
          </p>
        </AdminSection>

        <AdminSection
          title={t('onboarding.language.title')}
          icon={<span className="section-header-icon" aria-hidden="true"><TranslationIcon /></span>}
          {...editableSectionProps('language')}
        >
          <div className="admin-panel-page__language-group">
            <p className="admin-panel-page__field-label">{t('admin.language.display')}</p>
            <div className="admin-panel-page__language-options">
              <SelectionTile
                text={t('language.portuguese')}
                selected={draftSettings.language === 'pt-BR'}
                state={canEditDisplayLanguage ? 'Default' : 'ReadOnly'}
                slotContent={<LocaleAvatar locale="pt-BR" />}
                onClick={() => canEditDisplayLanguage && selectLanguage('pt-BR')}
              />
              <SelectionTile
                text={t('language.spanish')}
                selected={draftSettings.language === 'es-ES'}
                state={canEditDisplayLanguage ? 'Default' : 'ReadOnly'}
                slotContent={<LocaleAvatar locale="es-ES" />}
                onClick={() => canEditDisplayLanguage && selectLanguage('es-ES')}
              />
              <SelectionTile
                text={t('language.english')}
                selected={draftSettings.language === 'en-US'}
                state={canEditDisplayLanguage ? 'Default' : 'ReadOnly'}
                slotContent={<LocaleAvatar locale="en-US" />}
                onClick={() => canEditDisplayLanguage && selectLanguage('en-US')}
              />
            </div>
          </div>
          <Divider />
          <StaticSetting
            title={t('admin.language.multilingual')}
            description={t('admin.language.multilingualDescription')}
            selected={draftSettings.multilingual}
            editable={canEditMultilingualMode}
            onSelectedChange={(selected) => updateDraft('multilingual', selected)}
          />
        </AdminSection>

        <AdminSection
          title={t('admin.section.appearance')}
          icon={<span className="section-header-icon section-header-icon--outlined" aria-hidden="true"><ColorPaletteIcon /></span>}
          {...editableSectionProps('appearance')}
        >
          <div className="admin-panel-page__selection-list">
            <SelectionCard
              title={t('admin.theme.light')}
              supportingText={t('admin.theme.lightDescription')}
              showTag={recommendedTheme === 'light'}
              tagText={t('admin.common.recommended')}
              tagStatus="Neutral"
              selected={draftSettings.appearance === 'light'}
              state={isEditing('appearance') ? 'Default' : 'Read Only'}
              textSize="lg"
              onClick={() => updateDraft('appearance', 'light')}
            />
            <SelectionCard
              title={t('admin.theme.dark')}
              supportingText={t('admin.theme.darkDescription')}
              showTag={recommendedTheme === 'dark'}
              tagText={t('admin.common.recommended')}
              tagStatus="Neutral"
              selected={draftSettings.appearance === 'dark'}
              state={isEditing('appearance') ? 'Default' : 'Read Only'}
              textSize="lg"
              onClick={() => updateDraft('appearance', 'dark')}
            />
          </div>

          <div className="admin-panel-page__theme-recommendation">
            <button
              type="button"
              className="admin-panel-page__theme-recommendation-trigger"
              aria-expanded={isThemeRecommendationOpen}
              aria-controls="theme-recommendation-content"
              onClick={() => setIsThemeRecommendationOpen((isOpen) => !isOpen)}
            >
              <span>{t('admin.theme.recommendation')}</span>
              <span
                className={`admin-panel-page__theme-recommendation-icon${isThemeRecommendationOpen ? ' admin-panel-page__theme-recommendation-icon--open' : ''}`}
                aria-hidden="true"
              >
                <ChevronDownIcon />
              </span>
            </button>

            {isThemeRecommendationOpen && (
              <div
                id="theme-recommendation-content"
                className="admin-panel-page__theme-recommendation-content"
              >
                <div className="admin-panel-page__theme-recommendation-copy" role="paragraph">
                  <span>{t('admin.theme.analysisPrefix')}</span>
                  {' '}
                  <ColorSample
                    className="admin-panel-page__theme-color-sample"
                    colorValue="var(--Semantic-Primary-Default, #980038)"
                  />
                  <span>{t('admin.theme.analysisSuffix')}</span>
                  <strong>{recommendedThemeLabel}.</strong>
                </div>

                <div className="admin-panel-page__theme-preview">
                  <p className="admin-panel-page__theme-preview-title">{t('admin.theme.preview')}</p>
                  <div className="admin-panel-page__theme-preview-grid">
                    <div
                      className="admin-panel-page__theme-preview-fixed"
                      data-theme="light"
                      style={tokenStyles(
                        'Light',
                        orientation === 'horizontal' ? 'Horizontal' : 'Vertical',
                        getTenantFromNetwork(appliedLocation.network),
                      )}
                    >
                      <ThemePreviewCard
                        icon={<SunIcon />}
                        title={t('admin.theme.light')}
                        description={recommendedTheme === 'light' ? recommendedThemeDescription : adjustedThemeDescription}
                      />
                    </div>
                    <div
                      className="admin-panel-page__theme-preview-fixed"
                      data-theme="dark"
                      style={tokenStyles(
                        'Dark',
                        orientation === 'horizontal' ? 'Horizontal' : 'Vertical',
                        getTenantFromNetwork(appliedLocation.network),
                      )}
                    >
                      <ThemePreviewCard
                        icon={<MoonIcon />}
                        title={t('admin.theme.dark')}
                        description={recommendedTheme === 'dark' ? recommendedThemeDescription : adjustedThemeDescription}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AdminSection>

        <AdminSection
          title={t('admin.section.orientation')}
          icon={<span className="section-header-icon section-header-icon--outlined" aria-hidden="true"><OrientationIcon /></span>}
          {...editableSectionProps('orientation')}
        >
          <div className="admin-panel-page__selection-list admin-panel-page__orientation-list">
            <SelectionCard
              title={t('admin.orientation.automatic')}
              supportingText={t('admin.orientation.automaticDescription')}
              showTag
              tagText={t('admin.common.recommended')}
              tagStatus="Neutral"
              selected={draftSettings.orientation === 'automatic'}
              state={isEditing('orientation') ? 'Default' : 'Read Only'}
              textSize="lg"
              onClick={() => updateDraft('orientation', 'automatic')}
            />
            <SelectionCard
              title={t('admin.orientation.vertical')}
              supportingText={t('admin.orientation.verticalDescription')}
              selected={draftSettings.orientation === 'vertical'}
              state={isEditing('orientation') ? 'Default' : 'Read Only'}
              textSize="lg"
              onClick={() => updateDraft('orientation', 'vertical')}
            />
            <SelectionCard
              title={t('admin.orientation.horizontal')}
              supportingText={t('admin.orientation.horizontalDescription')}
              selected={draftSettings.orientation === 'horizontal'}
              state={isEditing('orientation') ? 'Default' : 'Read Only'}
              textSize="lg"
              onClick={() => updateDraft('orientation', 'horizontal')}
            />
          </div>
        </AdminSection>

        <AdminSection
          title={t('onboarding.location.section')}
          icon={<span className="section-header-icon section-header-icon--outlined" aria-hidden="true"><LocationIcon /></span>}
          {...editableSectionProps('location')}
        >
          <div className="admin-panel-page__location-grid">
            <Input
              showTitle
              title={t('onboarding.location.exhibitor')}
              value={draftSettings.network}
              state={isEditing('location') && locationEditAccess === 'full' ? 'Default' : 'Read Only'}
              border="md"
              showIconRight
              iconRight={<ChevronDownIcon aria-hidden="true" />}
              controlRole={isEditing('location') && locationEditAccess === 'full' ? 'button' : undefined}
              controlTabIndex={isEditing('location') && locationEditAccess === 'full' ? 0 : undefined}
              onControlClick={isEditing('location') && locationEditAccess === 'full' ? () => openOrganizationSelection('network') : undefined}
              onControlKeyDown={(event) => {
                if (isEditing('location') && locationEditAccess === 'full' && (event.key === 'Enter' || event.key === ' ')) {
                  openOrganizationSelection('network');
                }
              }}
            />
            <Input
              className="admin-panel-page__complex-input"
              showTitle
              title={t('onboarding.location.complex')}
              value={draftSettings.complex}
              placeholder={t('onboarding.location.select')}
              state={isEditing('location') && locationEditAccess ? 'Filled' : 'Read Only'}
              border="md"
              showIconRight
              iconRight={<ChevronDownIcon aria-hidden="true" />}
              controlRole={isEditing('location') && locationEditAccess ? 'button' : undefined}
              controlTabIndex={isEditing('location') && locationEditAccess ? 0 : undefined}
              onControlClick={isEditing('location') && locationEditAccess ? () => openOrganizationSelection('complex') : undefined}
              onControlKeyDown={(event) => {
                if (isEditing('location') && locationEditAccess && (event.key === 'Enter' || event.key === ' ')) {
                  openOrganizationSelection('complex');
                }
              }}
            />
          </div>
          {hasPendingLocationChanges && (
            <div className="admin-panel-page__location-pending" aria-live="polite">
              <Divider />
              <ListItemGroup
                className="admin-panel-page__location-pending-message"
                title={t('admin.location.pendingTitle')}
                showDescription
                description={t('admin.location.pendingDescription')}
                showSettingsGroup={false}
                showSubfeatures={false}
                actionSlot={(
                  <Button
                    className="admin-panel-page__location-restart"
                    intent="primary"
                    variant="outlined"
                    radius="xs"
                    label={t('admin.action.restart')}
                    showSecondaryLabel={false}
                    showLeftIcon={false}
                    showRightIcon={false}
                    onClick={() => setIsPendingLocationRestartPromptOpen(true)}
                  />
                )}
              />
              <Divider />
              <TextButton
                className="admin-panel-page__location-discard"
                intent="Danger"
                size="sm"
                weight="Medium"
                label={t('admin.action.discardChanges')}
                rightIcon={<TrashIcon />}
                onClick={discardPendingLocationChanges}
              />
            </div>
          )}
        </AdminSection>

        <AdminSection
          title={t('admin.section.update')}
          icon={<span className="section-header-icon" aria-hidden="true"><UpdateIcon /></span>}
          {...editableSectionProps('updates')}
        >
          {updateStage === 'idle' && (
            <StaticSetting
              title={t('admin.update.lastCheck', { value: formatTodayTime(lastUpdateCheck, locale) })}
              description={t('admin.update.lastInstalled', {
                value: lastInstalledUpdate
                  ? formatFullDate(lastInstalledUpdate, locale)
                  : t('admin.update.noInstalledRecord'),
              })}
              action={
                <Button
                  intent="primary"
                  variant="outlined"
                  radius="xs"
                  label={t('admin.update.check')}
                  showSecondaryLabel={false}
                  showLeftIcon={false}
                  showRightIcon={false}
                  onClick={() => void checkForSystemUpdates()}
                />
              }
            />
          )}
          {updateStage === 'checking' && (
            <ListItemGroup
              className="admin-panel-page__operation-status"
              title={t('admin.update.checking')}
              showSettingsGroup={false}
              showSubfeatures={false}
              bottomSlot={<IndeterminateLinearProgress aria-label={t('admin.update.checkingAria')} />}
              actionSlot={(
                <Button
                  intent="primary"
                  variant="outlined"
                  radius="xs"
                  label={t('admin.update.check')}
                  showSecondaryLabel={false}
                  showLeftIcon={false}
                  showRightIcon={false}
                  disabled
                />
              )}
            />
          )}
          {updateStage === 'available' && (
            <ListItemGroup
              title={t('admin.update.available', { version: availableUpdate.version })}
              showSuffix
              suffix={availableUpdate.size}
              showDescription
              description={t('admin.update.availableDescription')}
              showSettingsGroup={false}
              showSubfeatures={false}
              actionSlot={(
                <Button
                  intent="primary"
                  variant="outlined"
                  radius="xs"
                  label={t('admin.update.download')}
                  showSecondaryLabel={false}
                  showLeftIcon={false}
                  showRightIcon={false}
                  onClick={downloadSystemUpdate}
                />
              )}
            />
          )}
          {updateStage === 'downloading' && (
            <TaskStatusRow
              title={t('admin.update.downloading', { version: availableUpdate.version })}
              showTitleSuffix
              titleSuffix={availableUpdate.size}
              description={t('admin.update.downloadingDescription')}
              percentage={String(updateProgress)}
              currentStep="1"
              totalSteps="2"
              onCancel={cancelSystemUpdate}
            />
          )}
          {updateStage === 'ready' && (
            <ListItemGroup
              title={t('admin.update.ready')}
              showDescription
              description={t('admin.update.readyDescription')}
              showSettingsGroup={false}
              showSubfeatures={false}
              actionSlot={(
                <Button
                  intent="primary"
                  variant="outlined"
                  radius="xs"
                  label={t('admin.update.install')}
                  showSecondaryLabel={false}
                  showLeftIcon={false}
                  showRightIcon={false}
                  onClick={installSystemUpdate}
                />
              )}
            />
          )}
          {updateStage === 'installing' && (
            <TaskStatusRow
              title={t('admin.update.installing', { version: availableUpdate.version })}
              description={t('admin.update.installingDescription')}
              percentage={String(updateProgress)}
              currentStep="2"
              totalSteps="2"
              showTitleSuffix={false}
              onCancel={cancelSystemUpdate}
            />
          )}
          {updateStage === 'restart-required' && (
            <ListItemGroup
              className="admin-panel-page__update-restart"
              title={t('admin.update.restartPending')}
              showDescription
              description={t('admin.update.restartPendingDescription')}
              showSettingsGroup={false}
              showSubfeatures={false}
              actionSlot={(
                <Button
                  intent="primary"
                  variant="outlined"
                  radius="xs"
                  label={t('admin.update.restartNow')}
                  showSecondaryLabel={false}
                  showLeftIcon={false}
                  showRightIcon={false}
                  onClick={restartToApplySystemUpdate}
                />
              )}
            />
          )}
          {updateStage === 'up-to-date' && (
            <ListItemGroup
              title={t('admin.update.current')}
              showDescription
              description={t('admin.update.currentDescription')}
              showSettingsGroup={false}
              showSubfeatures={false}
              actionSlot={(
                <Button
                  intent="primary"
                  variant="outlined"
                  radius="xs"
                  label={t('admin.update.check')}
                  showSecondaryLabel={false}
                  showLeftIcon={false}
                  showRightIcon={false}
                  onClick={() => void checkForSystemUpdates()}
                />
              )}
            />
          )}
          {(['available', 'downloading', 'ready', 'installing', 'restart-required'] as SystemUpdateStage[]).includes(updateStage) && (
            <>
              <Divider />
              <NestedWrapper
                className="admin-panel-page__update-notes"
                title={t('admin.update.whatsNew')}
                list={localizedUpdateChanges}
              />
            </>
          )}
          <Divider />
          <StaticSetting
            title={t('admin.update.automatic')}
            description={t('admin.update.automaticDescription')}
            selected={draftSettings.automaticUpdates}
            editable={isEditing('updates') && !(['checking', 'downloading', 'installing'] as SystemUpdateStage[]).includes(updateStage)}
            onSelectedChange={(selected) => updateDraft('automaticUpdates', selected)}
          />
        </AdminSection>

        <AdminSection title={t('onboarding.security.section')} icon={<span className="section-header-icon section-header-icon--outlined" aria-hidden="true"><KeyIcon /></span>}>
          <StaticSetting
            title={t('onboarding.security.pin')}
            description={t('admin.security.pinDescription')}
            action={
              <Button
                intent="primary"
                variant="outlined"
                radius="xs"
                label={t('admin.security.changePin')}
                showSecondaryLabel={false}
                showLeftIcon={false}
                showRightIcon={false}
                onClick={openPinDialog}
              />
            }
          />
        </AdminSection>

        <DangerZoneFooter
          onSecondaryAction={requestSystemRestart}
          onPrimaryAction={requestSystemClose}
        />
      </main>

      {saveAlert && (
        <div ref={saveAlertShellRef} className="admin-panel-page__save-alert-region">
          <Alert
            className="admin-panel-page__save-alert"
            intent={saveAlert.intent}
            title={saveAlert.title}
            description={saveAlert.description}
            isVisible
            onClose={dismissSaveAlert}
          />
        </div>
      )}

      <Footer context="Admin" onAccessibility={() => setIsAccessibilityOpen(true)} onExit={leaveAdminPanel} />
      <AccessibilityOverlay open={isAccessibilityOpen} orientation={orientation} onClose={() => setIsAccessibilityOpen(false)} />
      <OverlaySurface
        open={languageAccessOpen}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={closeLanguageAccess}
      >
        <KeyboardDialog
          variant="numeric"
          size="md"
          title={t('admin.dialog.restrictedAccess')}
          description={t('admin.dialog.languageAccessDescription')}
          inputPlaceholder={t('admin.dialog.pinPlaceholder')}
          value={languageAccessPin}
          maxLength={6}
          maskValue
          inputState={languageAccessPinInvalid ? 'Invalid' : languageAccessPin ? 'Filled' : 'Default'}
          supportingText={languageAccessPinInvalid ? t('admin.dialog.invalidPin') : undefined}
          secondaryActionLabel={t('checkout.cancel')}
          primaryActionLabel={t('admin.dialog.authenticate')}
          primaryDisabled={languageAccessPin.length < 4}
          onChange={(value) => {
            setLanguageAccessPin(value);
            setLanguageAccessPinInvalid(false);
          }}
          onSecondaryAction={closeLanguageAccess}
          onPrimaryAction={authenticateLanguageAccess}
        />
      </OverlaySurface>
      <OverlaySurface
        open={locationAccessOpen}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={closeLocationAccess}
      >
        <KeyboardDialog
          variant="numeric"
          size="md"
          title={t('admin.dialog.restrictedAccess')}
          description={t('admin.dialog.locationAccessDescription')}
          inputPlaceholder={t('admin.dialog.pinPlaceholder')}
          value={locationMasterPin}
          maxLength={6}
          maskValue
          inputState={locationMasterPinInvalid ? 'Invalid' : locationMasterPin ? 'Filled' : 'Default'}
          supportingText={locationMasterPinInvalid ? t('admin.dialog.invalidPin') : undefined}
          secondaryActionLabel={t('checkout.cancel')}
          primaryActionLabel={t('admin.dialog.authenticate')}
          primaryDisabled={locationMasterPin.length < 4}
          busy={locationMasterPinBusy}
          busyPrimaryActionLabel={t('admin.dialog.authenticating')}
          onChange={(value) => {
            setLocationMasterPin(value);
            setLocationMasterPinInvalid(false);
          }}
          onSecondaryAction={closeLocationAccess}
          onPrimaryAction={() => void authenticateLocationAccess()}
        />
      </OverlaySurface>
      <OverlaySurface
        open={pinDialogStep !== 'closed'}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={closePinDialog}
      >
        <KeyboardDialog
          variant="numeric"
          size="md"
          title={t('keyboardDialog.defaultTitle')}
          description={pinDialogStep === 'current'
            ? t('admin.dialog.currentPinDescription')
            : pinDialogStep === 'new'
              ? t('admin.dialog.newPinDescription')
              : t('keyboardDialog.defaultDescription')}
          inputPlaceholder={pinDialogStep === 'current'
            ? t('admin.dialog.currentPin')
            : pinDialogStep === 'new'
              ? t('admin.dialog.newPin')
              : t('keyboardDialog.defaultPlaceholder')}
          value={pinValue}
          maxLength={6}
          maskValue
          inputState={pinInvalid ? 'Invalid' : pinValue ? 'Filled' : 'Default'}
          supportingText={pinInvalid
            ? pinDialogStep === 'confirm'
              ? t('admin.dialog.pinMismatch')
              : t('admin.dialog.invalidPin')
            : undefined}
          secondaryActionLabel={pinDialogStep === 'confirm' ? t('action.back') : t('checkout.cancel')}
          primaryActionLabel={pinDialogStep === 'confirm' ? t('keyboardDialog.changePin') : t('admin.dialog.continue')}
          showTertiaryButton={pinDialogStep === 'confirm'}
          tertiaryActionLabel={t('checkout.cancel')}
          primaryDisabled={pinValue.length < 4}
          onChange={(value) => {
            setPinValue(value);
            setPinInvalid(false);
          }}
          onSecondaryAction={() => {
            if (pinDialogStep !== 'confirm') {
              closePinDialog();
              return;
            }
            setPinDialogStep('new');
            setPinValue(newPin);
            setPinInvalid(false);
          }}
          onPrimaryAction={continuePinChange}
          onTertiaryAction={closePinDialog}
        />
      </OverlaySurface>
      <OverlaySurface
        open={systemDialogOpen}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={closeSystemDialog}
      >
        {systemDialog === 'restart' ? (
          <ActionDialog
            size="md"
            illustration={<AlertIllustration aria-hidden="true" />}
            title={t('admin.dialog.restartTitle')}
            description={t('admin.dialog.restartDescription')}
            secondaryActionLabel={t('checkout.cancel')}
            primaryActionLabel={t('admin.action.restart')}
            onSecondaryAction={closeSystemDialog}
            onPrimaryAction={confirmSystemRestart}
          />
        ) : (
          <KeyboardDialog
            variant="numeric"
            size="md"
            title={t('admin.dialog.osAccessTitle')}
            description={t('admin.dialog.osAccessDescription')}
            inputPlaceholder={t('admin.dialog.pinPlaceholder')}
            value={systemPin}
            maxLength={6}
            maskValue
            inputState={systemPinInvalid ? 'Invalid' : systemPin ? 'Filled' : 'Default'}
            supportingText={systemPinInvalid ? t('admin.dialog.invalidPin') : undefined}
            secondaryActionLabel={t('checkout.cancel')}
            primaryActionLabel={t('admin.dialog.closeApplication')}
            primaryDisabled={systemPin.length < 4}
            onChange={(value) => {
              setSystemPin(value);
              setSystemPinInvalid(false);
            }}
            onSecondaryAction={closeSystemDialog}
            onPrimaryAction={confirmSystemClose}
          />
        )}
      </OverlaySurface>
      <OverlaySurface
        open={organizationSlideOver !== null}
        kind="slideover"
        orientation={orientation}
        onClose={() => setOrganizationSlideOver(null)}
      >
        <OrganizationSelectionSlideOver
          type={organizationSlideOver ?? 'network'}
          selectedTitle={organizationSlideOver === 'complex' ? draftSettings.complex : draftSettings.network}
          networkSelected={Boolean(draftSettings.network)}
          onClose={() => setOrganizationSlideOver(null)}
          onConfirm={(option) => {
            if (organizationSlideOver === 'network') {
              updateDraft('network', option.title);
              updateDraft('complex', '');
            } else {
              updateDraft('complex', option.title);
            }
            setOrganizationSlideOver(null);
          }}
        />
      </OverlaySurface>
      <OverlaySurface
        open={terminalKeyboardOpen}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => setTerminalKeyboardOpen(false)}
      >
        <KeyboardDialog
          variant="alphanumeric"
          size="lg"
          showIntro={false}
          inputPlaceholder={t('onboarding.activation.terminalId')}
          value={terminalKeyboardValue}
          onChange={setTerminalKeyboardValue}
          secondaryActionLabel={t('checkout.cancel')}
          primaryActionLabel={t('concessions.confirm')}
          primaryDisabled={!terminalKeyboardValue.trim()}
          onSecondaryAction={() => setTerminalKeyboardOpen(false)}
          onPrimaryAction={() => {
            updateDraft('terminalId', terminalKeyboardValue.trim());
            setTerminalKeyboardOpen(false);
          }}
        />
      </OverlaySurface>
      <OverlaySurface
        open={pendingCancelSection !== null}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => setPendingCancelSection(null)}
      >
        <ActionDialog
          size="md"
          illustration={<AlertIllustration aria-hidden="true" />}
          title={t('admin.dialog.unsavedTitle')}
          description={t('admin.dialog.discardDescription')}
          secondaryActionLabel={t('admin.dialog.backToEditing')}
          primaryActionLabel={t('admin.dialog.discardAll')}
          onSecondaryAction={() => setPendingCancelSection(null)}
          onPrimaryAction={() => {
            if (pendingCancelSection) cancelEdit(pendingCancelSection);
            setPendingCancelSection(null);
          }}
        />
      </OverlaySurface>
      <OverlaySurface
        open={pendingSaveConfirmation !== null || isPendingLocationRestartPromptOpen}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => undefined}
      >
        {pendingSaveConfirmation === 'location' || isPendingLocationRestartPromptOpen ? (
          <ActionDialog
            size="md"
            illustration={<AlertIllustration aria-hidden="true" />}
            title={t('admin.dialog.restartRequired')}
            description={t('admin.dialog.locationRestartDescription')}
            secondaryActionLabel={t('admin.dialog.restartLater')}
            primaryActionLabel={t('admin.update.restartNow')}
            onSecondaryAction={() => {
              if (isPendingLocationRestartPromptOpen) {
                setIsPendingLocationRestartPromptOpen(false);
              } else {
                void saveLocation(false);
              }
            }}
            onPrimaryAction={() => {
              if (isPendingLocationRestartPromptOpen) {
                startPendingLocationUpdate();
              } else {
                void saveLocation(true);
              }
            }}
          />
        ) : (
          <ActionDialog
            size="md"
            illustration={<AlertIllustration aria-hidden="true" />}
            title={t('admin.dialog.applyScopeTitle')}
            description={t('admin.dialog.applyScopeDescription')}
            secondaryActionLabel={t('admin.dialog.thisDeviceOnly')}
            primaryActionLabel={t('admin.dialog.entireUnit')}
            onSecondaryAction={() => void saveFeatures('device')}
            onPrimaryAction={() => void saveFeatures('unit')}
          />
        )}
      </OverlaySurface>
      <OverlaySurface
        open={featuresAwaitingPrerequisites.length > 0}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => undefined}
      >
        <ActionDialog
          size="md"
          illustration={<PreviousStepNeededIllustration aria-hidden="true" />}
          title={t('admin.dialog.prerequisiteTitle')}
          description={(
            <div className="admin-panel-page__prerequisite-message">
              <p>{t('admin.dialog.prerequisiteDescription')}</p>
              <p><strong>{t('admin.dialog.prerequisiteList')}</strong></p>
              <ul className="admin-panel-page__prerequisite-list">
                {featuresAwaitingPrerequisites.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          primaryActionLabel={t('admin.dialog.closeNotice')}
          showSecondaryButton={false}
          onPrimaryAction={() => setFeaturesAwaitingPrerequisites([])}
        />
      </OverlaySurface>
      <OverlaySurface
        open={communicationErrorRetry !== null}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => undefined}
      >
        <ActionDialog
          size="md"
          illustration={<ServerErrorIllustration aria-hidden="true" />}
          title={t('admin.dialog.communicationFailure')}
          description={t('admin.dialog.communicationFailureDescription')}
          secondaryActionLabel={t('action.back')}
          primaryActionLabel={t('checkout.tryAgain')}
          onSecondaryAction={() => setCommunicationErrorRetry(null)}
          onPrimaryAction={() => {
            const retry = communicationErrorRetry;
            setCommunicationErrorRetry(null);
            void retry?.();
          }}
        />
      </OverlaySurface>
      <OverlaySurface
        open={pendingUnsavedAction !== null}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => setPendingUnsavedAction(null)}
      >
        <ActionDialog
          size="md"
          illustration={<AlertIllustration aria-hidden="true" />}
          title={t('actionDialog.defaultTitle')}
          description={pendingUnsavedAction === 'exit'
            ? t('admin.dialog.saveBeforeExitDescription')
            : pendingUnsavedAction === 'restart'
              ? t('admin.dialog.saveBeforeRestartDescription')
              : t('actionDialog.defaultDescription')}
          secondaryActionLabel={pendingUnsavedAction === 'exit' ? t('admin.dialog.exitWithoutSaving') : t('actionDialog.doNotSave')}
          primaryActionLabel={pendingUnsavedAction === 'exit'
            ? t('admin.dialog.saveAndExit')
            : pendingUnsavedAction === 'restart'
              ? t('admin.dialog.saveAndRestart')
              : t('admin.dialog.saveAndExit')}
          showTertiaryButton
          onSecondaryAction={() => {
            if (pendingUnsavedAction) executePendingAction(pendingUnsavedAction);
          }}
          onPrimaryAction={() => void saveAndExecutePendingAction()}
          onTertiaryAction={() => setPendingUnsavedAction(null)}
        />
      </OverlaySurface>
    </div>
  );
}

AdminPanelPage.displayName = 'AdminPanelPage';
