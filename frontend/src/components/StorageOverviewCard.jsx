import React from 'react';

function StorageOverviewCard() {
  const rows = [
    {
      name: 'HttpOnly Cookie',
      colorClass: 'bg-module-cookie shadow-blue-500/40',
      textColor: 'text-blue-400',
      useCase: 'Auth tokens, Session IDs',
      capacity: '~4 KB',
      expiry: 'Server defined (Max-Age)',
      scope: 'shared',
      io: 'async',
      security: 'high'
    },
    {
      name: 'LocalStorage',
      colorClass: 'bg-module-local shadow-red-500/40',
      textColor: 'text-red-400',
      useCase: 'User preferences, UI state persistence',
      capacity: '~5 - 10 MB',
      expiry: 'Permanent (Until manually cleared)',
      scope: 'shared',
      io: 'sync',
      security: 'low'
    },
    {
      name: 'SessionStorage',
      colorClass: 'bg-module-session shadow-orange-500/40',
      textColor: 'text-orange-400',
      useCase: 'Temporary draft forms, single-tab states',
      capacity: '~5 MB',
      expiry: 'Tab Session (Cleared on tab close)',
      scope: 'isolated',
      io: 'sync',
      security: 'low'
    },
    {
      name: 'IndexedDB',
      colorClass: 'bg-module-indexed shadow-green-500/40',
      textColor: 'text-green-400',
      useCase: 'Structured query data, offline databases',
      capacity: 'Quota-based (GBs)',
      expiry: 'Permanent (Until manually cleared)',
      scope: 'shared',
      io: 'async',
      security: 'low'
    },
    {
      name: 'Cache Storage',
      colorClass: 'bg-module-cache shadow-cyan-500/40',
      textColor: 'text-cyan-400',
      useCase: 'Static network assets (PWA offline resources)',
      capacity: 'Quota-based (GBs)',
      expiry: 'Permanent (Service Worker managed)',
      scope: 'shared',
      io: 'async',
      security: 'low'
    }
  ];

  return (
    <div className="glass-panel p-6 border-t-4 border-slate-700 relative overflow-hidden transition-all duration-300">
      
      {/* Decorative top border gradient using multi-color strip */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-blue-500 via-red-500 via-orange-500 via-green-500 to-cyan-500" />

      {/* Header title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <span>Browser Storage Matrix Overview</span>
        </h2>
        <span className="text-xs bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
          CHEAT SHEET
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-5 leading-relaxed">
        Use this quick reference comparison matrix to understand the scope, performance profiles, 
        and security characteristics of each web storage mechanism before executing simulator queries.
      </p>

      {/* Responsive Table */}
      <div className="overflow-x-auto border border-white/5 rounded-xl bg-slate-950/65">
        <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/60 font-semibold text-gray-400 select-none">
              <th className="p-3">Storage Type</th>
              <th className="p-3">Primary Use Case</th>
              <th className="p-3">Max Capacity</th>
              <th className="p-3">Scope</th>
              <th className="p-3">I/O Blocking</th>
              <th className="p-3">Security (XSS)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition duration-150">
                
                {/* Storage name cell with color code indicator */}
                <td className="p-3 font-sans font-bold flex items-center space-x-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${row.colorClass} shadow-md`} />
                  <span className={row.textColor}>{row.name}</span>
                </td>

                <td className="p-3 font-sans opacity-95 leading-normal max-w-[150px]">{row.useCase}</td>
                <td className="p-3 font-semibold text-gray-300">{row.capacity}</td>

                {/* Scope badges */}
                <td className="p-3">
                  {row.scope === 'isolated' ? (
                    <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                      Tab Isolated
                    </span>
                  ) : (
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                      Shared Context
                    </span>
                  )}
                </td>

                {/* Blocking badges */}
                <td className="p-3">
                  {row.io === 'sync' ? (
                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                      Sync (Blocks V8)
                    </span>
                  ) : (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                      Async (Worker)
                    </span>
                  )}
                </td>

                {/* Security badges */}
                <td className="p-3">
                  {row.security === 'high' ? (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                      🔒 High
                    </span>
                  ) : (
                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                      ⚠️ Low
                    </span>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StorageOverviewCard;
