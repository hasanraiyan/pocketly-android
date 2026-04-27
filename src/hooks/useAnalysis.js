import { usePocketly } from '../context/PocketlyContext';

export function useAnalysis() {
  const {
    analysis,
    fetchAnalysis,
    isLoading,
    error,
  } = usePocketly();

  return {
    analysis,
    isLoading,
    error,
    fetchAnalysis,
  };
}