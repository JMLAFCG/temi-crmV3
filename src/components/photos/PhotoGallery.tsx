import React from 'react';
import { Trash2, ZoomIn } from 'lucide-react';
import { Photo } from '../../types';

interface PhotoGalleryProps {
  photos: Photo[];
  onDeletePhoto: (photoId: string) => void;
  onViewPhoto: (photo: Photo) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onDeletePhoto,
  onViewPhoto,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map(photo => (
        <div key={photo.id} className="relative group rounded-lg overflow-hidden">
          <img
            src={photo.url}
            alt={photo.caption || 'Photo du chantier'}
            className="w-full h-32 object-cover"
          />

          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <button
              onClick={() => onViewPhoto(photo)}
              className="p-2 bg-white rounded-full text-gray-800 hover:text-blue-600 transition-colors"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => onDeletePhoto(photo.id)}
              className="p-2 bg-white rounded-full text-gray-800 hover:text-red-600 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {photo.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {photo.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
