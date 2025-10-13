import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: string) => void;
  onClose: () => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture, onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onPhotoCapture(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef, onPhotoCapture]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onPhotoCapture(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Ajouter une photo</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {showCamera ? (
          <div className="space-y-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg"
            />
            <div className="flex justify-center space-x-4">
              <Button variant="primary" onClick={capture} leftIcon={<Camera size={20} />}>
                Prendre une photo
              </Button>
              <Button variant="outline" onClick={() => setShowCamera(false)}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
              <ImageIcon size={48} className="text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 text-center mb-4">
                Choisissez une méthode pour ajouter une photo
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="primary"
                  onClick={() => setShowCamera(true)}
                  leftIcon={<Camera size={20} />}
                >
                  Utiliser la caméra
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<ImageIcon size={20} />}
                >
                  Parcourir
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
