// Documentation automatique de l'API TEMI-Construction
export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  responses: Array<{
    status: number;
    description: string;
    example?: any;
  }>;
  authentication: boolean;
  roles?: string[];
}

export const API_DOCUMENTATION: APIEndpoint[] = [
  // Projets
  {
    method: 'GET',
    path: '/api/projects',
    description: 'Récupérer la liste des projets',
    parameters: [
      { name: 'status', type: 'string', required: false, description: 'Filtrer par statut' },
      { name: 'client_id', type: 'uuid', required: false, description: 'Filtrer par client' },
      { name: 'limit', type: 'number', required: false, description: 'Nombre maximum de résultats' },
    ],
    responses: [
      {
        status: 200,
        description: 'Liste des projets',
        example: {
          data: [
            {
              id: 'uuid',
              title: 'Rénovation cuisine',
              status: 'in_progress',
              client_id: 'uuid',
              created_at: '2025-01-15T10:00:00Z',
            },
          ],
          count: 1,
        },
      },
      { status: 401, description: 'Non authentifié' },
      { status: 403, description: 'Accès refusé' },
    ],
    authentication: true,
    roles: ['admin', 'manager', 'commercial', 'mandatary'],
  },

  {
    method: 'POST',
    path: '/api/projects',
    description: 'Créer un nouveau projet',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Titre du projet' },
      { name: 'description', type: 'string', required: false, description: 'Description' },
      { name: 'client_id', type: 'uuid', required: true, description: 'ID du client' },
      { name: 'budget', type: 'object', required: true, description: 'Budget estimé' },
    ],
    responses: [
      {
        status: 201,
        description: 'Projet créé',
        example: {
          id: 'uuid',
          title: 'Nouveau projet',
          status: 'draft',
          created_at: '2025-01-15T10:00:00Z',
        },
      },
      { status: 400, description: 'Données invalides' },
      { status: 401, description: 'Non authentifié' },
    ],
    authentication: true,
    roles: ['admin', 'manager', 'commercial', 'mandatary'],
  },

  // Clients
  {
    method: 'GET',
    path: '/api/clients',
    description: 'Récupérer la liste des clients',
    parameters: [
      { name: 'search', type: 'string', required: false, description: 'Recherche par nom/email' },
      { name: 'limit', type: 'number', required: false, description: 'Nombre maximum de résultats' },
    ],
    responses: [
      {
        status: 200,
        description: 'Liste des clients',
        example: {
          data: [
            {
              id: 'uuid',
              user: {
                first_name: 'Jean',
                last_name: 'Dupont',
                email: 'jean.dupont@email.com',
              },
              phone: '0123456789',
              created_at: '2025-01-15T10:00:00Z',
            },
          ],
        },
      },
    ],
    authentication: true,
    roles: ['admin', 'manager', 'commercial', 'mandatary'],
  },

  // Entreprises
  {
    method: 'GET',
    path: '/api/companies',
    description: 'Récupérer la liste des entreprises',
    parameters: [
      { name: 'category', type: 'string', required: false, description: 'construction_partner ou service_provider' },
      { name: 'status', type: 'string', required: false, description: 'active ou inactive' },
      { name: 'activities', type: 'array', required: false, description: 'Filtrer par activités' },
    ],
    responses: [
      {
        status: 200,
        description: 'Liste des entreprises',
        example: {
          data: [
            {
              id: 'uuid',
              name: 'Électricité Moderne',
              email: 'contact@electricite-moderne.fr',
              activities: ['Électricité', 'Domotique'],
              verification_status: 'verified',
            },
          ],
        },
      },
    ],
    authentication: true,
    roles: ['admin', 'manager', 'commercial', 'mandatary'],
  },

  // IA
  {
    method: 'POST',
    path: '/api/ai/analyze-quote',
    description: 'Analyser un devis avec l\'IA',
    parameters: [
      { name: 'document_id', type: 'uuid', required: true, description: 'ID du document PDF' },
      { name: 'project_id', type: 'uuid', required: true, description: 'ID du projet' },
    ],
    responses: [
      {
        status: 200,
        description: 'Analyse terminée',
        example: {
          analysis_id: 'uuid',
          confidence: 0.92,
          extracted_data: {
            total_ht: 25000,
            total_ttc: 30000,
            lots: [
              { designation: 'Électricité', amount: 15000 },
              { designation: 'Plomberie', amount: 10000 },
            ],
          },
        },
      },
      { status: 400, description: 'Document invalide' },
      { status: 500, description: 'Erreur de traitement IA' },
    ],
    authentication: true,
    roles: ['admin', 'manager', 'commercial', 'mandatary'],
  },

  // Commissions
  {
    method: 'GET',
    path: '/api/commissions',
    description: 'Récupérer les commissions',
    parameters: [
      { name: 'provider_id', type: 'uuid', required: false, description: 'Filtrer par apporteur' },
      { name: 'status', type: 'string', required: false, description: 'pending, paid, cancelled' },
      { name: 'date_from', type: 'date', required: false, description: 'Date de début' },
      { name: 'date_to', type: 'date', required: false, description: 'Date de fin' },
    ],
    responses: [
      {
        status: 200,
        description: 'Liste des commissions',
        example: {
          data: [
            {
              id: 'uuid',
              project_title: 'Rénovation cuisine',
              amount: 300,
              status: 'paid',
              created_at: '2025-01-15T10:00:00Z',
            },
          ],
        },
      },
    ],
    authentication: true,
    roles: ['admin', 'manager', 'business_provider'],
  },

  // Notifications
  {
    method: 'POST',
    path: '/api/notifications',
    description: 'Créer une notification',
    parameters: [
      { name: 'user_id', type: 'uuid', required: true, description: 'ID de l\'utilisateur' },
      { name: 'title', type: 'string', required: true, description: 'Titre de la notification' },
      { name: 'content', type: 'string', required: true, description: 'Contenu' },
      { name: 'type', type: 'string', required: false, description: 'info, success, warning, error' },
    ],
    responses: [
      {
        status: 201,
        description: 'Notification créée',
        example: {
          id: 'uuid',
          title: 'Nouveau projet',
          content: 'Un nouveau projet a été créé',
          created_at: '2025-01-15T10:00:00Z',
        },
      },
    ],
    authentication: true,
    roles: ['admin', 'manager'],
  },
];

