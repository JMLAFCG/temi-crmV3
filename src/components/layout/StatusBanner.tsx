// src/components/layout/StatusBanner.tsx
import React, { useState, useEffect } from 'react';
import { platformStatusMonitor, StatusInfo } from '../../lib/platformStatus';

export const StatusBanner: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusInfo, setStatusInfo] = useState<StatusInfo>(platformStatusMonitor.getStatusInfo());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    const unsubscribe = platformStatusMonitor.subscribe((info) => setStatusInfo(info));
    return () => { clearInterval(t); unsubscribe(); };
  }, []);

  const format = (d: Date) =>
    d.toLocaleString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

  return (
    <div className="bg-black text-white text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-gray-400 capitalize">{format(currentTime)}</span>
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-gray-300">Plateforme interne du</span>
          <img src="/GROUPE AFCG White logo.png" alt="Groupe AFCG" className="h-5 object-contain" />
          <span className="text-gray-300">— Les courtiers à vos côtés !</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Statut :</span>
          <span className="flex items-center space-x-1">
            <span>{statusInfo.indicator}</span>
            <span className="text-white font-medium">{statusInfo.label}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
