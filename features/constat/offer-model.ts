export const offerIds=['free','per-report','personal','fleet'] as const;
export type Offer=typeof offerIds[number];
