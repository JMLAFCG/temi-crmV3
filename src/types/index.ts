import { create } from 'zustand';

export type UserRole =
  | 'client'
  | 'entreprise_partenaire'
  | 'apporteur'
  | 'mandatary'
  | 'commercial'
  | 'manager'
  | 'admin'
  | 'super_admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  managedBy?: string;
  teamId?: string;
  documentValidationStatus?: 'pending' | 'validated' | 'rejected';
  documents?: {
    identity?: any;
    rib?: any;
    other?: any[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Projet {
  id: string;
  user_id: string;
  titre: string;
  description?: string;
  statut: 'en_attente' | 'en_cours' | 'terminé' | 'archivé';
  budget_estime: number;
  date_debut?: string;
  date_fin_prevue?: string;
  adresse?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  projet_id?: string;
  user_id: string;
  type_document: string;
  nom_fichier: string;
  fichier_url?: string;
  statut: 'validé' | 'en_attente' | 'refusé';
  commentaire?: string;
  created_at: string;
  updated_at: string;
}

export interface Signature {
  id: string;
  projet_id: string;
  user_id: string;
  document_id?: string;
  signature_data: string;
  date_signature: string;
  ip_address?: string;
  created_at: string;
}

export interface JournalClient {
  id: string;
  projet_id?: string;
  user_id: string;
  action: string;
  description?: string;
  date: string;
}

export interface Mission {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
  amount?: number;
  location?: any;
  created_at: string;
  entreprise_id?: string;
  projet_id?: string;
  statut: 'proposé' | 'accepté' | 'refusé' | 'en_cours' | 'terminé';
  date_affectation: string;
  date_acceptation?: string;
  date_fin?: string;
  montant_devis: number;
  commentaire?: string;
  updated_at: string;
}

export interface Paiement {
  id: string;
  mission_id: string;
  entreprise_id: string;
  montant: number;
  type_paiement: 'retrocession' | 'commission' | 'bonus';
  statut: 'en_attente' | 'payé' | 'annulé';
  date_paiement?: string;
  reference_paiement?: string;
  commentaire?: string;
  created_at: string;
  updated_at: string;
}

export interface Apport {
  id: string;
  apporteur_id: string;
  prospect_nom: string;
  prospect_prenom?: string;
  prospect_email?: string;
  prospect_telephone?: string;
  prospect_adresse?: string;
  type_projet: string;
  description_projet?: string;
  budget_estime: number;
  statut: 'en_cours' | 'réalisé' | 'refusé' | 'abandonné';
  date_contact: string;
  commentaire?: string;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  apport_id?: string;
  apporteur_id: string;
  montant: number;
  pourcentage: number;
  statut: 'en_attente' | 'payé' | 'annulé';
  date_paiement?: string;
  reference_paiement?: string;
  commentaire?: string;
  created_at: string;
}

export interface Apport {
  id: string;
  apporteur_id: string;
  prospect_nom: string;
  prospect_prenom?: string;
  prospect_email?: string;
  prospect_telephone?: string;
  prospect_adresse?: string;
  type_projet: string;
  description_projet?: string;
  budget_estime: number;
  commentaire?: string;
  date_contact: string;
  statut: 'en_attente' | 'en_cours' | 'réalisé' | 'refusé' | 'abandonné';
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

// Types pour le module IA de traitement des devis
export interface QuoteLineItem {
  designation: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  lot?: string;
  unite?: string;
}

export interface ExtractedQuoteData {
  entreprise_name: string;
  total_ht: number;
  total_ttc: number;
  tva: number;
  delai_realisation: number;
  lots: QuoteLineItem[];
  date_validite?: string;
}

export interface DevisAnalysis {
  id: string;
  document_id: string;
  projet_id: string;
  entreprise_id: string;
  extracted_data: ExtractedQuoteData;
  lots_detected: string[];
  ai_confidence: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  processing_time_ms?: number;
  created_at: string;
  completed_at?: string;
}

export interface PropositionGlobale {
  id: string;
  projet_id: string;
  montant_total: number;
  montant_ht: number;
  montant_tva: number;
  fichier_proposition?: string;
  status: 'en_attente' | 'soumise' | 'validee' | 'refusee' | 'modifiee';
  generated_by_ai: boolean;
  ai_analysis: any;
  client_comments?: string;
  modification_requests: any[];
  delai_global_estime?: number;
  created_at: string;
  validated_at?: string;
  signed_at?: string;
}

export interface PropositionLot {
  id: string;
  proposition_id: string;
  lot_name: string;
  lot_code?: string;
  entreprise_id: string;
  entreprise_name: string;
  montant_lot: number;
  montant_ht: number;
  montant_tva: number;
  description?: string;
  delai_realisation?: number;
  justification_choix?: string;
  alternatives: any[];
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
  client_id?: string;
  agent_id?: string;
  business_provider_id?: string | null;
  client?: User;
  agent?: User;
  location: {
    address: string;
    city: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  surface: {
    total: number;
    living: number;
    work: number;
  };
  budget: {
    total: number;
    materials: number;
    labor: number;
    services: number;
  };
  timeline: {
    estimatedDuration: number;
    startDate: string;
    endDate: string;
  };
  activities?: string[];
  intellectual_services?: string[];
  additional_services?: string[];
  comments?: any[];
  created_at: string;
  updated_at: string;
}

export interface WorkPackageLot {
  id: string;
  code: string;
  name: string;
  description: string;
  activities: string[];
  estimatedCost?: number;
  duration?: string;
  requirements?: string;
  photos: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
}

export interface WorkPackageCategory {
  id: string;
  title: string;
  lots: WorkPackageLot[];
}

export const WORK_PACKAGE_CATEGORIES: WorkPackageCategory[] = [
  {
    id: '1',
    title: 'Préparation du site',
    lots: [
      {
        id: 'A1',
        code: 'A.1',
        name: 'Installation de chantier',
        description: 'Mise en place des installations nécessaires au démarrage du chantier',
        activities: [
          'Installation de la base vie',
          'Mise en place des clôtures de chantier',
          'Installation des réseaux provisoires (eau, électricité)',
          'Création des accès chantier',
          'Installation des équipements de sécurité',
          'Mise en place de la signalétique',
          'Installation des zones de stockage',
          'Mise en place des sanitaires de chantier',
          'Installation du bureau de chantier',
          'Raccordements aux réseaux publics',
        ],
        photos: [],
      },
      {
        id: 'A2',
        code: 'A.2',
        name: 'Démolition',
        description: "Démolition totale ou partielle d'ouvrages existants",
        activities: [
          'Dépose des équipements existants',
          'Démolition manuelle sélective',
          'Démolition mécanique',
          'Évacuation des gravats',
          'Tri des déchets',
          'Recyclage des matériaux',
          'Protection des ouvrages conservés',
          'Désamiantage si nécessaire',
          'Curage intérieur',
          'Obturation des réseaux',
        ],
        photos: [],
      },
      {
        id: 'A3',
        code: 'A.3',
        name: 'Terrassement',
        description: 'Préparation du terrain et travaux de terrassement',
        activities: [
          'Décapage de la terre végétale',
          'Excavation',
          'Remblaiement',
          'Nivellement',
          'Compactage',
          'Drainage',
          'Évacuation des terres excédentaires',
          'Mise en place des plates-formes',
          'Traitement des sols',
          'Protection contre les eaux',
        ],
        photos: [],
      },
    ],
  },
  {
    id: '2',
    title: 'Structure et gros œuvre',
    lots: [
      {
        id: 'B1',
        code: 'B.1',
        name: 'Fondations spéciales',
        description: 'Réalisation des fondations profondes et ouvrages spéciaux',
        activities: [
          'Études géotechniques',
          'Réalisation de pieux',
          'Installation de micropieux',
          'Création de parois moulées',
          'Mise en place des longrines',
          'Réalisation des massifs',
          'Contrôles et essais',
          'Reprise en sous-œuvre',
          'Traitement des sols',
          'Mise en place des tirants',
        ],
        photos: [],
      },
      {
        id: 'B2',
        code: 'B.2',
        name: 'Maçonnerie et béton armé',
        description: 'Travaux de maçonnerie traditionnelle et béton armé',
        activities: [
          'Réalisation des fondations superficielles',
          'Pose des armatures',
          'Coffrage',
          'Coulage du béton',
          'Maçonnerie traditionnelle',
          'Création des ouvertures',
          'Réalisation des joints de dilatation',
          'Mise en place des réservations',
          'Traitement des reprises de bétonnage',
          'Réalisation des escaliers',
        ],
        photos: [],
      },
      {
        id: 'B3',
        code: 'B.3',
        name: 'Charpente',
        description: 'Réalisation des structures porteuses en bois ou métal',
        activities: [
          'Pose de la charpente bois',
          'Installation de la charpente métallique',
          'Mise en place des pannes',
          'Contreventement',
          'Traitement des bois',
          'Protection anti-corrosion',
          'Installation des supports techniques',
          'Mise en place des chevrons',
          'Pose des fermes',
          'Installation des connecteurs',
        ],
        photos: [],
      },
    ],
  },
  {
    id: '3',
    title: 'Enveloppe du bâtiment',
    lots: [
      {
        id: 'C1',
        code: 'C.1',
        name: 'Couverture',
        description: 'Réalisation de la couverture et de ses accessoires',
        activities: [
          "Pose de l'isolation",
          'Installation des tuiles/ardoises',
          "Pose des éléments d'étanchéité",
          'Installation des descentes EP',
          'Pose des dispositifs de sécurité',
          'Réalisation des solins',
          'Installation des fenêtres de toit',
          'Pose des gouttières',
          'Installation des pare-vapeur',
          'Mise en place des évacuations',
        ],
        photos: [],
      },
      {
        id: 'C2',
        code: 'C.2',
        name: 'Façades',
        description: 'Traitement et finition des façades',
        activities: [
          "Pose de l'isolation extérieure",
          'Application des enduits',
          'Installation du bardage',
          'Pose des pierres de parement',
          'Réalisation des joints',
          'Installation des garde-corps',
          'Mise en place des protections solaires',
          'Pose des menuiseries',
          'Installation des brise-soleil',
          'Traitement des points singuliers',
        ],
        photos: [],
      },
    ],
  },
  {
    id: '4',
    title: 'Lots techniques',
    lots: [
      {
        id: 'D1',
        code: 'D.1',
        name: 'Électricité',
        description: 'Installation électrique complète',
        activities: [
          'Installation du tableau général',
          'Pose des chemins de câbles',
          'Câblage courants forts',
          'Câblage courants faibles',
          'Installation des luminaires',
          'Mise en place des prises',
          'Raccordement au réseau',
          'Tests et mesures',
          'Installation des systèmes de sécurité',
          'Mise en place de la domotique',
        ],
        photos: [],
      },
      {
        id: 'D2',
        code: 'D.2',
        name: 'Plomberie',
        description: "Installation des réseaux d'eau et équipements sanitaires",
        activities: [
          "Pose des réseaux d'alimentation",
          'Installation des évacuations',
          'Pose des appareils sanitaires',
          'Installation de la production ECS',
          'Mise en place des compteurs',
          "Tests d'étanchéité",
          'Raccordements définitifs',
          'Installation des systèmes de filtration',
          'Mise en place des dispositifs anti-légionelles',
          "Installation des systèmes de traitement d'eau",
        ],
        photos: [],
      },
      {
        id: 'D3',
        code: 'D.3',
        name: 'Chauffage - Ventilation',
        description: 'Installation des systèmes de chauffage et ventilation',
        activities: [
          'Installation de la chaudière',
          'Pose des radiateurs',
          'Installation du plancher chauffant',
          'Mise en place des gaines de ventilation',
          'Installation des CTA',
          "Pose des bouches d'extraction",
          'Équilibrage des réseaux',
          'Mise en service',
          'Installation des pompes à chaleur',
          'Mise en place des systèmes de régulation',
        ],
        photos: [],
      },
    ],
  },
  {
    id: '5',
    title: 'Second œuvre et finitions',
    lots: [
      {
        id: 'E1',
        code: 'E.1',
        name: 'Menuiseries',
        description: 'Pose des menuiseries intérieures et extérieures',
        activities: [
          'Pose des fenêtres',
          'Installation des portes',
          'Pose des volets',
          'Installation des placards',
          'Pose des plinthes',
          'Installation des escaliers',
          'Pose des habillages',
          'Installation des portes coupe-feu',
          'Mise en place des ferme-portes',
          'Pose des serrures et quincaillerie',
        ],
        photos: [],
      },
      {
        id: 'E2',
        code: 'E.2',
        name: 'Plâtrerie - Isolation',
        description: 'Réalisation des cloisons et isolation',
        activities: [
          'Pose des rails et montants',
          "Installation de l'isolation",
          'Pose des plaques de plâtre',
          'Réalisation des joints',
          'Création des faux-plafonds',
          'Traitement des points singuliers',
          "Pose des trappes d'accès",
          'Installation des membranes pare-vapeur',
          'Mise en place des renforts',
          'Traitement acoustique',
        ],
        photos: [],
      },
      {
        id: 'E3',
        code: 'E.3',
        name: 'Revêtements',
        description: 'Pose des revêtements sols et murs',
        activities: [
          'Préparation des supports',
          'Pose du carrelage',
          'Installation des parquets',
          'Pose des revêtements souples',
          'Application des peintures',
          'Pose des papiers peints',
          'Réalisation des joints',
          'Mise en place des plinthes',
          'Traitement des seuils',
          'Application des vernis et lasures',
        ],
        photos: [],
      },
    ],
  },
  {
    id: '6',
    title: 'Aménagements extérieurs',
    lots: [
      {
        id: 'F1',
        code: 'F.1',
        name: 'VRD',
        description: 'Voirie et réseaux divers',
        activities: [
          'Terrassement des voiries',
          'Pose des réseaux enterrés',
          'Réalisation des fondations',
          'Pose des bordures',
          'Application des enrobés',
          "Installation de l'éclairage",
          'Marquage au sol',
          'Mise en place du système de drainage',
          'Installation des regards',
          'Raccordement aux réseaux publics',
        ],
        photos: [],
      },
      {
        id: 'F2',
        code: 'F.2',
        name: 'Espaces verts',
        description: 'Aménagement paysager',
        activities: [
          'Préparation des sols',
          'Plantation des végétaux',
          "Installation du système d'arrosage",
          'Pose des clôtures',
          'Création des cheminements',
          'Installation du mobilier extérieur',
          'Engazonnement',
          'Mise en place du paillage',
          "Installation des systèmes d'éclairage",
          'Création des massifs',
        ],
        photos: [],
      },
    ],
  },
];

export interface FFSACategory {
  id: string;
  code: string;
  name: string;
  lots: FFSALot[];
}

export interface FFSALot {
  id: string;
  code: string;
  name: string;
  description: string;
  selected?: boolean;
}

export const FFSA_CATEGORIES: FFSACategory[] = [
  {
    id: '1',
    code: 'A',
    name: 'Préparation du site',
    lots: [
      {
        id: 'A.1',
        code: 'A.1',
        name: 'Démolition',
        description: "Démolition totale ou partielle d'ouvrages",
      },
      {
        id: 'A.2',
        code: 'A.2',
        name: 'Terrassement',
        description: 'Terrassement, amélioration des sols',
      },
    ],
  },
  {
    id: '2',
    code: 'B',
    name: 'Structure et gros œuvre',
    lots: [
      {
        id: 'B.1',
        code: 'B.1',
        name: 'Fondations spéciales',
        description: 'Pieux, micropieux, parois moulées, etc.',
      },
      {
        id: 'B.2',
        code: 'B.2',
        name: 'Maçonnerie et béton armé',
        description: 'Maçonnerie traditionnelle, béton armé coulé en place',
      },
      {
        id: 'B.3',
        code: 'B.3',
        name: 'Charpente et structure bois',
        description: 'Charpente traditionnelle, lamellé-collé, ossature bois',
      },
      {
        id: 'B.4',
        code: 'B.4',
        name: 'Charpente métallique',
        description: 'Construction métallique, serrurerie',
      },
    ],
  },
  {
    id: '3',
    code: 'C',
    name: 'Clos et couvert',
    lots: [
      {
        id: 'C.1',
        code: 'C.1',
        name: 'Couverture',
        description: 'Tous types de couverture (tuiles, ardoises, zinc...)',
      },
      {
        id: 'C.2',
        code: 'C.2',
        name: 'Étanchéité',
        description: 'Étanchéité de toitures-terrasses, cuvelage',
      },
      {
        id: 'C.3',
        code: 'C.3',
        name: 'Menuiseries extérieures',
        description: 'Fenêtres, portes-fenêtres, façades vitrées',
      },
      {
        id: 'C.4',
        code: 'C.4',
        name: 'Bardage et façades',
        description: "Bardage, isolation par l'extérieur",
      },
    ],
  },
  {
    id: '4',
    code: 'D',
    name: 'Lots techniques',
    lots: [
      {
        id: 'D.1',
        code: 'D.1',
        name: 'Plomberie - Sanitaire',
        description: "Installation sanitaire, distribution d'eau",
      },
      {
        id: 'D.2',
        code: 'D.2',
        name: 'Chauffage - Climatisation',
        description: 'Production et distribution de chaleur/froid',
      },
      {
        id: 'D.3',
        code: 'D.3',
        name: 'Électricité',
        description: 'Installation électrique courants forts/faibles',
      },
      {
        id: 'D.4',
        code: 'D.4',
        name: 'Ventilation',
        description: "VMC, traitement d'air",
      },
    ],
  },
  {
    id: '5',
    code: 'E',
    name: 'Finitions',
    lots: [
      {
        id: 'E.1',
        code: 'E.1',
        name: 'Plâtrerie - Isolation',
        description: 'Cloisons, doublages, faux-plafonds',
      },
      {
        id: 'E.2',
        code: 'E.2',
        name: 'Menuiseries intérieures',
        description: 'Portes, placards, escaliers',
      },
      {
        id: 'E.3',
        code: 'E.3',
        name: 'Revêtements de sols durs',
        description: 'Carrelage, pierre naturelle',
      },
      {
        id: 'E.4',
        code: 'E.4',
        name: 'Revêtements de sols souples',
        description: 'PVC, moquette, parquet',
      },
      {
        id: 'E.5',
        code: 'E.5',
        name: 'Peinture',
        description: 'Peinture, revêtements muraux',
      },
    ],
  },
  {
    id: '6',
    code: 'F',
    name: 'Aménagements extérieurs',
    lots: [
      {
        id: 'F.1',
        code: 'F.1',
        name: 'VRD',
        description: 'Voirie et réseaux divers',
      },
      {
        id: 'F.2',
        code: 'F.2',
        name: 'Espaces verts',
        description: 'Aménagements paysagers',
      },
    ],
  },
];

interface FFSAStore {
  selectedLots: string[];
  toggleLot: (lotId: string) => void;
  clearSelection: () => void;
}

export const useFFSAStore = create<FFSAStore>(set => ({
  selectedLots: [],
  toggleLot: lotId =>
    set(state => ({
      selectedLots: state.selectedLots.includes(lotId)
        ? state.selectedLots.filter(id => id !== lotId)
        : [...state.selectedLots, lotId],
    })),
  clearSelection: () => set({ selectedLots: [] }),
}));
