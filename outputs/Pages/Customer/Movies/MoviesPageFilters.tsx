import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import TrashIcon from '@icons/trash.svg';
import SettingsIcon from '@icons/settings.svg';
import NoResultIllustration from '@illustrations/NoResult.svg';
import { FilterTag } from '@components/Common/FilterTag';
import { Input } from '@components/Common/Input';
import { Tab } from '@components/Common/TabNavigation/Tab';
import { TextButton } from '@components/Common/TextButton';
import { useI18n } from '../../../i18n';
import './MoviesPageFilters.css';

const icon = (Icon: ComponentType) => <Icon />;

type MoviesPageFiltersProps = {
  activeFilters: readonly string[];
  selectedTab: 0 | 1 | 2;
  showPreSale: boolean;
  filterDisabled?: boolean;
  onRemoveFilter: (filter: string) => void;
  onOpenFilters?: () => void;
};

const tabs = [
  { labelKey: 'movies.today', path: '/movies' },
  { labelKey: 'movies.anotherDay', path: '/movies/another-day' },
  { labelKey: 'movies.preSale', path: '/movies/pre-sale' },
] as const;

export function MoviesPageFilters({
  activeFilters,
  selectedTab,
  showPreSale,
  filterDisabled = false,
  onRemoveFilter,
  onOpenFilters,
}: MoviesPageFiltersProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const visibleTabs = showPreSale ? tabs : tabs.slice(0, 2);

  return (
    <div className="movies-filters">
      <div className="movies-filters__toolbar">
        <div className="movies-filters__tabs" role="tablist" aria-label={t('movies.periodAria')}>
          {visibleTabs.map((tab, index) => (
            <Tab
              key={tab.labelKey}
              text={t(tab.labelKey)}
              selected={selectedTab === index}
              onClick={() => navigate(tab.path)}
            />
          ))}
        </div>
        <Input
          className={`movies-filters__button${filterDisabled ? ' movies-filters__button--disabled' : ''}`}
          value={t('action.filters')}
          state={filterDisabled ? 'Disabled' : 'Filled'}
          showIconLeft
          iconLeft={icon(SettingsIcon)}
          showBadge={activeFilters.length > 0}
          badgeText={String(activeFilters.length)}
          border="md"
          controlRole="button"
          controlTabIndex={filterDisabled ? -1 : 0}
          aria-label={t('movies.openFiltersAria')}
          tabIndex={-1}
          onControlClick={() => {
            if (!filterDisabled) onOpenFilters?.();
          }}
          onControlKeyDown={(event) => {
            if (!filterDisabled && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              onOpenFilters?.();
            }
          }}
        />
      </div>

      {activeFilters.length > 0 && (
        <div className="movies-filters__active" aria-label={t('movies.activeFiltersAria')}>
          <span>{t('movies.activeFilters')}</span>
          <div className="movies-filters__tags">
            {activeFilters.map((filter) => (
              <FilterTag key={filter} label={filter} onClose={() => onRemoveFilter(filter)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type MoviesEmptyStateProps = {
  onClearFilters: () => void;
};

export function MoviesEmptyState({ onClearFilters }: MoviesEmptyStateProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <section className="movies-empty-state" aria-live="polite" aria-labelledby="movies-empty-state-title">
      <NoResultIllustration
        className="movies-empty-state__illustration"
        aria-hidden="true"
        focusable="false"
      />
      <div className="movies-empty-state__body">
        <div className="movies-empty-state__text">
          <h2 id="movies-empty-state-title">{t('movies.emptyTitle')}</h2>
          <p>{t('movies.emptyDescription')}</p>
        </div>
        <div className="movies-empty-state__actions">
          <TextButton
            intent="Danger"
            size="sm"
            weight="SemiBold"
            label={t('action.clearFilters')}
            rightIcon={icon(TrashIcon)}
            onClick={onClearFilters}
          />
          <TextButton
            intent="Information"
            size="sm"
            weight="SemiBold"
            label={t('action.changeFilters')}
            rightIcon={icon(SettingsIcon)}
            onClick={() => navigate('/movies/filters')}
          />
        </div>
      </div>
    </section>
  );
}
