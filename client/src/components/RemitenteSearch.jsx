import { useState, useEffect, useRef } from 'react';
import { senderAPI } from '../services/api';
import { Search, X, ChevronDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const RemitenteSearch = ({ onRemitenteSelect, value }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [remetentes, setRemetentes] = useState([]);
  const [filteredRemetentes, setFilteredRemetentes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showNewRemitenteForm, setShowNewRemitenteForm] = useState(false);
  const [newRemitente, setNewRemitente] = useState({
    name: '',
    nit: '',
    address: '',
    phone: '',
    email: '',
    department: ''
  });
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ Cargar remitentes al iniciar
  useEffect(() => {
    fetchRemetentes();
  }, []);

  // ✅ Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Filtrar remitentes mientras escribe
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRemetentes([]);
    } else {
      const filtered = remetentes.filter(rem => 
        rem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rem.nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rem.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRemetentes(filtered.slice(0, 10)); // Máximo 10 resultados
    }
  }, [searchTerm, remetentes]);

  const fetchRemetentes = async () => {
    try {
      setIsLoading(true);
      const response = await senderAPI.getAll();
      setRemetentes(response.data);
    } catch (error) {
      console.error('Error cargando remitentes:', error);
      toast.error('Error al cargar remitentes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRemitente = (rem) => {
    setSearchTerm(`${rem.name} (NIT: ${rem.nit})`);
    setIsOpen(false);
    onRemitenteSelect(rem);
  };

  const handleClearSelection = () => {
    setSearchTerm('');
    setFilteredRemetentes([]);
    onRemitenteSelect(null);
    inputRef.current?.focus();
  };

  const handleCreateNewRemitente = async () => {
    try {
      const response = await senderAPI.create(newRemitente);
      setRemetentes([...remetentes, response.data]);
      handleSelectRemitente(response.data);
      setShowNewRemitenteForm(false);
      setNewRemitente({
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

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Remitente *
      </label>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Buscar por nombre, NIT o dirección..."
            className="input-field pl-10 pr-10"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ✅ Dropdown de resultados */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm mt-2">Cargando...</p>
              </div>
            ) : filteredRemetentes.length > 0 ? (
              <div className="py-2">
                {filteredRemetentes.map((rem) => (
                  <button
                    key={rem.id}
                    type="button"
                    onClick={() => handleSelectRemitente(rem)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{rem.name}</p>
                        <p className="text-sm text-gray-600">NIT: {rem.nit}</p>
                        <p className="text-sm text-gray-500">{rem.address}</p>
                        {rem.phone && (
                          <p className="text-xs text-gray-400 mt-1">📞 {rem.phone}</p>
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
                  onClick={() => setShowNewRemitenteForm(true)}
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
      {showNewRemitenteForm && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">Nuevo Remitente</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nombre/Razón Social *
              </label>
              <input
                type="text"
                value={newRemitente.name}
                onChange={(e) => setNewRemitente({...newRemitente, name: e.target.value})}
                className="input-field text-sm"
                placeholder="Nombre completo"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                NIT
              </label>
              <input
                type="text"
                value={newRemitente.nit}
                onChange={(e) => setNewRemitente({...newRemitente, nit: e.target.value})}
                className="input-field text-sm"
                placeholder="NIT"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                value={newRemitente.address}
                onChange={(e) => setNewRemitente({...newRemitente, address: e.target.value})}
                className="input-field text-sm"
                placeholder="Dirección completa"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={newRemitente.phone}
                onChange={(e) => setNewRemitente({...newRemitente, phone: e.target.value})}
                className="input-field text-sm"
                placeholder="Teléfono"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Departamento/Ciudad
              </label>
              <input
                type="text"
                value={newRemitente.department}
                onChange={(e) => setNewRemitente({...newRemitente, department: e.target.value})}
                className="input-field text-sm"
                placeholder="Departamento"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleCreateNewRemitente}
              className="btn-primary flex-1 text-sm"
            >
              Guardar Remitente
            </button>
            <button
              type="button"
              onClick={() => setShowNewRemitenteForm(false)}
              className="btn-secondary flex-1 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemitenteSearch;