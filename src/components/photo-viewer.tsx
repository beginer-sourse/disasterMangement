import React from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { Button } from './ui/button';

interface PhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt?: string;
}

export function PhotoViewer({ isOpen, onClose, imageUrl, imageAlt = 'Disaster report image' }: PhotoViewerProps) {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (isOpen) {
      // Reset transformations when opening
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      // Prevent body scroll when viewer is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when viewer is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, scale, rotation]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `disaster-report-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 text-white hover:bg-opacity-90 rounded-full"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Controls */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="bg-black bg-opacity-70 text-white hover:bg-opacity-90 rounded-full"
          title="Zoom In (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="bg-black bg-opacity-70 text-white hover:bg-opacity-90 rounded-full"
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRotate}
          className="bg-black bg-opacity-70 text-white hover:bg-opacity-90 rounded-full"
          title="Rotate (R)"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          className="bg-black bg-opacity-70 text-white hover:bg-opacity-90 rounded-full"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <div
          className="relative max-w-full max-h-full overflow-hidden cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            draggable={false}
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', imageUrl);
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-70 px-4 py-2 rounded-full">
        Use mouse wheel to zoom • Drag to pan • R to rotate • ESC to close
      </div>
    </div>
  );
}
