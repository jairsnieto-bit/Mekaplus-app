import { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import toast from 'react-hot-toast';

const GuideEvidenceModal = ({ guide, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ✅ Verificar si hay evidencia
  const hasEvidence = guide?.evidenceImage;

  // ✅ Construir URL completa de la imagen
  const imageUrl = hasEvidence 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${guide.evidenceImage}`
    : null;

  // ✅ Descargar imagen
  const handleDownload = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `guia-${guide.guideNumber}-firmada.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Guía descargada correctamente');
    } catch (error) {
      toast.error('Error al descargar la guía');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Zoom in
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  // ✅ Zoom out
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  // ✅ Reset zoom
  const handleResetZoom = () => {
    setZoom(1);
  };

  if (!guide) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Guía Firmada - {guide.guideNumber}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Evidencia de entrega/devolución
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info de la guía */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Número de Guía</p>
              <p className="text-sm font-bold text-blue-900">{guide.guideNumber}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Estado</p>
              <p className="text-sm font-bold text-green-900">{guide.estado}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-purple-600 font-medium">Fecha</p>
              <p className="text-sm font-bold text-purple-900">
                {guide.fechaEntrega 
                  ? new Date(guide.fechaEntrega).toLocaleDateString('es-CO')
                  : new Date(guide.updatedAt).toLocaleDateString('es-CO')}
              </p>
            </div>
          </div>

          {/* Imagen */}
          {hasEvidence ? (
            <div className="space-y-4">
              {/* Controles */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Alejar"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Acercar"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {loading ? 'Descargando...' : 'Descargar Guía Firmada'}
                </button>
              </div>

              {/* Imagen con zoom */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                {loading && (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  </div>
                )}
                {error && (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <p className="text-red-600 font-medium mb-2">Error al cargar la imagen</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Recargar
                      </button>
                    </div>
                  </div>
                )}
                <div 
                  className="overflow-auto max-h-[600px] flex items-center justify-center"
                  style={{ minHeight: '400px' }}
                >
                  <img
                    src={imageUrl}
                    alt={`Guía ${guide.guideNumber}`}
                    className="max-w-full"
                    style={{ 
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.2s ease-in-out'
                    }}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      setError(true);
                    }}
                  />
                </div>
              </div>

              {/* Leyenda */}
              <p className="text-xs text-gray-500 text-center">
                💡 Usa los botones de zoom para ver detalles o descarga la imagen completa
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-gray-500 font-medium mb-2">No hay evidencia disponible</p>
                <p className="text-sm text-gray-400">Esta guía no tiene imagen de firma cargada</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideEvidenceModal;