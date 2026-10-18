import { useMemo, useRef, useState, type UIEvent } from 'react';

import NoResultIllustration from '@illustrations/NoResult.svg';
import SearchIcon from '@icons/search.svg';

import { Input } from '../../../Common/Input';
import { ModalFooter } from '../../../Common/ModalFooter';
import { ModalHeader } from '../../../Common/ModalHeader';
import { SelectionCard } from '../../../Common/SelectionCard';
import { TextButton } from '../../../Common/TextButton';
import { KeyboardDialog } from '../../KeyboardDialog';
import { OverlaySurface } from '../../OverlaySurface';
import { useOrientation } from '../../../../Pages/useOrientation';
import { useI18n, type TranslationKey } from '../../../../i18n';
import './OrganizationSelectionSlideOver.css';

export type OrganizationSelectionType = 'network' | 'complex';

export type OrganizationSelectionOption = {
  id: string;
  title: string;
  supportingText?: string;
};

export type OrganizationSelectionSlideOverProps = {
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type?: OrganizationSelectionType;
  options?: OrganizationSelectionOption[];
  selectedId?: string;
  selectedTitle?: string;
  networkSelected?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSelect?: (option: OrganizationSelectionOption) => void;
  onConfirm?: (option: OrganizationSelectionOption) => void;
  onClose?: () => void;
  className?: string;
};

const NETWORKS: OrganizationSelectionOption[] = [
  { id: 'arcoplex', title: 'Arcoplex Cinemas' },
  { id: 'cine-araujo', title: 'Cine Araújo' },
  { id: 'cinemais', title: 'Cinemais' },
  { id: 'cinesercla', title: 'Cinesercla Cinemas' },
  { id: 'cine-show', title: 'Cine Show' },
  { id: 'circuito', title: 'Circuito Cinemas' },
  { id: 'cineflix', title: 'Cineflix' },
  { id: 'kinoplex', title: 'Kinoplex' },
  { id: 'multicine', title: 'Multicine' },
];

const COMPLEXES: OrganizationSelectionOption[] = [
  { id: 'big-shopping', title: 'BIG Shopping', supportingText: 'Contagem/MG' },
  { id: 'gv-shopping', title: 'GV Shopping', supportingText: 'Governador Valadres/MG' },
  { id: 'palmas-shopping', title: 'Palmas Shopping', supportingText: 'Palmas/TO' },
  { id: 'shopping-avenida-28', title: 'Shopping Avenida 28', supportingText: 'Rio de Janeiro/RJ' },
  { id: 'shopping-montserrat', title: 'Shopping Montserrat', supportingText: 'Serra/ES' },
  { id: 'shopping-norte', title: 'Shopping Norte', supportingText: 'Belo Horizonte/MG' },
  { id: 'shopping-osasco-plaza', title: 'Shopping Osasco Plaza', supportingText: 'Osasco/SP' },
  { id: 'shopping-praia-sul', title: 'Shopping Praia Sul', supportingText: 'Aracaju/SE' },
  { id: 'shopping-premio', title: 'Shopping Prêmio', supportingText: 'Nossa Senhora do Socorro/SE' },
];

const ALPHABETICAL_COLLATOR = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  numeric: true,
});

const COPY = {
  network: { title: 'organization.network', placeholder: 'organization.searchNetwork' },
  complex: { title: 'organization.complex', placeholder: 'organization.searchComplex' },
} satisfies Record<OrganizationSelectionType, { title: TranslationKey; placeholder: TranslationKey }>;

