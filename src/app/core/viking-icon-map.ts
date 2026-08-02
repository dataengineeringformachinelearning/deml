export type DemlIconName = string;

const MATERIAL_ICON_MAP: Record<string, DemlIconName> = {
  dashboard: 'layout-dashboard',
  settings: 'settings',
  search: 'search',
  logout: 'log-out',
  login: 'log-in',
};

export const mapMaterialIcon = (materialName: string): DemlIconName =>
  MATERIAL_ICON_MAP[materialName] ?? materialName;
