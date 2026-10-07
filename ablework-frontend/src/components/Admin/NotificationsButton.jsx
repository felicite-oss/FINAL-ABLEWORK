import { useState } from 'react';

export default function NotificationsButton({ pendingCount }) {
  const [showPanel, setShowPanel] = useState(false);

  const items = [
    {
      id: 1,
      type: 'pending',
      title: 'Pending Review',
      message: 'New documents are waiting for your verification.',
      time: 'Just now',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-[#f59e0b]/15',
      color: 'text-[#b45309]',
      border: 'border-[#f59e0b]/40'
    },
    {
      id: 2,
      type: 'approved',
      title: 'Account Approved',
      message: 'A new employer account has been approved.',
      time: '12 min ago',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      bg: 'bg-[#10b981]/15',
      color: 'text-[#047857]',
      border: 'border-[#10b981]/40'
    },
    {
      id: 3,
      type: 'rejected',
      title: 'Account Rejected',
      message: 'A submitted PWD ID was rejected. Cooldown applied.',
      time: '1 hr ago',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      bg: 'bg-[#dc2626]/15',
      color: 'text-[#b91c1c]',
      border: 'border-[#dc2626]/40'
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update',
      message: 'Annual analytics data has been refreshed successfully.',
      time: 'Today',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      bg: 'bg-[#2C7FFF]/15',
      color: 'text-[#2C7FFF]',
      border: 'border-[#2C7FFF]/40'
    }
  ];

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-card,#ffffff)] text-[var(--color-text,#03045E)] border-2 border-[var(--color-border,rgba(3,4,94,0.2))] shadow-sm transition-all duration-200 shrink-0 cursor-pointer"
        title="Notifications"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#dc2626] text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
            {pendingCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className="relative w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-white border-2 border-[#2C7FFF] max-h-[90vh] flex flex-col">
            <div className="h-2 w-full bg-[#2C7FFF] shrink-0" />

            <div className="relative px-6 sm:px-8 pt-6 pb-4 flex flex-col items-center text-center shrink-0">
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-transparent border-4 border-[#2C7FFF]">
                  <svg className="w-8 h-8 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                {pendingCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#dc2626] text-white border-2 border-white">
                    {pendingCount}
                  </div>
                )}
              </div>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border-2 text-[#2C7FFF] bg-transparent border-[#2C7FFF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Inbox
              </span>

              <h2 className="text-2xl font-black tracking-tight mb-1 text-[#03045E]">
                Notifications
              </h2>
              <p className="text-xs font-bold leading-relaxed max-w-xs text-[#03045E]/80">
                Stay updated with activity across your admin workspace.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-5 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-[#f59e0b]/10 border-2 border-[#f59e0b]/30 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-lg bg-[#f59e0b] text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#03045E]/60 mt-2">Pending</span>
                  <span className="text-lg font-black text-[#b45309]">{pendingCount}</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#10b981]/10 border-2 border-[#10b981]/30 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-lg bg-[#10b981] text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#03045E]/60 mt-2">Approved</span>
                  <span className="text-lg font-black text-[#047857]">24</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#dc2626]/10 border-2 border-[#dc2626]/30 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-lg bg-[#dc2626] text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#03045E]/60 mt-2">Rejected</span>
                  <span className="text-lg font-black text-[#b91c1c]">3</span>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-[var(--color-border,rgba(3,4,94,0.15))] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#f4f4f4] border-b-2 border-[var(--color-border,rgba(3,4,94,0.1))] flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#03045E]">Recent Activity</h3>
                  <span className="text-[10px] font-black text-[#2C7FFF]">{items.length} new</span>
                </div>

                <div className="divide-y-2 divide-[var(--color-border,rgba(3,4,94,0.08))]">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-4 py-3 bg-white">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 ${item.bg} ${item.color} ${item.border}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-black text-[#03045E] truncate">{item.title}</p>
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#03045E]/50 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] font-bold text-[#03045E]/70 leading-relaxed mt-0.5">{item.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-row gap-3 mt-1">
                <button
                  onClick={() => setShowPanel(false)}
                  className="flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 text-[#03045E] border-[#03045E]"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowPanel(false)}
                  className="flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 text-[#03045E] border-[#03045E]"
                >
                  Mark All Read
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}