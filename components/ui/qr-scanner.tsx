'use client';

import React from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = React.useState(false);

  React.useEffect(() => {
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    async function startScanning() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setScanning(true);
          scanQRCode();
        }
      } catch (error) {
        onError('Failed to access camera: ' + (error instanceof Error ? error.message : String(error)));
      }
    }

    function scanQRCode() {
      if (!videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        onScan(code.data);
        stopScanning();
      } else {
        animationFrameId = requestAnimationFrame(scanQRCode);
      }
    }

    function stopScanning() {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setScanning(false);
    }

    startScanning();

    return () => {
      stopScanning();
    };
  }, [onScan, onError]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="rounded-lg max-w-full"
        style={{ display: scanning ? 'block' : 'none' }}
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
      {!scanning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <span className="text-white">Starting camera...</span>
        </div>
      )}
    </div>
  );
} 