import React, { useState } from 'react';
import { Code, Download, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { API_DOCUMENTATION, downloadAPIDocumentation } from '../../lib/apiDocumentation';

export const APIDocumentationViewer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  const generateCurlExample = (endpoint: any) => {
    const baseUrl = 'https://api.temi-construction.fr';
    let curl = `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}"`;
    
    if (endpoint.authentication) {
      curl += ' \\\n  -H "Authorization: Bearer YOUR_TOKEN"';
    }
    
    curl += ' \\\n  -H "Content-Type: application/json"';
    
    if (endpoint.method === 'POST' && endpoint.parameters) {
      const bodyParams = endpoint.parameters.filter(p => p.required);
      if (bodyParams.length > 0) {
        const exampleBody = bodyParams.reduce((acc, param) => {
          acc[param.name] = param.type === 'string' ? 'example' : param.type === 'number' ? 0 : {};
          return acc;
        }, {});
        curl += ` \\\n  -d '${JSON.stringify(exampleBody, null, 2)}'`;
      }
    }
    
    return curl;
  };

  const generateJavaScriptExample = (endpoint: any) => {
    const baseUrl = 'https://api.temi-construction.fr';
    
    let code = `const response = await fetch('${baseUrl}${endpoint.path}', {\n`;
    code += `  method: '${endpoint.method}',\n`;
    code += `  headers: {\n`;
    code += `    'Content-Type': 'application/json',\n`;
    
    if (endpoint.authentication) {
      code += `    'Authorization': 'Bearer ' + token,\n`;
    }
    
    code += `  },\n`;
    
    if (endpoint.method === 'POST' && endpoint.parameters) {
      const bodyParams = endpoint.parameters.filter(p => p.required);
      if (bodyParams.length > 0) {
        const exampleBody = bodyParams.reduce((acc, param) => {
          acc[param.name] = param.type === 'string' ? 'example' : param.type === 'number' ? 0 : {};
          return acc;
        }, {});
        code += `  body: JSON.stringify(${JSON.stringify(exampleBody, null, 4)}),\n`;
      }
    }
    
    code += `});\n\n`;
    code += `const data = await response.json();\n`;
    code += `console.log(data);`;
    
    return code;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documentation API</h1>
            <p className="text-gray-600 mt-2">
              API REST pour intégrer TEMI-Construction à vos applications
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Download size={16} />}
            onClick={downloadAPIDocumentation}
          >
            Télécharger OpenAPI
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des endpoints */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Endpoints disponibles</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {API_DOCUMENTATION.map((endpoint, index) => (
              <button
                key={index}
                onClick={() => setSelectedEndpoint(`${endpoint.method}-${endpoint.path}`)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  selectedEndpoint === `${endpoint.method}-${endpoint.path}` ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          endpoint.method === 'GET'
                            ? 'bg-green-100 text-green-800'
                            : endpoint.method === 'POST'
                              ? 'bg-blue-100 text-blue-800'
                              : endpoint.method === 'PUT'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{endpoint.path}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{endpoint.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Détails de l'endpoint */}
        <div className="lg:col-span-2">
          {selectedEndpoint ? (
            (() => {
              const endpoint = API_DOCUMENTATION.find(
                e => `${e.method}-${e.path}` === selectedEndpoint
              );
              if (!endpoint) return null;

              return (
                <div className="space-y-6">
                  {/* En-tête */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded ${
                          endpoint.method === 'GET'
                            ? 'bg-green-100 text-green-800'
                            : endpoint.method === 'POST'
                              ? 'bg-blue-100 text-blue-800'
                              : endpoint.method === 'PUT'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-lg font-mono text-gray-900">{endpoint.path}</code>
                    </div>
                    <p className="text-gray-600">{endpoint.description}</p>
                    
                    {endpoint.authentication && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          🔒 <strong>Authentification requise</strong>
                          {endpoint.roles && (
                            <span className="ml-2">
                              - Rôles autorisés: {endpoint.roles.join(', ')}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Paramètres */}
                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Nom
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Type
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Requis
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {endpoint.parameters.map((param, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm font-mono text-gray-900">
                                  {param.name}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">{param.type}</td>
                                <td className="px-4 py-2 text-sm">
                                  {param.required ? (
                                    <span className="text-red-600 font-medium">Oui</span>
                                  ) : (
                                    <span className="text-gray-500">Non</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {param.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Réponses */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Réponses</h3>
                    <div className="space-y-4">
                      {endpoint.responses.map((response, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                response.status < 300
                                  ? 'bg-green-100 text-green-800'
                                  : response.status < 500
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {response.status}
                            </span>
                            <span className="text-sm text-gray-900">{response.description}</span>
                          </div>
                          {response.example && (
                            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                              {JSON.stringify(response.example, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exemples de code */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Exemples de code</h3>
                    
                    <div className="space-y-4">
                      {/* cURL */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">cURL</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={copiedCode === 'curl' ? <Check size={14} /> : <Copy size={14} />}
                            onClick={() => copyToClipboard(generateCurlExample(endpoint), 'curl')}
                          >
                            {copiedCode === 'curl' ? 'Copié' : 'Copier'}
                          </Button>
                        </div>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                          {generateCurlExample(endpoint)}
                        </pre>
                      </div>

                      {/* JavaScript */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">JavaScript</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={copiedCode === 'js' ? <Check size={14} /> : <Copy size={14} />}
                            onClick={() => copyToClipboard(generateJavaScriptExample(endpoint), 'js')}
                          >
                            {copiedCode === 'js' ? 'Copié' : 'Copier'}
                          </Button>
                        </div>
                        <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
                          {generateJavaScriptExample(endpoint)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Code size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sélectionnez un endpoint</h3>
              <p className="text-gray-600">
                Choisissez un endpoint dans la liste pour voir sa documentation détaillée
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};