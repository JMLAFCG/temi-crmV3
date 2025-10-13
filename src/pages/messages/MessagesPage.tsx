import React, { useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  projectTitle?: string;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in a real app, this would come from an API
  const conversations: Conversation[] = [
    {
      id: '1',
      participantName: 'Martin Dupont',
      lastMessage: 'Merci pour le devis, nous allons l\'étudier',
      timestamp: '2025-01-15T10:30:00Z',
      unreadCount: 2,
      projectTitle: 'Rénovation Cuisine Moderne',
    },
    {
      id: '2',
      participantName: 'Sophie Martin',
      lastMessage: 'Quand pouvons-nous commencer les travaux ?',
      timestamp: '2025-01-15T09:15:00Z',
      unreadCount: 0,
      projectTitle: 'Extension Maison',
    },
    {
      id: '3',
      participantName: 'Entreprises Leroy',
      lastMessage: 'Le planning est confirmé pour la semaine prochaine',
      timestamp: '2025-01-14T16:45:00Z',
      unreadCount: 1,
      projectTitle: 'Nouvel Immeuble de Bureaux',
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      content: 'Bonjour, j\'ai bien reçu votre devis pour la rénovation de ma cuisine.',
      senderId: 'client-1',
      senderName: 'Martin Dupont',
      timestamp: '2025-01-15T09:00:00Z',
      isRead: true,
    },
    {
      id: '2',
      content: 'Parfait ! Avez-vous des questions sur les matériaux proposés ?',
      senderId: user?.id || 'agent-1',
      senderName: user?.first_name + ' ' + user?.last_name || 'Agent',
      timestamp: '2025-01-15T09:15:00Z',
      isRead: true,
    },
    {
      id: '3',
      content: 'Merci pour le devis, nous allons l\'étudier et vous recontacter rapidement.',
      senderId: 'client-1',
      senderName: 'Martin Dupont',
      timestamp: '2025-01-15T10:30:00Z',
      isRead: false,
    },
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message via API
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <div data-testid="messages-page" className="h-full flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conversation => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation === conversation.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-gray-900">{conversation.participantName}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {new Date(conversation.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
              {conversation.projectTitle && (
                <p className="text-xs text-blue-600 mb-1">{conversation.projectTitle}</p>
              )}
              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Message View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-gray-900">
                  {conversations.find(c => c.id === selectedConversation)?.participantName}
                </h2>
                <p className="text-sm text-gray-600">
                  {conversations.find(c => c.id === selectedConversation)?.projectTitle}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" leftIcon={<Phone size={16} />}>
                  Appeler
                </Button>
                <Button variant="outline" size="sm" leftIcon={<Video size={16} />}>
                  Visio
                </Button>
                <Button variant="outline" size="sm" leftIcon={<MoreVertical size={16} />}>
                  Plus
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tapez votre message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  variant="primary"
                  leftIcon={<Send size={16} />}
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  Envoyer
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
              <p className="text-gray-600">
                Choisissez une conversation dans la liste pour commencer à échanger
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
