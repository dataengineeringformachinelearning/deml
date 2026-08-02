export type DemlTone =
  | 'accent'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'muted';

export interface DemlChartSeries {
  name: string;
  data: number[];
  tone?: DemlTone;
}

export interface DemlDonutSegment {
  label: string;
  value: number;
  tone?: DemlTone;
}

export type UptimeHistoryStatus = 'up' | 'partial' | 'down' | 'no_data';

export type UptimeHistoryDataPoint = {
  date: string;
  status: UptimeHistoryStatus;
  uptime?: number;
};
