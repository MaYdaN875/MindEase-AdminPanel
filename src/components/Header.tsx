import React from 'react';
import { NotificationsPopover } from './NotificationsPopover';
import { canAccess } from '../services/permissions';
interface HeaderProps {
  onMenuClick: () => void;
  currentView: string;
  name: string;
  roles: string[];
  onLogout: () => void;
}
export const Header: React.FC<HeaderProps> = ({ onMenuClick, currentView, name, roles, onLogout }) => (
  <header className="h-16 flex items-center justify-between px-4 border-b bg-surface-container-lowest">
    <div className="flex items-center gap-3">
      <button className="md:hidden" onClick={onMenuClick} aria-label="Abrir menú">☰</button>
      <span className="font-semibold">{currentView}</span>
    </div>
    <div className="flex items-center gap-4">
      <NotificationsPopover canBroadcast={canAccess(roles, 'broadcast')} />
      <div><span>{name}</span><p className="text-xs">{roles.join(' · ')}</p></div>
      <button onClick={onLogout} className="border rounded px-3 py-1">Cerrar sesión</button>
    </div>
  </header>
);
