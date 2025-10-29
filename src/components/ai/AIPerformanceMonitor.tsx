import React, { useState, useEffect } from 'react';
import { Brain, BarChart, Clock, Target, AlertTriangle, TrendingUp } from 'lucide-react';

interface AIMetrics {
  totalAnalyses: number;
  successRate: number;
  averageConfidence: number;
  averageProcessingTime: number;
  errorRate: number;
  propositionsGenerated: number;
  clientAcceptanceRate: number;
}

interface AIPerformanceData {
  date: string;
  analyses: number;
  confidence: number;
  processingTime: number;
  errors: number;
}

export const AIPerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<AIMetrics>({
    totalAnalyses: 0,
    successRate: 0,
    averageConfidence: 0,
    averageProcessingTime: 0,
    errorRate: 0,
    propositionsGenerated: 0,
    clientAcceptanceRate: 0,
  });

  const [performanceData, setPerformanceData] = useState<AIPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIMetrics();
  }, []);

  const fetchAIMetrics = async () => {
    try {
      setLoading(true);
      
      // Simuler des métriques IA pour la démo
      const mockMetrics: AIMetrics = {
        totalAnalyses: 156,
        successRate: 94.2,
        averageConfidence: 87.5,
        averageProcessingTime: 2.3,
        errorRate: 5.8,
        propositionsGenerated: 42,
        clientAcceptanceRate: 78.6,
      };

      const mockPerformanceData: AIPerformanceData[] = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        analyses: Math.floor(Math.random() * 10) + 2,
        confidence: 0.8 + Math.random() * 0.15,
        processingTime: 1.5 + Math.random() * 2,
        errors: Math.random() < 0.1 ? 1 : 0,
      }));

      setMetrics(mockMetrics);
      setPerformanceData(mockPerformanceData);
    } catch (error) {
      console.error('Erreur chargement métriques IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600 bg-green-50';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Analyses totales</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalAnalyses}</p>
            </div>
            <Brain className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de succès</p>
              <p className={`text-2xl font-bold ${getMetricColor(metrics.successRate, { good: 90, warning: 80 })}`}>
                {metrics.successRate.toFixed(1)}%
              </p>
            </div>
            <Target className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confiance moyenne</p>
              <p className={`text-2xl font-bold ${getMetricColor(metrics.averageConfidence, { good: 85, warning: 70 })}`}>
                {metrics.averageConfidence.toFixed(1)}%
              </p>
            </div>
            <BarChart className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Temps moyen</p>
              <p className={`text-2xl font-bold ${getMetricColor(5 - metrics.averageProcessingTime, { good: 3, warning: 2 })}`}>
                {metrics.averageProcessingTime.toFixed(1)}s
              </p>
            </div>
            <Clock className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Graphique de performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance IA (30 derniers jours)</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Analyses</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Confiance</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Erreurs</span>
            </div>
          </div>
        </div>

        <div className="h-64 flex items-end space-x-1">
          {performanceData.map((day, index) => (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center space-y-1">
                {/* Barres d'analyses */}
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(day.analyses / 10) * 60}px` }}
                  title={`${day.analyses} analyses`}
                />
                
                {/* Indicateur de confiance */}
                <div
                  className="w-full bg-green-500"
                  style={{ height: `${day.confidence * 20}px` }}
                  title={`${Math.round(day.confidence * 100)}% confiance`}
                />
                
                {/* Indicateur d'erreurs */}
                {day.errors > 0 && (
                  <div
                    className="w-full bg-red-500"
                    style={{ height: `${day.errors * 10}px` }}
                    title={`${day.errors} erreurs`}
                  />
                )}
              </div>
              
              {index % 5 === 0 && (
                <span className="text-xs text-gray-500 mt-2 transform -rotate-45">
                  {new Date(day.date).getDate()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualité des analyses</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Confiance {`>`} 90%</span>
              <span className="font-semibold text-green-600">67%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Confiance 70-90%</span>
              <span className="font-semibold text-yellow-600">28%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Confiance &lt; 70%</span>
              <span className="font-semibold text-red-600">5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Propositions clients</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Générées automatiquement</span>
              <span className="font-semibold text-blue-600">{metrics.propositionsGenerated}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Acceptées par clients</span>
              <span className="font-semibold text-green-600">
                {Math.round(metrics.propositionsGenerated * (metrics.clientAcceptanceRate / 100))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taux d'acceptation</span>
              <span className={`font-semibold ${getMetricColor(metrics.clientAcceptanceRate, { good: 75, warning: 60 })}`}>
                {metrics.clientAcceptanceRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes et recommandations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes et recommandations</h3>
        <div className="space-y-3">
          {metrics.errorRate > 10 && (
            <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="text-red-600 mr-3 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-red-800">Taux d'erreur élevé</p>
                <p className="text-sm text-red-700">
                  Le taux d'erreur ({metrics.errorRate.toFixed(1)}%) est supérieur au seuil recommandé (10%).
                  Vérifiez la qualité des PDF soumis.
                </p>
              </div>
            </div>
          )}

          {metrics.averageConfidence < 80 && (
            <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="text-yellow-600 mr-3 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-yellow-800">Confiance moyenne faible</p>
                <p className="text-sm text-yellow-700">
                  La confiance moyenne ({metrics.averageConfidence.toFixed(1)}%) pourrait être améliorée.
                  Entraînez le modèle avec plus de données.
                </p>
              </div>
            </div>
          )}

          {metrics.clientAcceptanceRate > 80 && (
            <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="text-green-600 mr-3 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-green-800">Excellente performance</p>
                <p className="text-sm text-green-700">
                  Le taux d'acceptation client ({metrics.clientAcceptanceRate.toFixed(1)}%) est excellent !
                  Continuez sur cette lancée.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};