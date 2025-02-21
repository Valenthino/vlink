'use client';

import React from 'react';
import { Camera, StopCircle, SwitchCamera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [cameras, setCameras] = React.useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = React.useState<string>('');
  const animationFrameId = React.useRef<number>();

  const startScanning = React.useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          deviceId: currentCamera || undefined,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        scanQRCode();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      onError?.(err instanceof Error ? err.message : 'Failed to access camera');
    }
  }, [currentCamera, onError]);

  const stopScanning = React.useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsScanning(false);
  }, []);

  const switchCamera = React.useCallback(() => {
    const currentIndex = cameras.findIndex(camera => camera.deviceId === currentCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setCurrentCamera(cameras[nextIndex]?.deviceId || '');
  }, [cameras, currentCamera]);

  const scanQRCode = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR code detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      // QR code found
      onScan(code.data);
      stopScanning();
    } else {
      // Continue scanning
      animationFrameId.current = requestAnimationFrame(scanQRCode);
    }
  }, [isScanning, onScan, stopScanning]);

  React.useEffect(() => {
    if (currentCamera) {
      stopScanning();
      startScanning();
    }
  }, [currentCamera, startScanning, stopScanning]);

  React.useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <div className="relative">
      <AnimatePresence>
        {isScanning ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative rounded-lg overflow-hidden"
          >
            <video
              ref={videoRef}
              className="w-full max-w-sm rounded-lg"
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <button
                onClick={stopScanning}
                className="p-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full shadow-lg transition-colors"
              >
                <StopCircle className="w-6 h-6" />
              </button>
              {cameras.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transition-colors"
                >
                  <SwitchCamera className="w-6 h-6" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={startScanning}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span>Scan QR Code</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
} 