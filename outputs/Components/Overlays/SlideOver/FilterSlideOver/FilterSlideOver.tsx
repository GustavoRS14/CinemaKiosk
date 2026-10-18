import { useState, type UIEvent } from 'react';

import { FilterChip } from '../../../Common/FilterChip';
import { ModalFooter } from '../../../Common/ModalFooter';
import { ModalHeader } from '../../../Common/ModalHeader';
import { TextButton } from '../../../Common/TextButton';
import { localizeMovieGenre, normalizeMovieLanguage } from '../../../Common/movieLocalization';
import { useI18n, type TranslationKey } from '../../../../i18n';
import './FilterSlideOver.css';

export type FilterOption = {
  id: string;
  label: string;
};

export type FilterGroup = {
  id: string;
  label: string;
  options: FilterOption[];
  layout?: 'grid' | 'stack';
};

export type FilterSelection = FilterOption & {
  groupId: string;
};

export type FilterSlideOverProps = {
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  groups?: FilterGroup[];
  selectedIds?: string[];
  onSelectionChange?: (selections: FilterSelection[]) => void;
  onApply?: (selections: FilterSelection[]) => void;
  onClose?: () => void;
  className?: string;
};

export const DEFAULT_FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'language',
    label: 'Idioma',
    options: [
      { id: 'dubbed', label: 'Dublado' },
      { id: 'subtitled', label: 'Legendado' },
      { id: 'original', label: 'Original' },
    ],
  },
  {
    id: 'experience',
    label: 'Experiência',
    options: [
      { id: '2d', label: '2D' },
      { id: '3d', label: '3D' },
      { id: 'laser', label: 'Laser' },
      { id: 'vip', label: 'VIP' },
      { id: 'blue', label: 'Azul' },
    ],
  },
  {
    id: 'genre',
    label: 'Gênero',
    options: [
      { id: 'action', label: 'Ação' },
      { id: 'horror', label: 'Terror' },
      { id: 'science-fiction', label: 'Fic. Científica' },
      { id: 'animation', label: 'Animação' },
      { id: 'adventure', label: 'Aventura' },
      { id: 'comedy', label: 'Comédia' },
      { id: 'drama', label: 'Drama' },
      { id: 'romance', label: 'Romance' },
      { id: 'thriller', label: 'Suspense' },
      { id: 'documentary', label: 'Documentário' },
    ],
  },
  {
    id: 'time',
    label: 'Horários',
    layout: 'stack',
    options: [
      { id: 'morning', label: 'Manhã (Até 12:00)' },
      { id: 'afternoon', label: 'Tarde (12:00 - 18:00)' },
      { id: 'night', label: 'Noite (Após 18:00)' },
    ],
  },
];

const groupLabelKeys: Record<string, TranslationKey> = {
  language: 'filters.language',
  experience: 'filters.experience',
  genre: 'filters.genre',
  time: 'filters.times',
};

const timeLabelKeys: Record<string, TranslationKey> = {
  morning: 'filters.morning', manhã: 'filters.morning',
  afternoon: 'filters.afternoon', tarde: 'filters.afternoon',
  night: 'filters.night', noite: 'filters.night',
};

export function FilterSlideOver({
  width = 'sm',
  groups = DEFAULT_FILTER_GROUPS,
  selectedIds,
  onSelectionChange,
  onApply,
  onClose,
  className = '',
}: FilterSlideOverProps) {
  const { locale, t } = useI18n();
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const activeIds = selectedIds ?? internalSelectedIds;

  const availableSelections = groups.flatMap((group) =>
    group.options.map((option) => ({ ...option, groupId: group.id })),
  );

  const selections = availableSelections.filter((option) => activeIds.includes(option.id));

  const select = (groupId: string, option: FilterOption) => {
    const isSelected = activeIds.includes(option.id);
    const nextIds = isSelected
      ? activeIds.filter((id) => id !== option.id)
      : [...activeIds, option.id];
    const nextSelections = availableSelections.filter((candidate) => nextIds.includes(candidate.id));

    if (selectedIds === undefined) setInternalSelectedIds(nextIds);
    onSelectionChange?.(nextSelections);
  };

  const clear = () => {
    if (selectedIds === undefined) setInternalSelectedIds([]);
    onSelectionChange?.([]);
  };

  const localizeGroupLabel = (group: FilterGroup) => {
    const key = groupLabelKeys[group.id];
    return key ? t(key) : group.label;
  };

  const localizeOptionLabel = (groupId: string, option: FilterOption) => {
    if (groupId === 'language') return t(normalizeMovieLanguage(option.label));
    if (groupId === 'genre') return localizeMovieGenre(option.label, t);
    if (groupId === 'time') {
      const normalizedId = option.id.trim().toLocaleLowerCase('pt-BR');
      const normalizedLabel = option.label.trim().toLocaleLowerCase('pt-BR').split(' ')[0];
      const key = timeLabelKeys[normalizedId] ?? timeLabelKeys[normalizedLabel];
      return key ? t(key) : option.label;
    }
    if (groupId === 'experience' && option.label.trim().toLocaleLowerCase('pt-BR') === 'azul') {
      return t('filters.blueSession');
    }
    return option.label;
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setIsScrolled(event.currentTarget.scrollTop > 0);
  };

  return (
    <aside className={`filter-slide-over ${isScrolled ? 'filter-slide-over--scrolled' : ''} ${className}`.trim()} data-width={width} aria-label={t('filters.title')}>
      <ModalHeader text={t('filters.title')} onClose={onClose} className="filter-slide-over__header" />

      <div className="filter-slide-over__content" onScroll={handleScroll}>
        <div className="filter-slide-over__top-action">
          <TextButton
            label={t('filters.clear')}
            intent="Primary"
            size="sm"
            weight="Medium"
            disabled={selections.length === 0}
            onClick={clear}
          />
        </div>

        <div className="filter-slide-over__groups">
          {groups.map((group) => (
            <section className="filter-slide-over__group" key={group.id} aria-labelledby={`filter-group-${group.id}`}>
              <h2 id={`filter-group-${group.id}`}>{localizeGroupLabel(group)}</h2>
              <div className={`filter-slide-over__chips filter-slide-over__chips--${group.layout ?? (group.id === 'language' && locale !== 'pt-BR' ? 'stack' : 'grid')}`}>
                {group.options.map((option) => (
                  <FilterChip
                    key={option.id}
                    className="filter-slide-over__chip"
                    text={localizeOptionLabel(group.id, option)}
                    selected={activeIds.includes(option.id)}
                    onClick={() => select(group.id, option)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <ModalFooter
        className="filter-slide-over__footer"
        showTotalPrice={false}
        primaryLabel={t('filters.apply')}
        primaryDisabled={selections.length === 0}
        onPrimaryAction={() => onApply?.(selections)}
      />
    </aside>
  );
}
