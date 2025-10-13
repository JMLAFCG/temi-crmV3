import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';

interface AgentSelectorProps {
  value?: string;
  onChange: (agentId: string) => void;
  error?: string;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({ value, onChange, error }) => {
  const [agents, setAgents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, role')
        .in('role', ['commercial', 'mandatary'])
        .order('last_name', { ascending: true });

      if (error) throw error;
      setAgents(data as User[]);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(
    agent =>
      `${agent.first_name} ${agent.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Commercial / Mandataire</label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Rechercher un commercial..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-60 overflow-y-auto">
        {filteredAgents.map(agent => (
          <label
            key={agent.id}
            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
              value === agent.id ? 'bg-primary-50' : ''
            }`}
          >
            <input
              type="radio"
              name="agent"
              value={agent.id}
              checked={value === agent.id}
              onChange={() => onChange(agent.id)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {agent.first_name} {agent.last_name}
              </p>
              <p className="text-sm text-gray-500">
                {agent.role === 'commercial' ? 'Commercial' : 'Mandataire'}
              </p>
            </div>
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
