import { usePocketly } from '../context/PocketlyContext';

export function useAccounts() {
  const {
    accounts,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    isLoading,
    error,
  } = usePocketly();

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}