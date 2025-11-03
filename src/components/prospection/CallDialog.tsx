import React, { useState } from 'react';
import { Phone, X, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import type { Prospect } from '../../store/prospectStore';

interface CallDialogProps {
  prospect: Prospect;
  onClose: () => void;
  onSaved: () => void;
}

export const CallDialog: React.FC<CallDialogProps> = ({ prospect, onClose, onSaved }) => {
  const [outcome, setOutcome] = useState<string>('answered');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [updateStatus, setUpdateStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>(prospect.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!notes.trim()) {
      alert('Veuillez ajouter des notes sur l\'appel');
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
          activity_type: 'call',
          subject: `Appel ${outcome === 'answered' ? 'abouti' : 'non abouti'}`,
          content: notes,
          outcome,
          next_action: nextAction || null,
          next_action_date: nextActionDate || null,
        },
      ]);

      const updateData: any = {
        last_contact_date: new Date().toISOString(),
      };

      if (nextActionDate) {
        updateData.next_action_date = nextActionDate;
      }

      if (updateStatus && newStatus !== prospect.status) {
        updateData.status = newStatus;
      }

      await supabase.from('prospects').update(updateData).eq('id', prospect.id);

      alert('Appel enregistré avec succès !');
      onSaved();
    } catch (error) {
      console.error('Erreur enregistrement appel:', error);
      alert('Erreur lors de l\'enregistrement de l\'appel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Appel avec {prospect.contact_first_name} {prospect.contact_last_name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Contact */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center text-sm text-gray-600">
              <Phone size={16} className="mr-2" />
              {prospect.phone || 'Téléphone non renseigné'}
            </div>
            {prospect.company_name && (
              <p className="text-sm text-gray-600 mt-1">{prospect.company_name}</p>
            )}
          </div>

          {/* Résultat de l'appel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Résultat de l'appel
            </label>
            <select
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="answered">Répondu</option>
              <option value="no_answer">Pas de réponse</option>
              <option value="voicemail">Message vocal</option>
              <option value="busy">Occupé</option>
              <option value="wrong_number">Mauvais numéro</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes de l'appel *
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Résumé de la conversation, besoins identifiés, objections..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Prochaine action */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prochaine action
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={e => setNextAction(e.target.value)}
              placeholder="Ex: Envoyer devis, Rappeler dans 2 semaines..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Date prochaine action */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="inline mr-1" />
              Date de la prochaine action
            </label>
            <input
              type="datetime-local"
              value={nextActionDate}
              onChange={e => setNextActionDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Mise à jour du statut */}
          <div className="border-t pt-4">
            <label className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                checked={updateStatus}
                onChange={e => setUpdateStatus(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Mettre à jour le statut du prospect
              </span>
            </label>

            {updateStatus && (
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="new">Nouveau</option>
                <option value="contacted">Contacté</option>
                <option value="qualified">Qualifié</option>
                <option value="lost">Perdu</option>
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="primary"
              leftIcon={<Phone size={16} />}
              onClick={handleSave}
              disabled={loading || !notes.trim()}
            >
              Enregistrer l'appel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
