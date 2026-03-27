import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { guideAPI, senderAPI } from '../services/api';
import { Search, X, Plus, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGuide = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    razonSocial: '',
    localidad: '',
    direccion: '',
    identificacionUsuario: '',
    referenciaEntrega: '',
    fechaEntrega: '',
    horaEntrega: ''
  });
  
  // ✅ Estados para remitentes
  const [senders, setSenders] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSenders, setFilteredSenders] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNewSenderForm, setShowNewSenderForm] = useState(false);
  const [newSender, setNewSender] = useState({
    name: '',
    nit: '',
    address: '',
    phone: '',
    email: '',
    department: ''
  });
  
  const searchWrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // ✅ Cargar remitentes al montar
  useEffect(() => {
    fetchSenders();
  }, []);

  // ✅ Cerrar búsqueda al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Filtrar remitentes mientras escribe
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSenders([]);
    } else {
      const filtered = senders.filter(sender => 
        sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sender.nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sender.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSenders(filtered.slice(0, 10)); // Máximo 10 resultados
    }
  }, [searchTerm, senders]);

  const fetchSenders = async () => {
    try {
      const response = await senderAPI.getActive();
      setSenders(response.data);
      if (response.data.length > 0) {
        setSelectedSenderId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error cargando remitentes:', error);
      toast.error('No se pudieron cargar los remitentes');
    }
  };

  const handleSelectSender = (sender) => {
    setSelectedSenderId(sender.id);
    setSearchTerm(`${sender.name} (NIT: ${sender.nit})`);
    setIsSearchOpen(false);
    
    // ✅ Autocompletar campos del formulario
    setFormData(prev => ({
      ...prev,
      razonSocial: sender.name,
      direccion: sender.address,
      localidad: sender.department || prev.localidad
    }));
    
    toast.success(`Remitente seleccionado: ${sender.name}`);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredSenders([]);
    setSelectedSenderId('');
    searchInputRef.current?.focus();
  };

  const handleCreateNewSender = async () => {
    try {
      const response = await senderAPI.create(newSender);
      setSenders([...senders, response.data]);
      handleSelectSender(response.data);
      setShowNewSenderForm(false);
      setNewSender({
        name: '',
        nit: '',
        address: '',
        phone: '',
        email: '',
        department: ''
      });
      toast.success('Remitente creado exitosamente');
    } catch (error) {
      toast.error('Error al crear remitente');
      console.error(error);
    }
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

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="card space-y-6">

          {/* ✅ NUEVO: Búsqueda Inteligente de Remitente */}
          <div className="mb-4" ref={searchWrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remitente *
            </label>
            
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Buscar por nombre, NIT o dirección..."
                  className="input-field pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* ✅ Dropdown de resultados */}
              {isSearchOpen && (
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
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{sender.name}</p>
                              <p className="text-sm text-gray-600">NIT: {sender.nit}</p>
                              <p className="text-sm text-gray-500">{sender.address}</p>
                              {sender.phone && (
                                <p className="text-xs text-gray-400 mt-1">📞 {sender.phone}</p>
                              )}
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 transform -rotate-90" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchTerm ? (
                    <div className="p-4">
                      <p className="text-gray-500 text-center mb-3">
                        No se encontraron remitentes
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowNewSenderForm(true)}
                        className="w-full px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Crear nuevo remitente
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* ✅ Formulario para crear nuevo remitente */}
            {showNewSenderForm && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">Nuevo Remitente</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nombre/Razón Social *
                    </label>
                    <input
                      type="text"
                      value={newSender.name}
                      onChange={(e) => setNewSender({...newSender, name: e.target.value})}
                      className="input-field text-sm"
                      placeholder="Nombre completo o razón social"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      NIT
                    </label>
                    <input
                      type="text"
                      value={newSender.nit}
                      onChange={(e) => setNewSender({...newSender, nit: e.target.value})}
                      className="input-field text-sm"
                      placeholder="NIT"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={newSender.phone}
                      onChange={(e) => setNewSender({...newSender, phone: e.target.value})}
                      className="input-field text-sm"
                      placeholder="Teléfono"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={newSender.address}
                      onChange={(e) => setNewSender({...newSender, address: e.target.value})}
                      className="input-field text-sm"
                      placeholder="Dirección completa"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newSender.email}
                      onChange={(e) => setNewSender({...newSender, email: e.target.value})}
                      className="input-field text-sm"
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Departamento/Ciudad
                    </label>
                    <input
                      type="text"
                      value={newSender.department}
                      onChange={(e) => setNewSender({...newSender, department: e.target.value})}
                      className="input-field text-sm"
                      placeholder="Departamento o ciudad"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleCreateNewSender}
                    className="btn-primary flex-1 text-sm"
                  >
                    Guardar Remitente
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewSenderForm(false)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resto del formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creando...' : 'Crear Guía'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/guides')}
              className="btn-secondary"
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