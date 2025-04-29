export interface AmberPrice {
  id: number;
  channelType: string;
  createdAt: string; // ISO 8601 date string
  duration: number;
  endTime: string; // ISO 8601 date string
  forecast: boolean;
  perKwh: number;
  spotPerKwh: number;
  startTime: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}
