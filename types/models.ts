export type Account = {
  id: string;
  name: string;
  balanceBottles?: number;
  createdAt?: Date | null;
};

export type Delivery = {
  id: string;
  accountId: string;
  quantity: number;
  onCredit: boolean;
  date: Date | null;
};

export type Payment = {
  id: string;
  accountId: string;
  quantity: number;
  date: Date | null;
};

export type OutstandingAccount = Account & {
  computedBalanceBottles: number;
};

export type RecentActivityItem = {
  id: string;
  label: string;
  qty: number;
  date: Date | null;
  kind: 'delivery-credit' | 'delivery-cash' | 'payment';
};
