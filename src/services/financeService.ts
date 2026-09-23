import api from './api';

export type FinanceResource = 'payments' | 'refunds' | 'payouts';
export interface FinanceFilters { currency: string; status?: string; search?: string; from?: string; to?: string }
export interface FinanceRow {
  id: string; amount: string; currency: string; status: string;
  psychologist: { id: string; user: { id: string; name: string } };
  patient?: { id: string; name: string }; appointmentId?: string;
  platformFee?: string; netAmount?: string; createdAt?: string; requestedAt?: string;
  refundedAt?: string; refundAttempts?: number; bankName?: string; accountClabe?: string;
  appointment?: { status: string; startAt: string; endAt: string };
  transactionId?: string; refundId?: string;
  attempts?: { id: string; provider: string; status: string; createdAt: string }[];
}
export interface FinanceSummary {
  currency: string; provider: string; asOf: string; completedGross: string; earnedFees: string;
  availableBalance: string; heldBalance: string; reviewBalance: string; pendingPayoutBalance: string;
  totalWithdrawn: string; refundedAmount: string; pendingRefundAmount: string; partialRefundCount: number;
  paymentsByStatus: { status: string; count: number; amount: string }[];
}
export interface FinancePage { items: FinanceRow[]; total: number; page: number; hasMore: boolean }
export const getFinanceSummary = async (currency: string, signal?: AbortSignal): Promise<FinanceSummary> =>
  (await api.get('/admin/finance/summary', { params: { currency }, signal })).data.data;
export const getFinanceList = async (resource: FinanceResource, filters: FinanceFilters, page: number, signal?: AbortSignal): Promise<FinancePage> =>
  (await api.get(`/admin/finance/${resource}`, { params: { ...filters, page, limit: 20 }, signal })).data.data;
export const getFinancePayment = async (id: string, signal?: AbortSignal): Promise<FinanceRow> =>
  (await api.get(`/admin/finance/payments/${encodeURIComponent(id)}`, { signal })).data.data;
