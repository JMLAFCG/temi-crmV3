import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface QuoteLineItem {
  designation: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  lot?: string;
  unite?: string;
}

interface ExtractedQuoteData {
  entreprise_name: string;
  total_ht: number;
  total_ttc: number;
  tva: number;
  delai_realisation: number;
  lots: QuoteLineItem[];
  date_validite?: string;
}

interface AIAnalysisResult {
  confidence: number;
  extracted_data: ExtractedQuoteData;
  lots_detected: string[];
  processing_time: number;
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { document_id, projet_id } = await req.json();

    if (!document_id || !projet_id) {
      throw new Error('document_id et projet_id sont requis');
    }

    console.log(`🤖 Traitement IA du devis ${document_id} pour le projet ${projet_id}`);

    const startTime = Date.now();

    // 1. Récupérer le document
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (docError || !document) {
      throw new Error('Document non trouvé');
    }

    // 2. Simuler l'extraction IA du PDF (en production, utiliser une vraie IA)
    const aiResult = await simulateAIExtraction(document);

    // 3. Sauvegarder l'analyse
    const { error: analysisError } = await supabaseClient.from('devis_analysis').insert({
      document_id,
      projet_id,
      entreprise_id: document.entreprise_id,
      extracted_data: aiResult.extracted_data,
      lots_detected: aiResult.lots_detected,
      ai_confidence: aiResult.confidence,
      processing_status: 'completed',
      processing_time_ms: aiResult.processing_time,
      completed_at: new Date().toISOString(),
    });

    if (analysisError) {
      throw new Error(`Erreur sauvegarde analyse: ${analysisError.message}`);
    }

    // 4. Vérifier s'il y a assez de devis pour générer une proposition globale
    const { data: allAnalyses, error: allAnalysesError } = await supabaseClient
      .from('devis_analysis')
      .select('*')
      .eq('projet_id', projet_id)
      .eq('processing_status', 'completed');

    if (allAnalysesError) {
      throw new Error('Erreur récupération analyses');
    }

    console.log(`📊 ${allAnalyses.length} devis analysés pour le projet ${projet_id}`);

    // 5. Si au moins 2 devis, générer la proposition globale
    if (allAnalyses.length >= 2) {
      await generateGlobalProposal(supabaseClient, projet_id, allAnalyses);
    }

