/**
 * Indicative rates for the trip budget planner, in INR.
 * PLACEHOLDERS from the design mock-up — the owner must confirm before launch.
 */
export const RATES_LAST_REVIEWED = '2026-10-15';

export type StayType = 'homestay' | 'hotel' | 'heritage';
export type RideType = 'suv' | 'sedan' | 'shared';

export const STAY_RATES: Record<StayType, { label: string; perRoomNight: number }> = {
  homestay: { label: 'Homestay', perRoomNight: 2200 },
  hotel: { label: '3-star / eco-resort', perRoomNight: 4500 },
  heritage: { label: 'Heritage bungalow', perRoomNight: 8500 },
};

export const RIDE_RATES: Record<RideType, { label: string; note: string; perDay: number; perPerson: boolean }> = {
  suv: {
    label: 'Private SUV',
    note: 'Best for hills',
    perDay: 3500,
    perPerson: false,
  },
  sedan: {
    label: 'Private sedan',
    note: 'Plains',
    perDay: 2500,
    perPerson: false,
  },
  shared: {
    label: 'Shared Sumo / bus',
    note: 'Budget',
    perDay: 900,
    perPerson: true,
  },
};

export const FOOD_PER_PERSON_PER_DAY = 800;
export const SAFARI_PER_PERSON = 2200;
export const PERMIT_FEE_PER_PERSON = 300;

/** Applied to stays and transport when the trip starts in a peak month. */
export const PEAK_MULTIPLIER = 1.15;
/** Months (1–12): October–November festival weeks and December. */
export const PEAK_MONTHS = [10, 11, 12];

export const LIMITS = {
  days: { min: 3, max: 15 },
  travellers: { min: 1, max: 10 },
  rooms: { min: 1, max: 10 },
};
