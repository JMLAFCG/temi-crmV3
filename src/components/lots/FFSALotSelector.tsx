import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { FFSACategory, FFSALot, FFSA_CATEGORIES, useFFSAStore } from '../../types';
import { Button } from '../ui/Button';

interface FFSALotSelectorProps {
  onValidate: (selectedLots: string[]) => void;
}

export const FFSALotSelector: React.FC<FFSALotSelectorProps> = ({ onValidate }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { selectedLots, toggleLot } = useFFSAStore();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(current =>
      current.includes(categoryId)
        ? current.filter(id => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const handleValidate = () => {
    onValidate(selectedLots);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {FFSA_CATEGORIES.map(category => (
          <div key={category.id} className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50"
            >
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900">{category.code}</span>
                <span className="ml-4 text-gray-900">{category.name}</span>
              </div>
              {expandedCategories.includes(category.id) ? (
                <ChevronDown className="text-gray-500" />
              ) : (
                <ChevronRight className="text-gray-500" />
              )}
            </button>

            {expandedCategories.includes(category.id) && (
              <div className="border-t border-gray-200">
                {category.lots.map(lot => (
                  <div
                    key={lot.id}
                    className="flex items-start px-6 py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleLot(lot.id)}
                  >
                    <div className="flex-shrink-0 pt-1">
                      <div
                        className={`w-5 h-5 rounded border ${
                          selectedLots.includes(lot.id)
                            ? 'bg-red-600 border-red-600'
                            : 'border-gray-300'
                        } flex items-center justify-center`}
                      >
                        {selectedLots.includes(lot.id) && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{lot.code}</span>
                        <span className="ml-2 text-gray-900">{lot.name}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{lot.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedLots.length} lot{selectedLots.length !== 1 ? 's' : ''} sélectionné
            {selectedLots.length !== 1 ? 's' : ''}
          </div>
          <Button variant="primary" onClick={handleValidate} disabled={selectedLots.length === 0}>
            Valider la sélection
          </Button>
        </div>
      </div>
    </div>
  );
};
