import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import {
  CONSTRUCTION_ACTIVITIES,
  INTELLECTUAL_SERVICES,
  ADDITIONAL_SERVICES,
} from '../../config/activities';

interface ActivitySelectorProps {
  selectedActivities: string[];
  selectedIntellectualServices: string[];
  selectedAdditionalServices: string[];
  onActivityChange: (id: string, type: 'activities' | 'intellectual' | 'additional') => void;
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  selectedActivities,
  selectedIntellectualServices,
  selectedAdditionalServices,
  onActivityChange,
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['construction']);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(current =>
      current.includes(sectionId) ? current.filter(id => id !== sectionId) : [...current, sectionId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(current =>
      current.includes(categoryId)
        ? current.filter(id => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const getSelectedCount = (type: 'activities' | 'intellectual' | 'additional') => {
    switch (type) {
      case 'activities':
        return selectedActivities.length;
      case 'intellectual':
        return selectedIntellectualServices.length;
      case 'additional':
        return selectedAdditionalServices.length;
      default:
        return 0;
    }
  };

  const isSelected = (id: string, type: 'activities' | 'intellectual' | 'additional') => {
    switch (type) {
      case 'activities':
        return selectedActivities.includes(id);
      case 'intellectual':
        return selectedIntellectualServices.includes(id);
      case 'additional':
        return selectedAdditionalServices.includes(id);
      default:
        return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Activités du bâtiment */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('construction')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-50 to-secondary-50 hover:from-primary-100 hover:to-secondary-100 transition-all duration-200 border-b border-primary-100"
        >
          <div className="flex items-center">
            <span className="text-lg font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Activités du bâtiment
            </span>
            {getSelectedCount('activities') > 0 && (
              <span className="ml-3 px-3 py-1 text-xs font-medium bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full shadow-md">
                {getSelectedCount('activities')} sélectionnée
                {getSelectedCount('activities') > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {expandedSections.includes('construction') ? (
            <ChevronDown className="text-primary-600" size={20} />
          ) : (
            <ChevronRight className="text-primary-600" size={20} />
          )}
        </button>

        {expandedSections.includes('construction') && (
          <div className="border-t border-gray-200">
            {Object.entries(CONSTRUCTION_ACTIVITIES).map(([categoryKey, category]) => (
              <div key={categoryKey} className="border-b border-gray-100 last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full px-6 py-3 flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 transition-all duration-200"
                >
                  <span className="text-sm font-medium text-construction-orange">
                    {category.title}
                  </span>
                  {expandedCategories.includes(categoryKey) ? (
                    <ChevronDown className="text-construction-orange" size={16} />
                  ) : (
                    <ChevronRight className="text-construction-orange" size={16} />
                  )}
                </button>

                {expandedCategories.includes(categoryKey) && (
                  <div className="bg-white">
                    {category.activities.map(activity => (
                      <div
                        key={activity.id}
                        className="flex items-start px-6 py-3 hover:bg-gradient-to-r hover:from-primary-25 hover:to-secondary-25 cursor-pointer border-b border-gray-50 last:border-b-0 transition-all duration-200"
                        onClick={() => onActivityChange(activity.id, 'activities')}
                      >
                        <div className="flex-shrink-0 pt-1">
                          <div
                            className={`w-5 h-5 rounded border ${
                              isSelected(activity.id, 'activities')
                                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 border-primary-500 shadow-md'
                                : 'border-gray-300'
                            } flex items-center justify-center`}
                          >
                            {isSelected(activity.id, 'activities') && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {activity.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 block mt-1">
                            Code {activity.id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Services intellectuels */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('intellectual')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-secondary-50 to-accent-50 hover:from-secondary-100 hover:to-accent-100 transition-all duration-200 border-b border-secondary-100"
        >
          <div className="flex items-center">
            <span className="text-lg font-semibold bg-gradient-to-r from-secondary-600 to-accent-600 bg-clip-text text-transparent">
              Services intellectuels
            </span>
            {getSelectedCount('intellectual') > 0 && (
              <span className="ml-3 px-3 py-1 text-xs font-medium bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-full shadow-md">
                {getSelectedCount('intellectual')} sélectionné
                {getSelectedCount('intellectual') > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {expandedSections.includes('intellectual') ? (
            <ChevronDown className="text-secondary-600" size={20} />
          ) : (
            <ChevronRight className="text-secondary-600" size={20} />
          )}
        </button>

        {expandedSections.includes('intellectual') && (
          <div className="border-t border-gray-200">
            {Object.entries(INTELLECTUAL_SERVICES).map(([categoryKey, category]) => (
              <div key={categoryKey} className="border-b border-gray-100 last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggleCategory(`intellectual-${categoryKey}`)}
                  className="w-full px-6 py-3 flex items-center justify-between bg-gradient-to-r from-teal-50 to-blue-50 hover:from-teal-100 hover:to-blue-100 transition-all duration-200"
                >
                  <span className="text-sm font-medium text-construction-teal">
                    {category.title}
                  </span>
                  {expandedCategories.includes(`intellectual-${categoryKey}`) ? (
                    <ChevronDown className="text-construction-teal" size={16} />
                  ) : (
                    <ChevronRight className="text-construction-teal" size={16} />
                  )}
                </button>

                {expandedCategories.includes(`intellectual-${categoryKey}`) && (
                  <div className="bg-white">
                    {category.services.map(service => (
                      <div
                        key={service.id}
                        className="flex items-start px-6 py-3 hover:bg-gradient-to-r hover:from-secondary-25 hover:to-accent-25 cursor-pointer border-b border-gray-50 last:border-b-0 transition-all duration-200"
                        onClick={() => onActivityChange(service.id, 'intellectual')}
                      >
                        <div className="flex-shrink-0 pt-1">
                          <div
                            className={`w-5 h-5 rounded border ${
                              isSelected(service.id, 'intellectual')
                                ? 'bg-gradient-to-r from-secondary-500 to-accent-500 border-secondary-500 shadow-md'
                                : 'border-gray-300'
                            } flex items-center justify-center`}
                          >
                            {isSelected(service.id, 'intellectual') && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {service.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 block mt-1">
                            Code {service.id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Services additionnels */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('additional')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-success-50 to-accent-50 hover:from-success-100 hover:to-accent-100 transition-all duration-200 border-b border-success-100"
        >
          <div className="flex items-center">
            <span className="text-lg font-semibold bg-gradient-to-r from-success-600 to-accent-600 bg-clip-text text-transparent">
              Services additionnels
            </span>
            {getSelectedCount('additional') > 0 && (
              <span className="ml-3 px-3 py-1 text-xs font-medium bg-gradient-to-r from-success-500 to-accent-500 text-white rounded-full shadow-md">
                {getSelectedCount('additional')} sélectionné
                {getSelectedCount('additional') > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {expandedSections.includes('additional') ? (
            <ChevronDown className="text-success-600" size={20} />
          ) : (
            <ChevronRight className="text-success-600" size={20} />
          )}
        </button>

        {expandedSections.includes('additional') && (
          <div className="border-t border-gray-200">
            {Object.entries(ADDITIONAL_SERVICES).map(([categoryKey, category]) => (
              <div key={categoryKey} className="border-b border-gray-100 last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggleCategory(`additional-${categoryKey}`)}
                  className="w-full px-6 py-3 flex items-center justify-between bg-gradient-to-r from-green-50 to-yellow-50 hover:from-green-100 hover:to-yellow-100 transition-all duration-200"
                >
                  <span className="text-sm font-medium text-construction-green">
                    {category.title}
                  </span>
                  {expandedCategories.includes(`additional-${categoryKey}`) ? (
                    <ChevronDown className="text-construction-green" size={16} />
                  ) : (
                    <ChevronRight className="text-construction-green" size={16} />
                  )}
                </button>

                {expandedCategories.includes(`additional-${categoryKey}`) && (
                  <div className="bg-white">
                    {category.services.map(service => (
                      <div
                        key={service.id}
                        className="flex items-start px-6 py-3 hover:bg-gradient-to-r hover:from-success-25 hover:to-accent-25 cursor-pointer border-b border-gray-50 last:border-b-0 transition-all duration-200"
                        onClick={() => onActivityChange(service.id, 'additional')}
                      >
                        <div className="flex-shrink-0 pt-1">
                          <div
                            className={`w-5 h-5 rounded border ${
                              isSelected(service.id, 'additional')
                                ? 'bg-gradient-to-r from-success-500 to-accent-500 border-success-500 shadow-md'
                                : 'border-gray-300'
                            } flex items-center justify-center`}
                          >
                            {isSelected(service.id, 'additional') && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {service.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 block mt-1">
                            Code {service.id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Résumé des sélections */}
      {(getSelectedCount('activities') > 0 ||
        getSelectedCount('intellectual') > 0 ||
        getSelectedCount('additional') > 0) && (
        <div className="bg-gradient-to-r from-primary-50 via-secondary-50 to-accent-50 border border-primary-200 rounded-2xl p-4 shadow-lg">
          <h4 className="text-sm font-medium bg-gradient-to-r from-primary-700 to-secondary-700 bg-clip-text text-transparent mb-2">
            Résumé de votre sélection
          </h4>
          <div className="flex flex-wrap gap-2 text-sm">
            {getSelectedCount('activities') > 0 && (
              <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full shadow-md">
                {getSelectedCount('activities')} activité
                {getSelectedCount('activities') > 1 ? 's' : ''} du bâtiment
              </span>
            )}
            {getSelectedCount('intellectual') > 0 && (
              <span className="px-3 py-1 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-full shadow-md">
                {getSelectedCount('intellectual')} service
                {getSelectedCount('intellectual') > 1 ? 's' : ''} intellectuel
                {getSelectedCount('intellectual') > 1 ? 's' : ''}
              </span>
            )}
            {getSelectedCount('additional') > 0 && (
              <span className="px-3 py-1 bg-gradient-to-r from-success-500 to-accent-500 text-white rounded-full shadow-md">
                {getSelectedCount('additional')} service
                {getSelectedCount('additional') > 1 ? 's' : ''} additionnel
                {getSelectedCount('additional') > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
