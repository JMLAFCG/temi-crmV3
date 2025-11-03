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
      const propositions: PropositionGlobale[] = [];
      set({ propositions, error: null });
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
      const analyses: DevisAnalysis[] = [];
      set({ analyses, error: null });
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
