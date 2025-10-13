import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '../ui/Button';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  onChange: (signature: string | null) => void;
  error?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onChange, error }) => {
  const signaturePad = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    if (signaturePad.current) {
      signaturePad.current.clear();
      onChange(null);
    }
  };

  const handleEnd = () => {
    if (signaturePad.current) {
      const signatureData = signaturePad.current.toDataURL();
      onChange(signatureData);
    }
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <SignatureCanvas
          ref={signaturePad}
          canvasProps={{
            className: 'w-full h-48 bg-white',
          }}
          onEnd={handleEnd}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Eraser size={16} />}
          onClick={handleClear}
        >
          Effacer
        </Button>
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
