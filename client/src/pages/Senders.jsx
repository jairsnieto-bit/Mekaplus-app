import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { senderAPI } from '../services/api';
import { Search, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Senders = () => {
  const navigate = useNavigate();
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSender, setEditingSender] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nit: '',
    address: '',
    phone: '',
    email: '',
    department: ''
  });

  useEffect(() => {
    fetchSenders();
  }, [search]);

  const fetchSenders = async () => {
    setLoading(true);
    try {
      const response = await senderAPI.getAll({ search, limit: 100 });
      setSenders(response.data.senders);
    } catch (error) {
      toast.error('Error al cargar remitentes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSenders();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (sender = null) => {
    if (sender) {
      setEditingSender(sender);
      setFormData({
        name: sender.name || '',
        nit: sender.nit || '',
        address: sender.address || '',
        phone: sender.phone || '',
        email: sender.email || '',
        department: sender.department || ''
      });
    } else {
      setEditingSender(null);
      setFormData({
        name: '',
        nit: '',
        address: '',
        phone: '',
        email: '',
        department: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSender(null);
    setFormData({
      name: '',
      nit: '',
      address: '',
      phone: '',
      email: '',
      department: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSender) {
        await senderAPI.update(editingSender.id, formData);
        toast.success('Remitente actualizado');
      } else {
        await senderAPI.create(formData);
        toast.success('Remitente creado');
      }
      closeModal();
      fetchSenders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de desactivar este remitente?')) return;
    
    try {
      await senderAPI.delete(id);
      toast.success('Remitente desactivado');
      fetchSenders();
    } catch (error) {
      toast.error('Error al desactivar remitente');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Remitentes</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Remitente
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, NIT o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">
            Buscar
          </button>
        </form>
      </div>

      {/* Tabla de Remitentes */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">NIT</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Departamento</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : senders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron remitentes
                  </td>
                </tr>
              ) : (
                senders.map((sender) => (
                  <tr key={sender.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{sender.name}</td>
                    <td className="px-4 py-3">{sender.nit || '-'}</td>
                    <td className="px-4 py-3">{sender.phone || '-'}</td>
                    <td className="px-4 py-3">{sender.email || '-'}</td>
                    <td className="px-4 py-3">{sender.department || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sender.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sender.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(sender)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sender.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Desactivar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">
                {editingSender ? 'Editar Remitente' : 'Nuevo Remitente'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre/Razón Social *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIT
                  </label>
                  <input
                    type="text"
                    name="nit"
                    value={formData.nit}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ej: Atlantico"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="submit" className="btn-primary flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  {editingSender ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Senders;