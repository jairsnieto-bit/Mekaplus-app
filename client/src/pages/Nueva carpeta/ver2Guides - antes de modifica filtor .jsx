import { useState, useEffect } from 'react';
import { guideAPI } from '../services/api';
import { Search, Download, Trash2, Eye, FileText, Filter, X, Calendar,History } from 'lucide-react';
import toast from 'react-hot-toast';
import GuideStatusModal from '../components/GuideStatusModal';

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [selectedGuides, setSelectedGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    city: '',
    guideNumber: '',
    startDate: '',
    endDate: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  // Ciudades únicas para el filtro
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchGuides();
    fetchUniqueCities();
  }, [pagination.page]);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 20,
        ...filters
      };

      // Remover parámetros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await guideAPI.getAll(params);
      setGuides(response.data.guides);
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      toast.error('Error al cargar guías');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUniqueCities = async () => {
    try {
      const response = await guideAPI.getAll({ limit: 1000 });
      const uniqueCities = [...new Set(response.data.guides.map(g => g.localidad).filter(Boolean))];
      setCities(uniqueCities.sort());
    } catch (error) {
      console.error('Error al cargar ciudades:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchGuides();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      city: '',
      guideNumber: '',
      startDate: '',
      endDate: ''
    });
    setPagination({ ...pagination, page: 1 });
    setTimeout(() => fetchGuides(), 100);
  };

  const applyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    fetchGuides();
    setShowFilters(false);
  };

  const toggleSelectGuide = (id) => {
    setSelectedGuides(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedGuides.length === guides.length) {
      setSelectedGuides([]);
    } else {
      setSelectedGuides(guides.map(g => g.id));
    }
  };

  const downloadPDF = async () => {
    if (selectedGuides.length === 0) {
      toast.error('Seleccione al menos una guía');
      return;
    }

    try {
      const response = await guideAPI.downloadPDF(selectedGuides);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `guias-${Date.now()}.pdf`;
      link.click();
      toast.success('PDF descargado correctamente');
    } catch (error) {
      toast.error('Error al descargar PDF');
    }
  };

  const deleteGuide = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta guía?')) return;

    try {
      await guideAPI.delete(id);
      toast.success('Guía eliminada');
      fetchGuides();
    } catch (error) {
      toast.error('Error al eliminar guía');
    }
  };
  
    const openStatusModal = (guide) => {
    setSelectedGuide(guide);
    setShowStatusModal(true);
  };

  const handleStatusSuccess = () => {
    fetchGuides(); // Recargar lista
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Guías de Envío</h1>
        <button
          onClick={downloadPDF}
          disabled={selectedGuides.length === 0}
          className="btn-primary flex items-center"
        >
          <Download className="w-5 h-5 mr-2" />
          Descargar PDF ({selectedGuides.length})
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="card mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por número, razón social o referencia..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="input-field pl-10"
                />
              </div>
              <button type="submit" className="btn-primary">
                Buscar
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Panel de Filtros Avanzados */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Limpiar Filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Número de Guía */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Guía
                </label>
                <input
                  type="text"
                  name="guideNumber"
                  placeholder="Ej: GUIA-000123"
                  value={filters.guideNumber}
                  onChange={handleFilterChange}
                  className="input-field"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">Todos los estados</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="ENTREGADA">Entregada</option>
                  <option value="CANCELADA">Cancelada</option>
                  <option value="DEVUELTA">Devuelta</option>
                </select>
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <select
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">Todas las ciudades</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Fecha Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="input-field"
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha Fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="input-field"
                />
              </div>

              {/* Botón Aplicar */}
              <div className="flex items-end">
                <button
                  onClick={applyFilters}
                  className="btn-primary w-full"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>

            {/* Resumen de Filtros Activos */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Filtros activos:</span>
                {filters.guideNumber && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                    Guía: {filters.guideNumber}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, guideNumber: '' }))}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.status && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                    Estado: {filters.status}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, status: '' }))}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.city && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                    Ciudad: {filters.city}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, city: '' }))}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.startDate && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                    Desde: {filters.startDate}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, startDate: '' }))}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.endDate && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                    Hasta: {filters.endDate}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, endDate: '' }))}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabla de Guías */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedGuides.length === guides.length && guides.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Razón Social</th>
                <th className="px-4 py-3 text-left">Dirección</th>
                <th className="px-4 py-3 text-left">Ciudad</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : guides.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    {activeFiltersCount > 0 
                      ? 'No se encontraron guías con los filtros seleccionados'
                      : 'No se encontraron guías'}
                  </td>
                </tr>
              ) : (
                guides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedGuides.includes(guide.id)}
                        onChange={() => toggleSelectGuide(guide.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{guide.guideNumber}</td>
                    <td className="px-4 py-3">{guide.razonSocial}</td>
                    <td className="px-4 py-3">{guide.direccion}</td>
                    <td className="px-4 py-3">{guide.localidad}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        guide.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                        guide.estado === 'ENTREGADA' ? 'bg-green-100 text-green-800' :
                        guide.estado === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {guide.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(guide.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadPDF([guide.id])}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Descargar"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        {/* ✅ NUEVO: Botón cambiar estado */}
                          <button
                            onClick={() => openStatusModal(guide)}
                            className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                            title="Cambiar Estado"
                          >
                            <History className="w-5 h-5" />
                          </button>
                        <button
                          onClick={() => deleteGuide(guide.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar"
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

        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Mostrando {guides.length} de {pagination.total} guías
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
          {/* Modal para cambiar estado */}
          {showStatusModal && selectedGuide && (
            <GuideStatusModal
              guide={selectedGuide}
              onClose={() => {
                setShowStatusModal(false);
                setSelectedGuide(null);
              }}
              onSuccess={handleStatusSuccess}
            />
          )}
    </div>
  );
};

export default Guides;