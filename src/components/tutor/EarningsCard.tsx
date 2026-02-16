import { Wallet, TrendingUp, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EarningsCardProps {
  balance: number;
  totalEarned: number;
}

export function EarningsCard({ balance, totalEarned }: EarningsCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Current Balance */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-emerald-100">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Saldo Saat Ini</span>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold">
            Rp {balance.toLocaleString('id-ID')}
          </div>
          <p className="text-sm text-emerald-100 mt-1">
            Siap ditarik ke rekening Anda
          </p>
        </div>
      </div>

      {/* Total Earned */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-sm font-medium">Total Penghasilan</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold text-slate-900">
            Rp {totalEarned.toLocaleString('id-ID')}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Akumulasi dari semua sesi
          </p>
        </div>
      </div>
    </div>
  );
}
