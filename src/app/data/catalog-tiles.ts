import type { DashTile } from './dashboard';

/** Build three equal KPI tiles for lighter catalog surfaces. */
export function catalogStatTiles(
  items: readonly { readonly id: string; readonly label: string; readonly value: string }[],
): readonly DashTile[] {
  return items.map((item, index) => ({
    kind: 'stat' as const,
    id: item.id,
    size: 'sm' as const,
    accent: (['primary', 'gold', 'red'] as const)[index % 3],
    label: item.label,
    value: item.value,
  }));
}
