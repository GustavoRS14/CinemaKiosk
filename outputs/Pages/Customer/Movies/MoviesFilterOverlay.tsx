import { useEffect, useState } from 'react';
import { FilterSlideOver, type FilterGroup, type FilterSelection } from '@components/Overlays/SlideOver/FilterSlideOver/FilterSlideOver';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import type { PageOrientation } from '../../useOrientation';

type MoviesFilterOverlayProps = {
  open: boolean;
  orientation: PageOrientation;
  groups: FilterGroup[];
  activeFilters: readonly string[];
  onApply: (filters: string[]) => void;
  onClose: () => void;
};

export function MoviesFilterOverlay({
  open,
  orientation,
  groups,
  activeFilters,
  onApply,
  onClose,
}: MoviesFilterOverlayProps) {
  const [draftIds, setDraftIds] = useState<string[]>([...activeFilters]);

  useEffect(() => {
    if (open) setDraftIds([...activeFilters]);
  }, [activeFilters, open]);

  const updateDraft = (selections: FilterSelection[]) => {
    setDraftIds(selections.map((selection) => selection.id));
  };

  return (
    <OverlaySurface open={open} kind="slideover" orientation={orientation} onClose={onClose}>
      <FilterSlideOver
        groups={groups}
        selectedIds={draftIds}
        onSelectionChange={updateDraft}
        onApply={(selections) => {
          onApply(selections.map((selection) => selection.id));
          onClose();
        }}
        onClose={onClose}
      />
    </OverlaySurface>
  );
}
