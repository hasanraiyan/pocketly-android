import { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { api } from '../api/client';

const PocketlyContext = createContext(null);

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getWeekEnd(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

const initialState = {
  accounts: [],
  categories: [],
  budgets: [],
  transactions: [],
  stats: {
    totalAccountBalance: 0,
    totalTransactionCount: 0,
    accountCount: 0,
    categoryCount: 0,
  },
  analysis: null,
  isLoading: false,
  isBootstrapLoading: true,
  isSyncing: false,
  error: null,
  periodStart: getWeekStart(),
  periodEnd: getWeekEnd(),
  periodType: 'week',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } };
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.payload };
    case 'SET_BOOTSTRAP_LOADING':
      return { ...state, isBootstrapLoading: action.payload };
    case 'SET_PERIOD':
      return {
        ...state,
        periodStart: action.payload.start,
        periodEnd: action.payload.end,
        periodType: action.payload.type || state.periodType,
      };
    default:
      return state;
  }
}

export function PocketlyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const currentPeriodRef = useRef({ start: initialState.periodStart, end: initialState.periodEnd });

  const fetchBootstrap = useCallback(async (startDate, endDate) => {
    dispatch({ type: 'SET_BOOTSTRAP_LOADING', payload: true });
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const data = await api(`/api/money/bootstrap?${params}`);
      dispatch({ type: 'SET_ACCOUNTS', payload: data.accounts || [] });
      dispatch({ type: 'SET_CATEGORIES', payload: data.categories || [] });
      dispatch({ type: 'SET_BUDGETS', payload: data.budgets || [] });
      dispatch({ type: 'SET_TRANSACTIONS', payload: data.transactions || [] });
      dispatch({ type: 'SET_STATS', payload: data.stats || {} });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_BOOTSTRAP_LOADING', payload: false });
    }
  }, []);

  const fetchTransactions = useCallback(async (startDate, endDate) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const data = await api(`/api/money/transactions?${params}`);
      dispatch({ type: 'SET_TRANSACTIONS', payload: data.transactions || [] });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await api('/api/money/accounts');
      dispatch({ type: 'SET_ACCOUNTS', payload: data.accounts || [] });
      dispatch({ type: 'SET_STATS', payload: { totalAccountBalance: data.totalAccountBalance || 0 } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const fetchAnalysis = useCallback(async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const data = await api(`/api/money/analysis?${params}`);
      dispatch({ type: 'SET_ANALYSIS', payload: data.analysis });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const setPeriod = useCallback(
    (start, end, type) => {
      currentPeriodRef.current = { start, end };
      dispatch({ type: 'SET_PERIOD', payload: { start, end, type } });
      fetchTransactions(start, end);
    },
    [fetchTransactions]
  );

  const navigatePeriod = useCallback(
    (direction) => {
      const { periodStart, periodEnd, periodType } = state;
      const startMs = new Date(periodStart).getTime();
      const endMs = new Date(periodEnd).getTime();
      const spanMs = endMs - startMs;
      const sign = direction === 'next' ? 1 : -1;
      const newStart = new Date(startMs + sign * (spanMs + 1));
      const newEnd = new Date(endMs + sign * (spanMs + 1));
      setPeriod(newStart.toISOString(), newEnd.toISOString(), periodType);
    },
    [state, setPeriod]
  );

  // Transactions CRUD
  const createTransaction = useCallback(async (body) => {
    const data = await api('/api/money/transactions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    await fetchBootstrap(currentPeriodRef.current.start, currentPeriodRef.current.end);
    return data.transaction;
  }, [fetchBootstrap]);

  const updateTransaction = useCallback(async (id, body) => {
    const data = await api(`/api/money/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    await fetchBootstrap(currentPeriodRef.current.start, currentPeriodRef.current.end);
    return data.transaction;
  }, [fetchBootstrap]);

  const deleteTransaction = useCallback(async (id) => {
    await api(`/api/money/transactions/${id}`, { method: 'DELETE' });
    dispatch({ type: 'SET_TRANSACTIONS', payload: state.transactions.filter((t) => t.id !== id) });
  }, [state.transactions]);

  // Accounts CRUD
  const createAccount = useCallback(async (body) => {
    const data = await api('/api/money/accounts', { method: 'POST', body: JSON.stringify(body) });
    await fetchAccounts();
    return data.account;
  }, [fetchAccounts]);

  const updateAccount = useCallback(async (id, body) => {
    const data = await api(`/api/money/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    await fetchAccounts();
    return data.account;
  }, [fetchAccounts]);

  const deleteAccount = useCallback(async (id) => {
    await api(`/api/money/accounts/${id}`, { method: 'DELETE' });
    await fetchAccounts();
  }, [fetchAccounts]);

  // Categories CRUD
  const createCategory = useCallback(async (body) => {
    const data = await api('/api/money/categories', { method: 'POST', body: JSON.stringify(body) });
    const catData = await api('/api/money/categories');
    dispatch({ type: 'SET_CATEGORIES', payload: catData.categories || [] });
    return data.category;
  }, []);

  const updateCategory = useCallback(async (id, body) => {
    const data = await api(`/api/money/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    const catData = await api('/api/money/categories');
    dispatch({ type: 'SET_CATEGORIES', payload: catData.categories || [] });
    return data.category;
  }, []);

  const deleteCategory = useCallback(async (id) => {
    await api(`/api/money/categories/${id}`, { method: 'DELETE' });
    const catData = await api('/api/money/categories');
    dispatch({ type: 'SET_CATEGORIES', payload: catData.categories || [] });
  }, []);

  // Budgets CRUD
  const createBudget = useCallback(async (body) => {
    const data = await api('/api/money/budgets', { method: 'POST', body: JSON.stringify(body) });
    const budgData = await api('/api/money/budgets');
    dispatch({ type: 'SET_BUDGETS', payload: budgData.budgets || [] });
    return data.budget;
  }, []);

  const updateBudget = useCallback(async (id, body) => {
    const data = await api(`/api/money/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    const budgData = await api('/api/money/budgets');
    dispatch({ type: 'SET_BUDGETS', payload: budgData.budgets || [] });
    return data.budget;
  }, []);

  const deleteBudget = useCallback(async (id) => {
    await api(`/api/money/budgets/${id}`, { method: 'DELETE' });
    dispatch({ type: 'SET_BUDGETS', payload: state.budgets.filter((b) => b.id !== id) });
  }, [state.budgets]);

  return (
    <PocketlyContext.Provider
      value={{
        ...state,
        fetchBootstrap,
        fetchTransactions,
        fetchAccounts,
        fetchAnalysis,
        setPeriod,
        navigatePeriod,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        createAccount,
        updateAccount,
        deleteAccount,
        createCategory,
        updateCategory,
        deleteCategory,
        createBudget,
        updateBudget,
        deleteBudget,
      }}
    >
      {children}
    </PocketlyContext.Provider>
  );
}

export function usePocketly() {
  const ctx = useContext(PocketlyContext);
  if (!ctx) throw new Error('usePocketly must be used within PocketlyProvider');
  return ctx;
}