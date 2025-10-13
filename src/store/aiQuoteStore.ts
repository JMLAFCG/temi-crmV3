import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { PropositionGlobale, PropositionLot, DevisAnalysis } from '../types';

interface AIQuoteState {
  propositions: PropositionGlobale[];
  analyses: DevisAnalysis[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchPropositions: (projetId?: string) => Promise<void>;
  fetchAnalyses: (projetId: string) => Promise<void>;
  processQuoteWithAI: (documentId: string, projetId: string) => Promise<void>;
  validateProposition: (propositionId: string, comments?: string) => Promise<void>;
  requestModification: (propositionId: string, requests: any[]) => Promise<void>;
  signProposition: (propositionId: string, signatureData: string) => Promise<void>;
}

export const useAIQuoteStore = create<AIQuoteState>((set, get) => ({
  propositions: [],
  analyses: [],
  loading: false,
  error: null,

  fetchPropositions: async (projetId?: string) => {
    set({ loading: true, error: null });
    try {
      // Utiliser des données mock pour éviter les erreurs de relations
      const mockPropositions: PropositionGlobale[] = [];

      if (projetId) {
        // Ajouter une proposition mock pour le projet
        mockPropositions.push({
          id: `prop-${projetId}`,
          projet_id: projetId,
          status: 'en_attente',
          total_amount: 45000,
          total_margin: 5400,
          ai_confidence: 0.92,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          lots: [
            {
              id: `lot-1-${projetId}`,
              proposition_id: `prop-${projetId}`,
              lot_name: 'Gros œuvre',
              description: 'Fondations, murs porteurs, charpente',
              estimated_amount: 25000,
              selected_company_id: 'company-1',
              ai_reasoning: 'Meilleur rapport qualité-prix pour ce type de travaux',
              created_at: new Date().toISOString(),
            },
            {
              id: `lot-2-${projetId}`,
              proposition_id: `prop-${projetId}`,
              lot_name: 'Second œuvre',
              description: 'Plomberie, électricité, isolation',
              estimated_amount: 20000,
              selected_company_id: 'company-2',
              ai_reasoning: 'Expertise reconnue en installations techniques',
              created_at: new Date().toISOString(),
            },
          ],
        });
      }

      set({ propositions: mockPropositions, error: null });
    } catch (error) {
      console.error('Erreur récupération propositions:', error);
      set({ error: 'Erreur lors de la récupération des propositions' });
    } finally {
      set({ loading: false });
    }
  },

  fetchAnalyses: async (projetId: string) => {
    set({ loading: true, error: null });
    try {
      // Utiliser des données mock pour les analyses
      const mockAnalyses: DevisAnalysis[] = [
        {
          id: `analysis-${projetId}`,
          projet_id: projetId,
          document_id: `doc-${projetId}`,
          extracted_data: {
            company_name: 'Entreprise Exemple',
            total_amount: 45000,
            items: [
              { description: 'Gros œuvre', amount: 25000 },
              { description: 'Second œuvre', amount: 20000 },
            ],
          },
          ai_insights: {
            price_analysis: 'Prix compétitif pour ce type de projet',
            quality_score: 8.5,
            recommendations: ['Vérifier les délais', 'Négocier les finitions'],
          },
          confidence_score: 0.92,
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ];

      set({ analyses: mockAnalyses, error: null });
    } catch (error) {
      console.error('Erreur récupération analyses:', error);
      set({ error: 'Erreur lors de la récupération des analyses' });
    } finally {
      set({ loading: false });
    }
  },

  processQuoteWithAI: async (documentId: string, projetId: string) => {
    set({ loading: true, error: null });
    try {
      console.log(`🤖 Lancement traitement IA pour devis ${documentId}`);

      // Simuler le traitement IA avec un délai
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log(`✅ Traitement IA simulé terminé`);

      // Recharger les données
      await get().fetchAnalyses(projetId);
      await get().fetchPropositions(projetId);
    } catch (error) {
      console.error('Erreur traitement IA:', error);
      set({ error: 'Erreur lors du traitement IA du devis' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  validateProposition: async (propositionId: string, comments?: string) => {
    set({ loading: true, error: null });
    try {
      // Simuler la validation
      console.log(`✅ Proposition ${propositionId} validée avec commentaires:`, comments);

      // Mettre à jour localement
      const propositions = get().propositions.map(p =>
        p.id === propositionId
          ? { ...p, status: 'validee' as const, validated_at: new Date().toISOString() }
          : p
      );

      set({ propositions });

      // Recharger les propositions
      // await get().fetchPropositions();
    } catch (error) {
      console.error('Erreur validation proposition:', error);
      set({ error: 'Erreur lors de la validation de la proposition' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  requestModification: async (propositionId: string, requests: any[]) => {
    set({ loading: true, error: null });
    try {
      // Simuler la demande de modification
      console.log(`✅ Demande de modification pour ${propositionId}:`, requests);

      // Mettre à jour localement
      const propositions = get().propositions.map(p =>
        p.id === propositionId
          ? { ...p, status: 'modifiee' as const, modification_requests: requests }
          : p
      );

      set({ propositions });

      // Recharger les propositions
      // await get().fetchPropositions();
    } catch (error) {
      console.error('Erreur demande modification:', error);
      set({ error: 'Erreur lors de la demande de modification' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signProposition: async (propositionId: string, signatureData: string) => {
    set({ loading: true, error: null });
    try {
      // Simuler la signature
      console.log(`✅ Proposition ${propositionId} signée`);

      // Mettre à jour localement
      const propositions = get().propositions.map(p =>
        p.id === propositionId
          ? { ...p, status: 'validee' as const, signed_at: new Date().toISOString() }
          : p
      );

      set({ propositions });

      // Recharger les propositions
      // await get().fetchPropositions();
    } catch (error) {
      console.error('Erreur signature proposition:', error);
      set({ error: 'Erreur lors de la signature de la proposition' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
