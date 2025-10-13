import { FFSACategory } from '../types';

export const CONSTRUCTION_ACTIVITIES = {
  preparation: {
    title: 'Préparation et aménagement du site',
    activities: [
      { id: '1.1', name: 'Démolition' },
      { id: '1.2', name: 'Terrassement' },
      { id: '1.3', name: 'Amélioration des sols' },
      { id: '1.4', name: 'VRD (Voiries et Réseaux Divers)' },
      { id: '1.5', name: "Montage d'échafaudage" },
      { id: '1.6', name: 'Traitement amiante' },
      { id: '1.7', name: 'Traitement curatif' },
    ],
  },
  structure: {
    title: 'Structure et gros œuvre',
    activities: [
      { id: '2.1', name: 'Fondations spéciales' },
      { id: '2.2', name: 'Maçonnerie et béton armé' },
      { id: '2.3', name: 'Charpente et structure bois' },
      { id: '2.4', name: 'Charpente et structure métallique' },
    ],
  },
  clos_couvert: {
    title: 'Clos et couvert',
    activities: [
      { id: '3.1', name: 'Couverture' },
      { id: '3.2', name: 'Étanchéité' },
      { id: '3.3', name: 'Menuiseries extérieures' },
      { id: '3.4', name: 'Bardage' },
      { id: '3.5', name: 'Façades-rideaux' },
    ],
  },
  divisions: {
    title: 'Divisions et aménagements',
    activities: [
      { id: '4.1', name: 'Menuiseries intérieures' },
      { id: '4.2', name: 'Plâtrerie - Cloisons' },
      { id: '4.3', name: 'Serrurerie - Métallerie' },
      { id: '4.4', name: 'Revêtements de sols durs' },
      { id: '4.5', name: 'Revêtements de sols souples' },
      { id: '4.6', name: 'Revêtements muraux - Peinture' },
      { id: '4.7', name: 'Isolation thermique - Acoustique' },
      { id: '4.8', name: 'Plafonds suspendus' },
    ],
  },
  lots_techniques: {
    title: 'Lots techniques',
    activities: [
      { id: '5.1', name: 'Plomberie' },
      { id: '5.2', name: 'Chauffage - Climatisation' },
      { id: '5.3', name: 'Ventilation' },
      { id: '5.4', name: 'Électricité' },
      { id: '5.5', name: 'Photovoltaïque' },
      { id: '5.6', name: 'Ascenseurs' },
      { id: '5.7', name: 'Piscines' },
    ],
  },
};

export const INTELLECTUAL_SERVICES = {
  etudes: {
    title: "Bureaux d'études",
    services: [
      { id: 'BE1', name: "Bureau d'études structure" },
      { id: 'BE2', name: "Bureau d'études thermiques" },
      { id: 'BE3', name: "Bureau d'études fluides" },
      { id: 'BE4', name: "Bureau d'études acoustiques" },
      { id: 'BE5', name: "Bureau d'études environnementales" },
      { id: 'BE6', name: 'Bureau de contrôle technique' },
    ],
  },
  maitrise_oeuvre: {
    title: "Maîtrise d'œuvre",
    services: [
      { id: 'MO1', name: 'Architecte' },
      { id: 'MO2', name: "Maître d'œuvre d'exécution" },
      { id: 'MO3', name: 'Économiste de la construction' },
      { id: 'MO4', name: 'OPC (Ordonnancement, Pilotage et Coordination)' },
    ],
  },
  diagnostics: {
    title: 'Diagnostics',
    services: [
      { id: 'DG1', name: 'Diagnostic structure' },
      { id: 'DG2', name: 'Diagnostic amiante' },
      { id: 'DG3', name: 'Diagnostic plomb' },
      { id: 'DG4', name: 'Diagnostic énergétique' },
      { id: 'DG5', name: 'Étude géotechnique' },
    ],
  },
};

export const ADDITIONAL_SERVICES = {
  assurances: {
    title: 'Assurances',
    services: [
      { id: 'AS1', name: 'Dommages-ouvrage' },
      { id: 'AS2', name: 'Tous risques chantier' },
      { id: 'AS3', name: "Responsabilité civile maître d'ouvrage" },
      { id: 'AS4', name: 'Protection juridique' },
    ],
  },
  financement: {
    title: 'Solutions de financement',
    services: [
      { id: 'FI1', name: 'Prêt travaux classique' },
      { id: 'FI2', name: 'Éco-prêt à taux zéro' },
      { id: 'FI3', name: 'Prêt rénovation énergétique' },
      { id: 'FI4', name: 'Crédit-bail immobilier' },
    ],
  },
  administratif: {
    title: 'Démarches administratives',
    services: [
      { id: 'AD1', name: 'Permis de construire' },
      { id: 'AD2', name: 'Déclaration préalable' },
      { id: 'AD3', name: 'Autorisation de travaux' },
      { id: 'AD4', name: 'Assistance administrative' },
    ],
  },
};
