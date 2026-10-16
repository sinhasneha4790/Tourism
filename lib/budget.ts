import {
  FOOD_PER_PERSON_PER_DAY,
  LIMITS,
  PEAK_MONTHS,
  PEAK_MULTIPLIER,
  PERMIT_FEE_PER_PERSON,
  RIDE_RATES,
  SAFARI_PER_PERSON,
  STAY_RATES,
  type RideType,
  type StayType,
} from '@/content/rates';

export interface BudgetInput {
  days: number;
  travellers: number;
  /** Defaults to ceil(travellers / 2) (twin share). */
  rooms?: number;
  stay: StayType;
  ride: RideType;
  safari: boolean;
  permits: boolean;
  /** 1–12; peak months apply PEAK_MULTIPLIER to stays and transport. */
  startMonth?: number;
}

export interface BudgetLine {
  id: 'stay' | 'transport' | 'food' | 'extras';
  label: string;
  amount: number;
}

export interface Breakdown {
  days: number;
  nights: number;
  travellers: number;
  rooms: number;
  peak: boolean;
  lines: BudgetLine[];
  total: number;
  perPerson: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v)));

export function defaultRooms(travellers: number): number {
  return Math.ceil(travellers / 2);
}

export function isPeakMonth(month: number | undefined): boolean {
  return month !== undefined && PEAK_MONTHS.includes(month);
}

export function calculateBudget(input: BudgetInput): Breakdown {
  const days = clamp(input.days, LIMITS.days.min, LIMITS.days.max);
  const travellers = clamp(input.travellers, LIMITS.travellers.min, LIMITS.travellers.max);
  const rooms = clamp(input.rooms ?? defaultRooms(travellers), LIMITS.rooms.min, Math.max(LIMITS.rooms.min, travellers));
  const nights = days - 1;
  const peak = isPeakMonth(input.startMonth);
  const mult = peak ? PEAK_MULTIPLIER : 1;

  const ride = RIDE_RATES[input.ride];
  const stay = Math.round(nights * STAY_RATES[input.stay].perRoomNight * rooms * mult);
  const transport = Math.round(days * ride.perDay * (ride.perPerson ? travellers : 1) * mult);
  const food = days * travellers * FOOD_PER_PERSON_PER_DAY;
  const extras = (input.safari ? SAFARI_PER_PERSON * travellers : 0) + (input.permits ? PERMIT_FEE_PER_PERSON * travellers : 0);

  const roomWord = rooms === 1 ? 'room' : 'rooms';
  const lines: BudgetLine[] = [
    {
      id: 'stay',
      label: `Stays (${nights} nights, ${rooms} ${roomWord})`,
      amount: stay,
    },
    {
      id: 'transport',
      label: `Transport (${ride.label})`,
      amount: transport,
    },
    {
      id: 'food',
      label: `Food (₹${FOOD_PER_PERSON_PER_DAY} pp / day)`,
      amount: food,
    },
    { id: 'extras', label: 'Safari & permits', amount: extras },
  ];
  const total = stay + transport + food + extras;

  return {
    days,
    nights,
    travellers,
    rooms,
    peak,
    lines,
    total,
    perPerson: Math.round(total / travellers),
  };
}
