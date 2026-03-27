import { useState, useRef } from 'react';
import { guideAPI } from '../services/api';
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const GuideStatusModal = ({ guide, onClose, onSuccess }) => {
  const [newStatus, setNewStatus] = useState(guide.estado);
  const [observation, setObservation] = useState('');
  const [deliveryType, setDeliveryType] = useState('');
  const [evidenceImage, setEvidenceImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ OPCIONES DE TIPO DE ENTREGA
  const deliveryTypeOptions = {
    ENTREGADA: [
      { value: 'ENTREGA_EFECTIVA', label: '🟢 Entrega Efectiva' },
      { value: 'INTENTO_ENTREGA', label: '🟡 Intento de Entrega' }
    ],
    DEVUELTA: [
      { value: 'DEV_DIR_INCOMPLETA', label: '📍 Dirección Incompleta' },
      { value: 'DEV_DESCONOCIDO', label: '👤 Destinatario Desconocido' },
      { value: 'DEV_NO_EXISTE', label: '🏠 Dirección No Existe' },
      { value: 'DEV_CAMBIO_DOMICILIO', label: '🔄 Cambio de Domicilio' },
      { value: 'DEV_OTROS', label: '📦 Otros Motivos' },
      { value: 'DEV_FALLECIDO', label: '⚰️ Destinatario Fallecido' },
      { value: 'DEV_NO_RECIBIDA', label: '❌ No Recibida' }
    ]
  };

  // ✅ ¿Mostrar campo Tipo de Entrega?
  const showDeliveryType = ['ENTREGADA', 'DEVUELTA'].includes(newStatus);
  
  // ✅ ¿Requiere evidencia fotográfica?
  const requiresEvidence = ['ENTREGADA', 'DEVUELTA'].includes(newStatus);

  // ✅ Limpiar deliveryType cuando cambia el estado
  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
    setDeliveryType('');
  };

 // ✅ Manejar selección de imagen
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      
      console.log('📁 Archivo seleccionado:', file);
      
      if (!file) return;

      // ✅ Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Solo se permiten imágenes (JPG, PNG, GIF)');
        e.target.value = '';
        return;
      }

      // ✅ Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        e.target.value = '';
        return;
      }

      setEvidenceImage(file);
      console.log('✅ Imagen guardada en estado:', file.name);
      
      // ✅ Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    };

  // ✅ Eliminar imagen seleccionada
  const removeImage = () => {
    setEvidenceImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // ✅ Validación: Tipo de Entrega obligatorio cuando aplica
  if (showDeliveryType && !deliveryType) {
    toast.error('Seleccione el Tipo de Entrega');
    return;
  }

  // ✅ Validación: Evidencia fotográfica obligatoria cuando aplica
  if (requiresEvidence && !evidenceImage) {
    toast.error('La evidencia fotográfica es obligatoria para este estado');
    return;
  }
  
  // ✅ Validación: Observación siempre obligatoria
  if (!observation.trim()) {
    toast.error('La observación es obligatoria');
    return;
  }

  setLoading(true);
  
  try {
    // ✅ Crear FormData para enviar archivo + datos
    const formData = new FormData();
    formData.append('status', newStatus);
    formData.append('observation', observation.trim());
    if (deliveryType) {
      formData.append('deliveryType', deliveryType);
    }
    
    // ✅ AGREGAR imagen SOLO si existe
    if (evidenceImage) {
      formData.append('evidenceImage', evidenceImage);
      console.log('📤 Imagen adjunta:', {
        name: evidenceImage.name,
        type: evidenceImage.type,
        size: evidenceImage.size
      });
    } else {
      console.error('❌ ERROR: evidenceImage es null');
    }

    // ✅ Verificar FormData
    console.log('📤 Enviando FormData...');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    // ✅ Enviar con config especial para FormData
    await guideAPI.updateStatus(guide.id, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    toast.success('Estado actualizado correctamente');
    onSuccess?.();
    onClose();
  } catch (error) {
    console.error('❌ Error completo:', error);
    console.error('❌ Response:', error.response);
    toast.error(error.response?.data?.error || 'Error al actualizar estado');
  } finally {
    setLoading(false);
  }
};

  const statusOptions = [
    { value: 'PENDIENTE', label: '🟡 Pendiente' },
    { value: 'EN_TRANSITO', label: '🔵 En Tránsito' },
    { value: 'ENTREGADA', label: '🟢 Entregada' },
    { value: 'DEVUELTA', label: '🔴 Devuelta' },
    { value: 'CANCELADA', label: '⚫ Cancelada' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Cambiar Estado - Guía {guide.guideNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nuevo Estado *
            </label>
            <select
              value={newStatus}
              onChange={handleStatusChange}
              className="input-field w-full"
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Tipo de Entrega (Condicional) */}
          {showDeliveryType && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Entrega *
              </label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value)}
                className="input-field w-full"
                required={showDeliveryType}
              >
                <option value="">Seleccione una opción...</option>
                {deliveryTypeOptions[newStatus]?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {newStatus === 'ENTREGADA' 
                  ? 'Clasifique el resultado de la entrega'
                  : 'Seleccione el motivo de la devolución'}
              </p>
            </div>
          )}

          {/* ✅ NUEVO: EVIDENCIA FOTOGRÁFICA (Condicional) */}
          {requiresEvidence && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <label className="block text-sm font-semibold text-blue-900">
                  Evidencia Fotográfica *
                </label>
                <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                  Obligatoria
                </span>
              </div>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-colors"
                >
                  <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-blue-700 font-medium">
                    Click para subir imagen
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    JPG, PNG o GIF (Máx. 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Evidencia"
                    className="w-full h-48 object-cover rounded-lg border border-blue-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-blue-700 mt-2">
                    ✅ Imagen seleccionada: {evidenceImage?.name}
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleImageChange}
                className="hidden"
                required={requiresEvidence}
              />

              {/* Mensaje de ayuda */}
              <div className="flex items-start gap-2 mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  {newStatus === 'ENTREGADA' 
                    ? 'Subir foto de la guía firmada por el cliente'
                    : 'Subir foto de la guía firmada por el mensajero'}
                </p>
              </div>
            </div>
          )}

          {/* Observación */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observación *
            </label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Describa detalles del cambio de estado..."
              className="input-field w-full min-h-[100px] resize-none"
              required
            />
          </div>

          {/* Info contextual */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Guía:</strong> {guide.guideNumber}<br/>
              <strong>Destinatario:</strong> {guide.razonSocial}<br/>
              <strong>Estado actual:</strong> {guide.estado}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                'Actualizar Estado'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuideStatusModal;