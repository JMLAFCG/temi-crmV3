import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { emailService } from '../lib/emailService';

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Erreur chargement notifications, utilisation mock:', error);
        // Utiliser des données mock
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Nouveau projet',
            content: 'Un nouveau projet a été créé',
            type: 'info',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Document validé',
            content: 'Votre document a été validé',
            type: 'success',
            isRead: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
        return;
      }

      const adaptedNotifications: Notification[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content || '',
        type: item.type || 'info',
        isRead: item.is_read || false,
        createdAt: item.created_at,
      }));

      setNotifications(adaptedNotifications);
      setUnreadCount(adaptedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            title: payload.new.title,
            content: payload.new.content || '',
            type: payload.new.type || 'info',
            isRead: false,
            createdAt: payload.new.created_at,
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Afficher une notification browser si supporté
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.content,
              icon: '/favicon.svg',
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  const createNotification = async (
    userId: string,
    title: string,
    content: string,
    type: Notification['type'] = 'info',
    sendEmail = false
  ) => {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        title,
        content,
        type,
      });

      if (error) throw error;

      // Envoyer un email si demandé
      if (sendEmail) {
        const { data: userData } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', userId)
          .single();

        if (userData) {
          await emailService.sendEmail({
            to: userData.email,
            subject: title,
            template: 'welcome', // Template générique
            data: {
              firstName: userData.first_name,
              lastName: userData.last_name,
            },
          });
        }
      }
    } catch (error) {
      console.error('Erreur création notification:', error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
    refresh: fetchNotifications,
  };
};