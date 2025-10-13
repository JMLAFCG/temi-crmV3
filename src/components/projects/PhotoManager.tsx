import React, { useState, useCallback } from 'react';
import { Camera, Upload, X, Edit2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { PhotoCapture } from '../photos/PhotoCapture';
import { PhotoGallery } from '../photos/PhotoGallery';
import { Photo } from '../../types';

interface PhotoManagerProps {
  photos: Photo[];
  onAddPhoto: (photo: Photo) => void;
  onDeletePhoto: (photoId: string) => void;
  onUpdatePhoto: (photoId: string, updates: Partial<Photo>) => void;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  photos,
  onAddPhoto,
  onDeletePhoto,
  onUpdatePhoto,
}) => {
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePhotoCapture = (photoData: string) => {
    const newPhoto: Photo = {
      id: crypto.randomUUID(),
      url: photoData,
      caption: '',
      timestamp: new Date().toISOString(),
    };
    onAddPhoto(newPhoto);
    setShowPhotoCapture(false);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        const newPhoto: Photo = {
          id: crypto.randomUUID(),
          url: photoData,
          caption: file.name,
          timestamp: new Date().toISOString(),
        };
        onAddPhoto(newPhoto);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Photos du projet</h3>
        <div className="flex gap-3">
          <input
            type="file"
            id="photo-upload"
            className="hidden"
            accept="image/*"
            multiple
            onChange={e => handleFileUpload(e.target.files)}
          />
          <Button
            variant="outline"
            leftIcon={<Upload size={16} />}
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            Importer
          </Button>
          <Button
            variant="primary"
            leftIcon={<Camera size={16} />}
            onClick={() => setShowPhotoCapture(true)}
          >
            Prendre une photo
          </Button>
        </div>
      </div>

      <div
        className={`relative ${photos.length === 0 ? 'min-h-[200px]' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-primary-50 border-2 border-dashed border-primary-300 rounded-lg flex items-center justify-center z-10">
            <p className="text-primary-600 font-medium">Déposez vos photos ici</p>
          </div>
        )}

        {photos.length > 0 ? (
          <PhotoGallery
            photos={photos}
            onDeletePhoto={onDeletePhoto}
            onViewPhoto={setSelectedPhoto}
          />
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Camera size={48} className="mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Aucune photo ajoutée</p>
            <p className="text-sm text-gray-500">
              Prenez des photos, importez-les ou glissez-déposez les ici
            </p>
          </div>
        )}
      </div>

      {showPhotoCapture && (
        <PhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onClose={() => setShowPhotoCapture(false)}
        />
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Détails de la photo</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption || 'Photo du projet'}
                  className="w-full rounded-lg"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit2 size={16} />}
                    onClick={() => {
                      const caption = prompt('Modifier la légende:', selectedPhoto.caption);
                      if (caption !== null) {
                        onUpdatePhoto(selectedPhoto.id, { caption });
                      }
                    }}
                  >
                    Modifier la légende
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      onDeletePhoto(selectedPhoto.id);
                      setSelectedPhoto(null);
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  {selectedPhoto.caption || 'Sans légende'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Ajoutée le{' '}
                  {new Date(selectedPhoto.timestamp).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