export function OrganizationSelectionSlideOver({
  width = 'sm',
  type = 'network',
  options,
  selectedId,
  selectedTitle,
  networkSelected = type === 'network',
  searchValue,
  onSearchChange,
  onSelect,
  onConfirm,
  onClose,
  className = '',
}: OrganizationSelectionSlideOverProps) {
  const { t } = useI18n();
  const [internalSearch, setInternalSearch] = useState('');
  const [internalSelectedId, setInternalSelectedId] = useState(selectedId);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');
  const orientation = useOrientation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const query = searchValue ?? internalSearch;
  const isAvailable = type === 'network' || networkSelected;
  const sourceOptions = useMemo(
    () => [...(options ?? (type === 'network' ? NETWORKS : COMPLEXES))]
      .sort((left, right) => ALPHABETICAL_COLLATOR.compare(left.title, right.title)),
    [options, type],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    if (!normalizedQuery) return sourceOptions;
    return sourceOptions.filter(({ title, supportingText = '' }) =>
      `${title} ${supportingText}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery),
    );
  }, [query, sourceOptions]);

  const activeId = internalSelectedId
    ?? selectedId
    ?? sourceOptions.find((option) => option.title === selectedTitle)?.id;
  const selectedOption = sourceOptions.find((option) => option.id === activeId);

  const updateSearch = (value: string) => {
    if (searchValue === undefined) setInternalSearch(value);
    onSearchChange?.(value);
  };

  const handleSelect = (option: OrganizationSelectionOption) => {
    if (!isAvailable) return;
    setInternalSelectedId(option.id);
    onSelect?.(option);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setIsScrolled(event.currentTarget.scrollTop > 0);
  };

  const openSearchDialog = () => {
    setSearchDraft(query);
    setSearchDialogOpen(true);
  };

  return (
    <>
    <aside
      className={`organization-selection-slide-over ${isScrolled ? 'organization-selection-slide-over--scrolled' : ''} ${className}`.trim()}
      data-width={width}
      aria-label={t(COPY[type].title)}
    >
      <ModalHeader text={t(COPY[type].title)} onClose={onClose} className="organization-selection-slide-over__header" />

      <div ref={scrollRef} className="organization-selection-slide-over__content" onScroll={handleScroll}>
        <Input
          aria-label={t(COPY[type].placeholder)}
          placeholder={t(COPY[type].placeholder)}
          value={query}
          state="Filled"
          onChange={() => undefined}
          controlRole="button"
          controlTabIndex={0}
          onControlClick={openSearchDialog}
          onControlKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') openSearchDialog();
          }}
          showIconLeft
          iconLeft={<SearchIcon aria-hidden="true" />}
          disabled={!isAvailable}
        />

        {filteredOptions.length > 0 ? (
          <div className="organization-selection-slide-over__options" role="radiogroup" aria-label={t(COPY[type].title)}>
            {filteredOptions.map((option) => (
              <SelectionCard
                key={option.id}
                className="organization-selection-slide-over__option"
                selected={activeId === option.id}
                state={isAvailable ? 'Default' : 'Disabled'}
                textSize="sm"
                textWeight="Medium"
                title={option.title}
                supportingText={option.supportingText ?? ''}
                onClick={() => handleSelect(option)}
              />
            ))}
          </div>
        ) : (
          <div className="organization-selection-slide-over__empty" role="status">
            <NoResultIllustration className="organization-selection-slide-over__empty-illustration" aria-hidden="true" />
            <div className="organization-selection-slide-over__empty-copy">
              <h2>{t('movies.emptyTitle')}</h2>
              <p>{t('organization.noMatches')}</p>
            </div>
            <TextButton label={t('organization.clearSearch')} intent="Primary" size="sm" weight="Medium" onClick={() => updateSearch('')} />
          </div>
        )}
      </div>

      <ModalFooter
        className="organization-selection-slide-over__footer"
        showTotalPrice={false}
        primaryLabel={t('organization.confirmSelection')}
        primaryDisabled={!isAvailable || !selectedOption}
        onPrimaryAction={() => selectedOption && onConfirm?.(selectedOption)}
      />
    </aside>
    <OverlaySurface
      open={searchDialogOpen}
      kind="modal"
      orientation={orientation}
      closeOnBackdrop={false}
      portal
      onClose={() => setSearchDialogOpen(false)}
    >
      <KeyboardDialog
        variant="alphanumeric"
        size="lg"
        showIntro={false}
        inputPlaceholder={t(COPY[type].placeholder)}
        value={searchDraft}
        onChange={setSearchDraft}
        secondaryActionLabel={t('checkout.cancel')}
        primaryActionLabel={t('organization.search')}
        primaryDisabled={!searchDraft.trim()}
        onSecondaryAction={() => setSearchDialogOpen(false)}
        onPrimaryAction={() => {
          updateSearch(searchDraft);
          setSearchDialogOpen(false);
        }}
      />
    </OverlaySurface>
    </>
  );
}
