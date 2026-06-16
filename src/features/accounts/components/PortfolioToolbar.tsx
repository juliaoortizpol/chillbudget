import React from 'react';
import { ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PortfolioToolbar() {
  return (
    <div className="p-6 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100">
      <h2 className="text-lg font-bold text-slate-900">Account Portfolio</h2>
      
      <div className="flex items-center gap-3">
        {/* Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button className="px-4 py-1.5 text-sm font-semibold rounded-md bg-white text-[#0f766e] shadow-sm">
            All Accounts
          </button>
          <button className="px-4 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:text-slate-700">
            Institutions
          </button>
        </div>
        
        {/* Filter Button */}
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100">
          <ListFilter className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
