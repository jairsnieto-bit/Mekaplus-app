import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { guideAPI, senderAPI } from '../services/api';
import { Search, X, Plus, ChevronDown, User, MapPin, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGuide = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // ✅ Estados para Remitente
  const [senders, setSenders] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState('');
  const [senderSearchTerm, setSenderSearchTerm] = useState('');
  const [filteredSenders, setFilteredSenders] = useState([]);
  const [isSenderSearchOpen, setIsSenderSearchOpen] = useState(false);
  
  // ✅ Estados para Destinatario (Búsqueda inteligente)
  const [existingRecipients, setExistingRecipients] = useState([]);
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [isRecipientSearchOpen, setIsRecipientSearchOpen] = useState(false);
  
  // ✅ Formulario
  const [formData, setFormData] = useState({
    razonSocial: '',
    localidad: '',
    direccion: '',
    identificacionUsuario: '',
    referenciaEntrega: '',
    fechaEntrega: '',
    horaEntrega: ''
  });
  
  const senderWrapperRef = useRef(null);
  const recipientWrapperRef = useRef(null);

  // ✅ Cargar datos al montar
  useEffect(() => {
    fetchSenders();
    fetchExistingRecipients();
  }, []);

  // ✅ Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (senderWrapperRef.current && !senderWrapperRef.current.contains(event.target)) {
        setIsSenderSearchOpen(false);
      }
      if (recipientWrapperRef.current && !recipientWrapperRef.current.contains(event.target)) {
        setIsRecipientSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Filtrar Remitentes
  useEffect(() => {
    if (senderSearchTerm.trim() === '') {
      setFilteredSenders([]);
    } else {
      const filtered = senders.filter(sender => 
        sender.name.toLowerCase().includes(senderSearchTerm.toLowerCase()) ||
        sender.nit?.toLowerCase().includes(senderSearchTerm.toLowerCase())
      );
      setFilteredSenders(filtered.slice(0, 10));
    }
  }, [senderSearchTerm, senders]);

  // ✅ Filtrar Destinatarios
  useEffect(() => {
    if (recipientSearchTerm.trim() === '') {
      setFilteredRecipients([]);
    } else {
      const filtered = existingRecipients.filter(rec => 
        rec.razonSocial.toLowerCase().includes(recipientSearchTerm.toLowerCase()) ||
        rec.direccion?.toLowerCase().includes(recipientSearchTerm.toLowerCase()) ||
        rec.identificacionUsuario?.includes(recipientSearchTerm)
      );
      setFilteredRecipients(filtered.slice(0, 10));
    }
  }, [recipientSearchTerm, existingRecipients]);

  const fetchSenders = async () => {
    try {
      const response = await senderAPI.getActive();
      setSenders(response.data);
      if (response.data.length > 0) {
        setSelectedSenderId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error cargando remitentes:', error);
    }
  };

  const fetchExistingRecipients = async () => {
    try {
      const response = await guideAPI.getExistingRecipients();
      setExistingRecipients(response.data);
    } catch (error) {
      console.error('Error cargando destinatarios:', error);
    }
  };

  // ✅ Manejar selección de Remitente
  const handleSelectSender = (sender) => {
    setSelectedSenderId(sender.id);
    setSenderSearchTerm(`${sender.name} (NIT: ${sender.nit})`);
    setIsSenderSearchOpen(false);
    toast.success(`Remitente: ${sender.name}`);
  };

  // ✅ Manejar selección de Destinatario (Autocompletar)
  const handleSelectRecipient = (recipient) => {
    setFormData({
      ...formData,
      razonSocial: recipient.razonSocial,
      direccion: recipient.direccion,
      localidad: recipient.localidad,
      identificacionUsuario: recipient.identificacionUsuario || ''
    });
    setRecipientSearchTerm(recipient.razonSocial);
    setIsRecipientSearchOpen(false);
    toast.success('Datos del destinatario cargados');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSenderId) {
      toast.error('Seleccione un remitente');
      return;
    }

    if (!formData.razonSocial || !formData.direccion) {
      toast.error('Complete los datos del destinatario');
      return;
    }

    setLoading(true);
    try {
      await guideAPI.create({
        ...formData,
        senderId: selectedSenderId
      });
      toast.success('Guía creada exitosamente');
      navigate('/guides');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear guía');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Guía</h1>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="card space-y-6">

          {/* ============================================ */}
          {/* ✅ SECCIÓN 1: REMITENTE */}
          {/* ============================================ */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Remitente
            </h2>
            
            <div className="relative" ref={senderWrapperRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={senderSearchTerm}
                  onChange={(e) => {
                    setSenderSearchTerm(e.target.value);
                    setIsSenderSearchOpen(true);
                  }}
                  onFocus={() => setIsSenderSearchOpen(true)}
                  placeholder="Buscar por nombre, NIT o dirección..."
                  className="input-field pl-10 pr-10"
                />
                {senderSearchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSenderSearchTerm('');
                      setSelectedSenderId('');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isSenderSearchOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-auto">
                  {filteredSenders.length > 0 ? (
                    <div className="py-2">
                      {filteredSenders.map((sender) => (
                        <button
                          key={sender.id}
                          type="button"
                          onClick={() => handleSelectSender(sender)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <p className="font-semibold text-gray-900">{sender.name}</p>
                          <p className="text-sm text-gray-600">NIT: {sender.nit}</p>
                        </button>
                      ))}
                    </div>
                  ) : senderSearchTerm ? (
                    <div className="p-4 text-gray-500 text-center">No se encontraron remitentes</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* ✅ SECCIÓN 2: DESTINATARIO */}
          {/* ============================================ */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-primary-600" />
              Destinatario
            </h2>

            <div className="space-y-4">
              {/* ✅ Búsqueda Inteligente de Destinatario */}
              <div className="relative" ref={recipientWrapperRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Destinatario Existente (Opcional)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={recipientSearchTerm}
                    onChange={(e) => {
                      setRecipientSearchTerm(e.target.value);
                      setIsRecipientSearchOpen(true);
                    }}
                    onFocus={() => setIsRecipientSearchOpen(true)}
                    placeholder="Escriba para buscar destinatarios anteriores..."
                    className="input-field pl-10 pr-10 bg-blue-50 border-blue-200 focus:ring-blue-500"
                  />
                  {recipientSearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setRecipientSearchTerm('');
                        setFormData({
                          ...formData,
                          razonSocial: '',
                          direccion: '',
                          localidad: '',
                          identificacionUsuario: ''
                        });
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown de resultados */}
                {isRecipientSearchOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-auto">
                    {filteredRecipients.length > 0 ? (
                      <div className="py-2">
                        {filteredRecipients.map((rec, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectRecipient(rec)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <p className="font-semibold text-gray-900">{rec.razonSocial}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {rec.direccion}
                              </span>
                              {rec.identificacionUsuario && (
                                <span className="flex items-center gap-1">
                                  <Hash className="w-3 h-3" /> {rec.identificacionUsuario}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : recipientSearchTerm ? (
                      <div className="p-4 text-gray-500 text-center">
                        No se encontraron destinatarios anteriores
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Campos del Destinatario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    name="razonSocial"
                    value={formData.razonSocial}
                    onChange={handleChange}
                    className="input-field"
                    required
                    placeholder="Nombre o razón social del destinatario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad/Localidad *
                  </label>
                  <input
                    type="text"
                    name="localidad"
                    value={formData.localidad}
                    onChange={handleChange}
                    className="input-field"
                    required
                    placeholder="Ciudad"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identificación/Código Usuario
                  </label>
                  <input
                    type="text"
                    name="identificacionUsuario"
                    value={formData.identificacionUsuario}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Código o ID"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="input-field"
                    required
                    placeholder="Dirección completa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Entrega
                  </label>
                  <input
                    type="date"
                    name="fechaEntrega"
                    value={formData.fechaEntrega}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Entrega
                  </label>
                  <input
                    type="time"
                    name="horaEntrega"
                    value={formData.horaEntrega}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referencia de Entrega
                  </label>
                  <textarea
                    name="referenciaEntrega"
                    value={formData.referenciaEntrega}
                    onChange={handleChange}
                    className="input-field"
                    rows="3"
                    placeholder="Punto de referencia, apartamento, etc."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creando...' : 'Crear Guía'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/guides')}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGuide;