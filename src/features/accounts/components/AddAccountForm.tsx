import { Landmark, CreditCard, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstitutionSelector } from './InstitutionSelector';
import {
  formatAccountType,
  useInstitutionSelector,
} from '../hooks/useInstitutionSelector';

interface AddAccountFormProps {
  onCancel: () => void;
  onSave: () => void;
}

export function AddAccountForm({ onCancel, onSave }: AddAccountFormProps) {
  const {
    search,
    updateSearch,
    selectedInstitution,
    isOpen,
    open,
    close,
    filteredInstitutions,
    isLoading,
    error,
    retry,
    selectInstitution,
    accountType,
    selectAccountType,
    availableAccountTypes,
  } = useInstitutionSelector();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
      
      {/* Left Column - Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 flex-1 flex flex-col gap-6">
          
          <div className="flex items-center gap-2 text-[#0f766e] pb-2">
            <Landmark className="w-6 h-6" />
            <h2 className="text-xl font-bold tracking-tight">Account Details</h2>
          </div>

          <div className="flex flex-col gap-4">
            <InstitutionSelector
              search={search}
              onSearchChange={updateSearch}
              selectedInstitution={selectedInstitution}
              isOpen={isOpen}
              onOpen={open}
              onClose={close}
              institutions={filteredInstitutions}
              isLoading={isLoading}
              error={error}
              onRetry={() => retry()}
              onSelect={selectInstitution}
            />

            {/* Account Nickname */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 tracking-wider uppercase">Account Nickname</label>
              <input 
                type="text" 
                placeholder="e.g. Rainy Day Fund" 
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-md px-4 text-sm outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all text-slate-900"
              />
            </div>

            {/* Type & Balance Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 tracking-wider uppercase">Account Type</label>
                <select
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-md px-4 text-sm outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22currentColor%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-no-repeat pr-8"
                  value={accountType}
                  onChange={(event) => selectAccountType(event.target.value)}
                >
                  {availableAccountTypes.map((type) => (
                    <option key={type} value={type}>{formatAccountType(type)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 tracking-wider uppercase">Initial Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input 
                    type="text" 
                    placeholder="0.00" 
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-md pl-7 pr-4 text-sm outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Last 4 Digits */}
            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-xs font-bold text-slate-600 tracking-wider uppercase">Last 4 Digits</label>
              <div className="relative">
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="e.g. 1234" 
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-md px-4 text-sm outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all text-slate-900"
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Required for Card accounts to help identify transactions.</p>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="p-6 md:p-8 pt-4 flex justify-end items-center gap-4 border-t border-slate-50 mt-auto">
          <Button variant="ghost" onClick={onCancel} className="text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 px-6 h-11">
            Cancel
          </Button>
          <Button onClick={onSave} className="bg-[#0f766e] hover:bg-[#0d645e] text-white font-bold h-11 px-6 rounded-lg shadow-sm">
            Save Account
          </Button>
        </div>
      </div>

      {/* Right Column - Integrations / Info */}
      <div className="flex flex-col gap-6">
        
        {/* Gmail Card */}
        <div className="bg-[#0f766e] rounded-xl p-8 text-white shadow-sm flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold leading-tight">Automate with Gmail</h3>
          <p className="text-[#a7f3d0] text-sm leading-relaxed mb-4">
            Securely link your Gmail to automatically track digital receipts and recurring subscriptions.
          </p>
          <Button className="w-full bg-white text-[#0f766e] hover:bg-slate-50 font-bold h-12 rounded-lg shadow-sm">
            Link Gmail Account
          </Button>
        </div>

        {/* Security Info Card */}
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
            <Lock className="w-3.5 h-3.5" />
            <span>Bank-grade 256-bit AES encryption</span>
          </div>
          <p className="text-[11px] text-slate-400">
            By connecting, you agree to our <a href="#" className="underline hover:text-slate-600">Terms of Service</a>
          </p>
        </div>

      </div>

    </div>
  );
}