export const generateOpenAPISpec = () => {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'TEMI-Construction CRM API',
      version: '1.0.0',
      description: 'API pour la gestion de la relation client TEMI-Construction',
      contact: {
        name: 'Support TEMI',
        email: 'support@temi-construction.fr',
      },
    },
    servers: [
      {
        url: 'https://api.temi-construction.fr',
        description: 'Serveur de production',
      },
      {
        url: 'https://staging-api.temi-construction.fr',
        description: 'Serveur de test',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
    paths: {},
  };

  // Générer les paths depuis la documentation
  API_DOCUMENTATION.forEach(endpoint => {
    if (!spec.paths[endpoint.path]) {
      spec.paths[endpoint.path] = {};
    }

    spec.paths[endpoint.path][endpoint.method.toLowerCase()] = {
      summary: endpoint.description,
      parameters: endpoint.parameters?.map(param => ({
        name: param.name,
        in: param.name === 'limit' || param.name === 'search' ? 'query' : 'body',
        required: param.required,
        description: param.description,
        schema: { type: param.type },
      })),
      responses: endpoint.responses.reduce((acc, response) => {
        acc[response.status] = {
          description: response.description,
          content: response.example ? {
            'application/json': {
              example: response.example,
            },
          } : undefined,
        };
        return acc;
      }, {}),
      security: endpoint.authentication ? [{ BearerAuth: [] }] : [],
      tags: [endpoint.path.split('/')[2]], // Extraire le tag du path
    };
  });

  return spec;
};

export const downloadAPIDocumentation = () => {
  const spec = generateOpenAPISpec();
  const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'temi-construction-api.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};