import { useEffect, useState } from 'react';
import jsQR from 'jsqr';
import { QRCodeSVG } from 'qrcode.react';

import { LoadingSpinner } from '../LoadingSpinner';

export type VectorQrCodeProps = {
  value?: string;
  imageSrc: string;
  size?: number;
  title?: string;
  className?: string;
  fallbackClassName?: string;
  onDecodeError?: (error: Error) => void;
};

async function decodeQrImage(imageSrc: string): Promise<string> {
  const response = await fetch(imageSrc);
  if (!response.ok) throw new Error('Não foi possível carregar a imagem do QR Code.');

  const bitmap = await createImageBitmap(await response.blob());
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Não foi possível preparar a leitura do QR Code.');

  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });
  if (!decoded?.data) throw new Error('A imagem recebida não contém um QR Code válido.');
  return decoded.data;
}

export function VectorQrCode({
  value,
  imageSrc,
  size = 189,
  title = 'QR Code',
  className = '',
  fallbackClassName = '',
  onDecodeError,
}: VectorQrCodeProps) {
  const [decodedValue, setDecodedValue] = useState(value ?? '');
  const [decodeFailed, setDecodeFailed] = useState(false);

  useEffect(() => {
    if (value) {
      setDecodedValue(value);
      setDecodeFailed(false);
      return;
    }

    let active = true;
    setDecodedValue('');
    setDecodeFailed(false);
    decodeQrImage(imageSrc)
      .then((result) => {
        if (active) setDecodedValue(result);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        const error = cause instanceof Error ? cause : new Error('Falha ao converter o QR Code.');
        setDecodeFailed(true);
        onDecodeError?.(error);
      });

    return () => {
      active = false;
    };
  }, [imageSrc, onDecodeError, value]);

  if (decodedValue) {
    return (
      <QRCodeSVG
        className={className}
        value={decodedValue}
        size={size}
        level="M"
        marginSize={0}
        bgColor="transparent"
        fgColor="var(--Contextual-Icon-Default-body, #000)"
        title={title}
      />
    );
  }

  if (decodeFailed) {
    return <img className={fallbackClassName} src={imageSrc} alt={title} />;
  }

  return <LoadingSpinner size="lg" intent="Neutral" aria-label="Preparando QR Code" />;
}
