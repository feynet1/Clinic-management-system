import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getQueueTickets } from '../services/dataService';
import { soundService } from '../services/soundService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Tv, 
  Volume2, 
  Maximize2, 
  Users, 
  Clock, 
  CheckCircle 
} from 'lucide-react';
import type { QueueTicket } from '../types';

export const QueueMonitorPage: React.FC = () => {
  const { t } = useApp();
  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [lastCalledId, setLastCalledId] = useState<string | null>(null);

  const loadQueue = async () => {
    const list = await getQueueTickets();
    setQueue(list);

    const active = list.find((item: QueueTicket) => item.status === 'in_consultation');
    if (active && active.id !== lastCalledId) {
      setLastCalledId(active.id);
      soundService.playCallChime();
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 4000);

    // Setup Supabase Realtime channel if configured
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('realtime_queue')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'queue_tickets' },
          () => {
            loadQueue();
          }
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }

    return () => clearInterval(interval);
  }, [lastCalledId]);

  const nowCalling = queue.find((item) => item.status === 'in_consultation');
  const upcomingQueue = queue.filter(
    (item) => item.status === 'registered' || item.status === 'triaged' || item.status === 'waiting_doctor'
  );
  const recentlyCalled = queue.filter((item) => item.status === 'completed' || item.status === 'pending_payment');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* TV Screen Control Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">{t.queue.waitingRoomMonitor}</h1>
            <p className="text-xs text-slate-400">Public Reception & Waiting Area TV Display</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => soundService.playCallChime()}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 cursor-pointer transition-colors"
          >
            <Volume2 className="w-4 h-4 text-sky-400" />
            <span>Chime Sound Test</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Fullscreen TV Mode</span>
          </button>
        </div>
      </div>

      {/* Hero: "NOW CALLING" Display */}
      <div className="bg-gradient-to-br from-brand-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-brand-500/20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {nowCalling ? (
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>{t.queue.nowCalling}</span>
            </div>

            <div>
              <span className="text-7xl sm:text-9xl font-black tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 drop-shadow-md block">
                {nowCalling.ticketNumber}
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-brand-300 mt-2">
                {nowCalling.patientName}
              </p>
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/15">
              <div className="text-left px-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 block">{t.queue.room}</span>
                <span className="text-xl sm:text-2xl font-black text-white">{nowCalling.roomNumber || 'Consultation Room 201'}</span>
              </div>
              <div className="h-8 w-px bg-white/20 hidden sm:block" />
              <div className="text-left px-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 block">{t.queue.doctor}</span>
                <span className="text-lg font-bold text-slate-200">{nowCalling.doctorName || 'Dr. Henok Bekele'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 space-y-3 relative z-10">
            <Clock className="w-16 h-16 text-brand-400/50 mx-auto animate-pulse" />
            <h2 className="text-3xl font-bold text-slate-200">Doctor Preparing Next Consultation</h2>
            <p className="text-sm text-slate-400">Please watch the screen for your ticket number.</p>
          </div>
        )}
      </div>

      {/* Two-Column Queue Status Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next in Line */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Upcoming in Waiting Queue</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700">
              {upcomingQueue.length} Waiting
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {upcomingQueue.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No patients currently waiting.</p>
            ) : (
              upcomingQueue.map((tkt, idx) => (
                <div
                  key={tkt.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm text-slate-500 w-6">#{idx + 1}</span>
                    <span className="font-mono font-black text-base text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                      {tkt.ticketNumber}
                    </span>
                    <div>
                      <span className="font-semibold text-xs text-slate-800 block">{tkt.patientName}</span>
                      <span className="text-[10px] text-slate-400">{tkt.department}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                    {tkt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Called */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">{t.queue.recentlyCalled}</h3>
            </div>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {recentlyCalled.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No calls recorded yet.</p>
            ) : (
              recentlyCalled.map((tkt) => (
                <div
                  key={tkt.id}
                  className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {tkt.ticketNumber}
                    </span>
                    <span className="font-medium text-slate-700">{tkt.patientName}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {tkt.calledAt ? new Date(tkt.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Done'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
