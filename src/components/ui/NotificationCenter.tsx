import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck, Clock, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'error':
        return <AlertTriangle className="text-red-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getNotificationBg = (type: string, isRead: boolean) => {
    const opacity = isRead ? '50' : '100';
    switch (type) {
      case 'success':
        return `bg-green-${opacity} border-green-200`;
      case 'warning':
        return `bg-yellow-${opacity} border-yellow-200`;
      case 'error':
        return `bg-red-${opacity} border-red-200`;
      default:
        return `bg-blue-${opacity} border-blue-200`;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm text-primary-600 relative shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 transform hover:scale-105"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-warning-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<CheckCheck size={14} />}
                      onClick={markAllAsRead}
                    >
                      Tout marquer lu
                    </Button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-primary-25' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                            {notification.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
                <Button variant="outline" size="sm" fullWidth>
                  Voir toutes les notifications
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};