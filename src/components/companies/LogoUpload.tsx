import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface LogoUploadProps {
  companyId: string;
  currentLogo?: {
    url: string;
    alt: string;
  };
  onLogoUpdate: (logoData: { url: string; alt: string }) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ companyId, currentLogo, onLogoUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image (PNG, JPG, GIF)');
      return;
    }

    // Vérification de la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 2MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload du fichier dans le bucket Storage
      const fileName = `company-logos/${companyId}/${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('public')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Récupération de l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from('public').getPublicUrl(fileName);

      // Mise à jour des informations du logo
      const logoData = {
        url: publicUrl,
        alt: `Logo ${file.name}`,
        uploaded_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo: logoData })
        .eq('id', companyId);

      if (updateError) throw updateError;

      onLogoUpdate({ url: publicUrl, alt: `Logo ${file.name}` });
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Une erreur est survenue lors du téléchargement du logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          logo: {
            url: null,
            alt: null,
            uploaded_at: null,
          },
        })
        .eq('id', companyId);

      if (updateError) throw updateError;

      onLogoUpdate({ url: '', alt: '' });
    } catch (err) {
      console.error('Error removing logo:', err);
      setError('Une erreur est survenue lors de la suppression du logo');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Logo de l'entreprise</h3>
        {currentLogo?.url && (
          <Button variant="outline" size="sm" leftIcon={<X size={16} />} onClick={handleRemoveLogo}>
            Supprimer
          </Button>
        )}
      </div>

      {currentLogo?.url ? (
        <div className="relative w-32 h-32">
          <img
            src={currentLogo.url}
            alt={currentLogo.alt}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      ) : (
        <div className="flex justify-center items-center w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF</p>
            <p className="mt-1 text-xs text-gray-500">Max 2MB</p>
          </div>
        </div>
      )}

      <div>
        <input
          type="file"
          id="logo-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <Button
          variant="outline"
          fullWidth
          leftIcon={<Upload size={16} />}
          onClick={() => document.getElementById('logo-upload')?.click()}
          isLoading={isUploading}
        >
          {currentLogo?.url ? 'Modifier le logo' : 'Ajouter un logo'}
        </Button>
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};
