import React, { useState, useEffect, useRef } from 'react';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  broadcastNotification,
} from '../services/adminService';
import type { SystemNotification } from '../services/adminService';

export const NotificationsPopover: React.FC<{ canBroadcast?: boolean }> = ({ canBroadcast = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Broadcast modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    try {
      await broadcastNotification({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
      });
      await fetchNotifications();
      setShowBroadcastModal(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      alert('Broadcast announcement dispatched successfully.');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to dispatch broadcast.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-2 rounded-full hover:bg-surface-container flex items-center justify-center"
        title="System Notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in text-left">
          {/* Header */}
          <div className="p-3.5 border-b border-outline-variant/60 flex justify-between items-center bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm">
                notifications_active
              </span>
              <h3 className="font-headline-sm text-xs font-bold text-primary">
                System Alerts & Notices
              </h3>
              {unreadCount > 0 && (
                <span className="bg-primary-container text-on-primary-container text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="text-[10px] font-semibold text-secondary hover:underline disabled:opacity-40 disabled:no-underline"
              >
                Mark all read
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/30 text-xs">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-xs italic">
                No notifications logged.
              </div>
            ) : (
              notifications.map((n) => {
                const dateStr = new Date(n.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                    className={`p-3 transition-colors cursor-pointer flex gap-3 items-start ${
                      !n.isRead
                        ? 'bg-secondary-container/10 hover:bg-secondary-container/20'
                        : 'hover:bg-surface-container/50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          !n.isRead ? 'text-secondary font-bold' : 'text-outline'
                        }`}
                      >
                        {!n.isRead ? 'mark_chat_unread' : 'mark_chat_read'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-primary truncate">
                          {n.title}
                        </h4>
                        <span className="font-data-mono text-[9px] text-on-surface-variant shrink-0 ml-1">
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">
                        {n.content}
                      </p>
                      {n.user && (
                        <span className="text-[9px] text-outline mt-1 block truncate">
                          Recipient: {n.user.name} ({n.user.email})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Broadcast action */}
          <div className="p-2.5 border-t border-outline-variant/40 bg-[#F8FAFC] flex justify-between items-center text-xs">
            <button
              disabled={!canBroadcast}
              onClick={() => {
                setIsOpen(false);
                setShowBroadcastModal(true);
              }}
              className="w-full py-1.5 px-3 bg-primary text-on-primary rounded text-xs font-semibold flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-sm">campaign</span>
              Broadcast New Notice
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && canBroadcast && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full max-w-md shadow-2xl animate-scale-in text-left">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">campaign</span>
              Broadcast Global System Notice
            </h3>
            <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Notice Title
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Scheduled System Maintenance"
                  required
                  className="p-2.5 border border-outline-variant rounded bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type the message to be delivered to all user notification inboxes..."
                  required
                  className="p-2.5 border border-outline-variant rounded bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isBroadcasting}
                  onClick={() => {
                    setShowBroadcastModal(false);
                    setBroadcastTitle('');
                    setBroadcastMessage('');
                  }}
                  className="px-4 py-2 border border-outline-variant rounded hover:bg-surface-container text-on-surface-variant font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary/95 font-semibold flex items-center gap-1.5"
                >
                  {isBroadcasting && (
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  )}
                  Send Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
