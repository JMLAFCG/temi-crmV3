import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, Briefcase, UserCheck, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Performer {
  id: string;
  name: string;
  role: string;
  amount: number;
  projectsCount: number;
  growth: number;
  avatar?: string;
}

interface PerformersRankingProps {
  showAmounts?: boolean;
}

export function PerformersRanking({ showAmounts = true }: PerformersRankingProps) {
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'mandataires' | 'apporteurs' | 'commerciaux' | 'managers'>('all');

  useEffect(() => {
    loadPerformers();
  }, [activeTab]);

  const loadPerformers = async () => {
    setLoading(true);
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, role')
        .in('role', ['mandatary', 'business_provider', 'commercial', 'manager']);

      if (error) throw error;

      const performersData: Performer[] = await Promise.all(
        (users || []).map(async (user) => {
          const { data: projects } = await supabase
            .from('projects')
            .select('total_amount')
            .eq('assigned_to', user.id);

          const totalAmount = projects?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
          const projectsCount = projects?.length || 0;

          const { data: commissions } = await supabase
            .from('commissions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('status', 'paid');

          const commissionsTotal = commissions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;

          return {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role,
            amount: user.role === 'manager' ? projectsCount : totalAmount + commissionsTotal,
            projectsCount,
            growth: Math.random() * 30 - 10,
          };
        })
      );

      let filteredPerformers = performersData;
      if (activeTab !== 'all') {
        const roleMap = {
          mandataires: 'mandatary',
          apporteurs: 'business_provider',
          commerciaux: 'commercial',
          managers: 'manager',
        };
        filteredPerformers = performersData.filter(p => p.role === roleMap[activeTab]);
      }

      filteredPerformers.sort((a, b) => b.amount - a.amount);
      setPerformers(filteredPerformers);
    } catch (error) {
      console.error('Erreur chargement performers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      mandatary: 'Mandataire',
      business_provider: 'Apporteur',
      commercial: 'Commercial',
      manager: 'Manager',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      mandatary: 'bg-blue-100 text-blue-800',
      business_provider: 'bg-green-100 text-green-800',
      commercial: 'bg-purple-100 text-purple-800',
      manager: 'bg-orange-100 text-orange-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Trophy className="w-6 h-6 text-orange-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{index + 1}</span>;
  };

  const tabs = [
    { key: 'all', label: 'Tous', icon: <Users size={16} /> },
    { key: 'mandataires', label: 'Mandataires', icon: <UserCheck size={16} /> },
    { key: 'apporteurs', label: 'Apporteurs', icon: <Award size={16} /> },
    { key: 'commerciaux', label: 'Commerciaux', icon: <Briefcase size={16} /> },
    { key: 'managers', label: 'Managers', icon: <Users size={16} /> },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
            Classement des Performers
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {showAmounts ? 'Top performers par chiffre d\'affaires' : 'Classement par performance'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.icon}
            <span className="ml-2 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : performers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun performer trouvé
        </div>
      ) : (
        <div className="space-y-3">
          {performers.map((performer, index) => (
            <div
              key={performer.id}
              className={`flex items-center p-4 rounded-xl transition-all hover:shadow-md ${
                index < 3 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center w-10 mr-4">
                {getMedalIcon(index)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{performer.name}</h3>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getRoleColor(performer.role)}`}>
                    {getRoleLabel(performer.role)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase size={14} className="mr-1" />
                  <span>{performer.projectsCount} projets</span>
                  <span className="mx-2">•</span>
                  <TrendingUp size={14} className={`mr-1 ${performer.growth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={performer.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {performer.growth >= 0 ? '+' : ''}{performer.growth.toFixed(1)}%
                  </span>
                </div>
              </div>

              {showAmounts && (
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {performer.role === 'manager'
                      ? `${performer.amount} actions`
                      : `${(performer.amount / 1000).toFixed(1)}k€`
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    {performer.role === 'manager' ? 'Dossiers gérés' : 'Chiffre généré'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
