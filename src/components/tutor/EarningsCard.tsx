import { Wallet, TrendingUp } from 'lucide-react';

interface EarningsCardProps {
  balance: number;
  totalEarned: number;
}

export function EarningsCard({ balance, totalEarned }: EarningsCardProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Wallet className="w-4 h-4" />
          <span className="text-sm">Saldo Saat Ini</span>
        </div>
        <div className="text-2xl font-bold">Rp {balance.toLocaleString()}</div>
      </div>
      
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Total Penghasilan</span>
        </div>
        <div className="text-2xl font-bold">Rp {totalEarned.toLocaleString()}</div>
      </div>
    </div>
  );
}
