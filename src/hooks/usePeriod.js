import { usePocketly } from '../context/PocketlyContext';

export function usePeriod() {
  const {
    periodStart,
    periodEnd,
    periodType,
    setPeriod,
    navigatePeriod,
  } = usePocketly();

  return {
    periodStart,
    periodEnd,
    periodType,
    setPeriod,
    navigatePeriod,
  };
}