    const processingTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        analysis_id: document_id,
        confidence: aiResult.confidence,
        lots_detected: aiResult.lots_detected.length,
        processing_time_ms: processingTime,
        global_proposal_generated: allAnalyses.length >= 2,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Erreur traitement IA:', error);

    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Simulation de l'extraction IA (à remplacer par une vraie IA)
async function simulateAIExtraction(document: any): Promise<AIAnalysisResult> {
  // Simuler un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Données simulées d'extraction (en production, utiliser OpenAI ou autre)
  const mockExtractedData: ExtractedQuoteData = {
    entreprise_name: document.entreprise_name || 'Entreprise Inconnue',
    total_ht: Math.floor(Math.random() * 50000) + 10000,
    total_ttc: 0,
    tva: 20,
    delai_realisation: Math.floor(Math.random() * 60) + 30,
    lots: [
      {
        designation: 'Électricité générale',
        quantite: 1,
        prix_unitaire: 8500,
        total: 8500,
        lot: 'Électricité',
        unite: 'forfait',
      },
      {
        designation: 'Plomberie sanitaire',
        quantite: 1,
        prix_unitaire: 6200,
        total: 6200,
        lot: 'Plomberie',
        unite: 'forfait',
      },
      {
        designation: 'Peinture intérieure',
        quantite: 120,
        prix_unitaire: 25,
        total: 3000,
        lot: 'Peinture',
        unite: 'm²',
      },
    ],
  };

  mockExtractedData.total_ttc = mockExtractedData.total_ht * (1 + mockExtractedData.tva / 100);

  return {
    confidence: 0.85 + Math.random() * 0.1, // 85-95%
    extracted_data: mockExtractedData,
    lots_detected: mockExtractedData.lots.map(lot => lot.lot || ''),
    processing_time: 1500 + Math.random() * 1000,
  };
}

// Génération de la proposition globale intelligente
async function generateGlobalProposal(supabaseClient: any, projet_id: string, analyses: any[]) {
  console.log(`🧠 Génération proposition globale pour ${analyses.length} devis`);

  try {
    // 1. Analyser et comparer tous les lots
    const lotsComparison = compareQuoteLots(analyses);

    // 2. Sélectionner les meilleures offres par lot
    const selectedLots = selectBestOffers(lotsComparison);

    // 3. Calculer le montant total
    const montantTotal = selectedLots.reduce((sum, lot) => sum + lot.montant_lot, 0);

    // 4. Créer la proposition globale
    const { data: proposition, error: propError } = await supabaseClient
      .from('proposition_globale')
      .insert({
        projet_id,
        montant_total: montantTotal,
        montant_ht: montantTotal / 1.2,
        montant_tva: montantTotal - montantTotal / 1.2,
        status: 'soumise',
        generated_by_ai: true,
        ai_analysis: {
          analyses_count: analyses.length,
          lots_compared: lotsComparison.length,
          selection_criteria: 'Meilleur rapport qualité-prix par lot',
          confidence_average:
            analyses.reduce((sum, a) => sum + a.ai_confidence, 0) / analyses.length,
        },
        delai_global_estime: Math.max(...selectedLots.map(lot => lot.delai_realisation || 30)),
      })
      .select()
      .single();

    if (propError) {
      throw new Error(`Erreur création proposition: ${propError.message}`);
    }

    // 5. Insérer les lots sélectionnés
    const { error: lotsError } = await supabaseClient.from('proposition_lots').insert(
      selectedLots.map(lot => ({
        ...lot,
        proposition_id: proposition.id,
      }))
    );

    if (lotsError) {
      throw new Error(`Erreur insertion lots: ${lotsError.message}`);
    }

    // 6. Générer le PDF de la proposition (simulation)
    const pdfUrl = await generateProposalPDF(proposition, selectedLots);

    // 7. Mettre à jour avec l'URL du PDF
    await supabaseClient
      .from('proposition_globale')
      .update({ fichier_proposition: pdfUrl })
      .eq('id', proposition.id);

    console.log(`✅ Proposition globale générée: ${proposition.id}`);

    return proposition;
  } catch (error) {
    console.error('❌ Erreur génération proposition:', error);
    throw error;
  }
}

// Comparaison intelligente des lots entre devis
function compareQuoteLots(analyses: any[]) {
  const lotsMap = new Map();

  analyses.forEach(analysis => {
    const lots = analysis.extracted_data?.lots || [];

    lots.forEach((lot: QuoteLineItem) => {
      const lotKey = normalizeLotName(lot.lot || lot.designation);

      if (!lotsMap.has(lotKey)) {
        lotsMap.set(lotKey, []);
      }

      lotsMap.get(lotKey).push({
        ...lot,
        entreprise_id: analysis.entreprise_id,
        entreprise_name: analysis.extracted_data?.entreprise_name,
        confidence: analysis.ai_confidence,
      });
    });
  });

  return Array.from(lotsMap.entries()).map(([lotName, offers]) => ({
    lot_name: lotName,
    offers: offers.sort((a: any, b: any) => a.total - b.total), // Trier par prix
  }));
}

// Sélection des meilleures offres
function selectBestOffers(lotsComparison: any[]) {
  return lotsComparison.map(({ lot_name, offers }) => {
    // Logique de sélection intelligente
    const bestOffer = offers[0]; // Pour l'instant, le moins cher

    // Critères de sélection :
    // 1. Prix compétitif
    // 2. Confiance IA élevée
    // 3. Délai raisonnable

    const alternatives = offers.slice(1, 3).map((offer: any) => ({
      entreprise_name: offer.entreprise_name,
      montant: offer.total,
      delai: offer.delai_realisation || 30,
    }));

    return {
      lot_name,
      lot_code: generateLotCode(lot_name),
      entreprise_id: bestOffer.entreprise_id,
      entreprise_name: bestOffer.entreprise_name,
      montant_lot: bestOffer.total,
      montant_ht: bestOffer.total / 1.2,
      montant_tva: bestOffer.total - bestOffer.total / 1.2,
      description: bestOffer.designation,
      delai_realisation: bestOffer.delai_realisation || 30,
      justification_choix: `Sélectionné pour le meilleur rapport qualité-prix (${offers.length} offres comparées)`,
      alternatives,
    };
  });
}

// Normalisation des noms de lots
function normalizeLotName(name: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/[ç]/g, 'c')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u');

  // Regroupements intelligents
  if (normalized.includes('electr') || normalized.includes('elect')) return 'Électricité';
  if (normalized.includes('plomb') || normalized.includes('sanit')) return 'Plomberie';
  if (normalized.includes('peinture') || normalized.includes('revetement')) return 'Peinture';
  if (normalized.includes('maconn') || normalized.includes('beton')) return 'Maçonnerie';
  if (normalized.includes('charpente') || normalized.includes('bois')) return 'Charpente';
  if (normalized.includes('couvert') || normalized.includes('toiture')) return 'Couverture';
  if (normalized.includes('menuiser')) return 'Menuiserie';
  if (normalized.includes('carrel') || normalized.includes('sol')) return 'Carrelage';

  return name; // Retourner le nom original si pas de correspondance
}

// Génération du code lot
function generateLotCode(lotName: string): string {
  const codes: Record<string, string> = {
    Électricité: 'D.3',
    Plomberie: 'D.1',
    Peinture: 'E.5',
    Maçonnerie: 'B.2',
    Charpente: 'B.3',
    Couverture: 'C.1',
    Menuiserie: 'E.2',
    Carrelage: 'E.3',
  };

  return codes[lotName] || 'X.X';
}

// Génération du PDF de proposition (simulation)
async function generateProposalPDF(proposition: any, lots: any[]): Promise<string> {
  // En production, utiliser une librairie de génération PDF
  // Pour l'instant, simuler avec une URL

  const pdfContent = {
    title: `Proposition globale - Projet ${proposition.projet_id}`,
    lots: lots,
    total: proposition.montant_total,
    generated_at: new Date().toISOString(),
  };

  // Simuler l'upload vers Supabase Storage
  const fileName = `propositions/projet_${proposition.projet_id}_${Date.now()}.pdf`;

  // En production :
  // const { data, error } = await supabaseClient.storage
  //   .from('documents')
  //   .upload(fileName, pdfBuffer);

  // Pour l'instant, retourner une URL simulée
  return `https://storage.supabase.co/documents/${fileName}`;
}
