import React, { useState, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import type { Prospect } from '../../store/prospectStore';

interface EmailDialogProps {
  prospect: Prospect;
  onClose: () => void;
  onSent: () => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export const EmailDialog: React.FC<EmailDialogProps> = ({ prospect, onClose, onSent }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);

    if (template) {
      setSubject(replaceVariables(template.subject));
      setBody(replaceVariables(template.body));
    }
  };

  const replaceVariables = (text: string): string => {
    const vars: Record<string, string> = {
      contact_first_name: prospect.contact_first_name || '',
      contact_last_name: prospect.contact_last_name || '',
      company_name: prospect.company_name || '',
      industry: prospect.industry || '',
      sender_name: '', // À récupérer depuis l'utilisateur connecté
      sender_phone: '',
      sender_email: '',
    };

    let result = text;
    Object.entries(vars).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return result;
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      alert('Veuillez remplir le sujet et le contenu de l\'email');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase.from('prospection_activities').insert([
        {
          prospect_id: prospect.id,
          user_id: user.id,
          activity_type: 'email',
          subject,
          content: body,
          outcome: 'sent',
        },
      ]);

      await supabase
        .from('prospects')
        .update({
          last_contact_date: new Date().toISOString(),
          status: 'contacted',
        })
        .eq('id', prospect.id);

      alert('Email enregistré avec succès !');
      onSent();
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('Erreur lors de l\'enregistrement de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Envoyer un email à {prospect.contact_first_name} {prospect.contact_last_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Sélection du modèle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modèle d'email
            </label>
            <select
              value={selectedTemplate}
              onChange={e => handleTemplateSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">-- Sélectionner un modèle --</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destinataire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destinataire
            </label>
            <input
              type="text"
              value={prospect.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          {/* Sujet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Sujet de l'email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Corps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Contenu de l'email..."
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="primary"
              leftIcon={<Send size={16} />}
              onClick={handleSend}
              disabled={loading || !subject.trim() || !body.trim()}
            >
              Enregistrer l'envoi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
