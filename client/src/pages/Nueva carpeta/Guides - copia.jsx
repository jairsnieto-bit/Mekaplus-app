import { useState, useEffect } from 'react';
import { guideAPI } from '../services/api';
import { 
  Search, 
  Download, 
  Trash2, 
  FileText, 
  Filter, 
  X, 
  Calendar,
  History,
  Hash,
  MapPin,
  Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import GuideStatusModal from '../components/GuideStatusModal';

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [selectedGuides, setSelectedGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [printingFiltered, setPrintingFiltered] = useState(false);
  
  // ✅ Filtros mejorados
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    city: '',
    guideNumberFrom: '',      // ✅ NUEVO: Guía inicial
    guideNumberTo: '',        // ✅ NUEVO: Guía final
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

  // ✅ FUNCIÓN: Obtener TODAS las guías filtradas (sin paginación)
  const fetchAllFilteredGuides = async () => {
    try {
      const params = { ...filters };
      
      // Remover parámetros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      // Obtener todas las guías (limit alto)
      const response = await guideAPI.getAll({ 
        ...params, 
        page: 1, 
        limit: 10000 
      });
      
      return response.data.guides || [];
    } catch (error) {
      console.error('Error fetching all filtered guides:', error);
      throw error;
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
      guideNumberFrom: '',
      guideNumberTo: '',
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

  const removeFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: ''
    }));
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

  // ✅ FUNCIÓN: Descargar PDF de guías seleccionadas
  const downloadPDF = async (guideIds) => {
    if (!guideIds || guideIds.length === 0) {
      toast.error('Seleccione al menos una guía');
      return;
    }
    
    try {
      const toastId = toast.loading('Generando PDF...');
      
      const response = await guideAPI.downloadPDF(guideIds);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `guias-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(toastId);
      toast.success(`PDF de ${guideIds.length} guías descargado`);
    } catch (error) {
      toast.error('Error al descargar PDF');
      console.error(error);
    }
  };

  // ✅ NUEVA FUNCIÓN: Imprimir TODAS las guías filtradas
  const printFilteredGuides = async () => {
    try {
      setPrintingFiltered(true);
      
      // Confirmar cantidad
      const allFilteredGuides = await fetchAllFilteredGuides();
      const totalGuides = allFilteredGuides.length;
      
      if (totalGuides === 0) {
        toast.error('No hay guías para imprimir con los filtros actuales');
        setPrintingFiltered(false);
        return;
      }
      
      const confirm = window.confirm(
        `⚠️ ADVERTENCIA: Vas a imprimir ${totalGuides} guías.\n\n` +
        `• Se generarán archivos PDF\n` +
        `• Puede tardar varios minutos\n` +
        `• ¿Deseas continuar?`
      );
      
      if (!confirm) {
        setPrintingFiltered(false);
        return;
      }
      
      // Extraer IDs de todas las guías filtradas
      const allGuideIds = allFilteredGuides.map(g => g.id);
      
      // Llamar a la misma función de descarga PDF (reutiliza lógica existente)
      await downloadPDF(allGuideIds);
      
    } catch (error) {
      toast.error('Error al imprimir guías filtradas');
      console.error(error);
    } finally {
      setPrintingFiltered(false);
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
    fetchGuides();
  };

  // ✅ Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  // ✅ Obtener lista de filtros activos para chips
  const getActiveFilters = () => {
    const active = [];
    if (filters.search) active.push({ key: 'search', label: `Búsqueda: ${filters.search}`, icon: Search });
    if (filters.guideNumberFrom) active.push({ key: 'guideNumberFrom', label: `Desde: ${filters.guideNumberFrom}`, icon: Hash });
    if (filters.guideNumberTo) active.push({ key: 'guideNumberTo', label: `Hasta: ${filters.guideNumberTo}`, icon: Hash });
    if (filters.status) active.push({ key: 'status', label: `Estado: ${filters.status}`, icon: Filter });
    if (filters.city) active.push({ key: 'city', label: `Ciudad: ${filters.city}`, icon: MapPin });
    if (filters.startDate) active.push({ key: 'startDate', label: `Desde: ${filters.startDate}`, icon: Calendar });
    if (filters.endDate) active.push({ key: 'endDate', label: `Hasta: ${filters.endDate}`, icon: Calendar });
    return active;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guías de Envío</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total > 0 
              ? `${pagination.total.toLocaleString()} guías registradas`
              : 'Sin guías registradas'}
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* ✅ Botón Imprimir Filtradas */}
          <button
            onClick={printFilteredGuides}
            disabled={printingFiltered || pagination.total === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Imprimir todas las guías con los filtros actuales"
          >
            <Printer className="w-5 h-5" />
            {printingFiltered ? 'Generando...' : `Imprimir Filtradas (${pagination.total})`}
          </button>
          
          {/* Botón Descargar Seleccionadas */}
          <button
            onClick={() => downloadPDF(selectedGuides)}
            disabled={selectedGuides.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Descargar PDF ({selectedGuides.length})
          </button>
        </div>
      </div>

      {/* ✅ Barra de Búsqueda y Filtros - Diseño Profesional */}
      <div className="card mb-6">
        {/* Fila 1: Búsqueda rápida + Toggle filtros */}
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
                className={`btn-secondary flex items-center gap-2 ${activeFiltersCount > 0 ? 'ring-2 ring-primary-500' : ''}`}
              >
                <Filter className="w-5 h-5" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ✅ Chips de Filtros Activos */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4 pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-500 font-medium">Filtros activos:</span>
            {getActiveFilters().map((filter) => {
              const Icon = filter.icon;
              return (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-full text-sm font-medium"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {filter.label}
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="hover:text-primary-900 hover:bg-primary-100 rounded-full p-0.5 transition-colors"
                    title="Remover filtro"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 ml-2"
            >
              <X className="w-4 h-4" />
              Limpiar todos
            </button>
          </div>
        )}

        {/* ✅ Panel de Filtros Avanzados - Diseño en Secciones */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-6 mt-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
              >
                <X className="w-4 h-4" />
                Limpiar Todos
              </button>
            </div>

            {/* Sección 1: Filtros de Guía */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Filtros de Guía
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Número de Guía - Desde */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Guía Inicial
                  </label>
                  <input
                    type="text"
                    name="guideNumberFrom"
                    placeholder="Ej: GUIA-000100"
                    value={filters.guideNumberFrom}
                    onChange={handleFilterChange}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">Número de guía inicial del rango</p>
                </div>

                {/* Número de Guía - Hasta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Guía Final
                  </label>
                  <input
                    type="text"
                    name="guideNumberTo"
                    placeholder="Ej: GUIA-000200"
                    value={filters.guideNumberTo}
                    onChange={handleFilterChange}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">Número de guía final del rango</p>
                </div>

                {/* Búsqueda General */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    Búsqueda General
                  </label>
                  <input
                    type="text"
                    name="search"
                    placeholder="Número, razón social, referencia..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">Busca en todos los campos</p>
                </div>
              </div>
            </div>

            {/* Sección 2: Filtros de Ubicación y Estado */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ubicación y Estado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="w-4 h-4 inline mr-1" />
                    Estado
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    <option value="">Todos los estados</option>
                    <option value="PENDIENTE">🟡 Pendiente</option>
                    <option value="EN_TRANSITO">🔵 En Tránsito</option>
                    <option value="ENTREGADA">🟢 Entregada</option>
                    <option value="DEVUELTA">🔴 Devuelta</option>
                    <option value="CANCELADA">⚫ Cancelada</option>
                  </select>
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
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
              </div>
            </div>

            {/* Sección 3: Filtros de Fecha */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Rango de Fechas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-xs text-gray-500 mt-1">Guías creadas desde esta fecha</p>
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
                  <p className="text-xs text-gray-500 mt-1">Guías creadas hasta esta fecha</p>
                </div>
              </div>
            </div>

            {/* Botón Aplicar */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={applyFilters}
                className="btn-primary flex items-center gap-2 px-6"
              >
                <Search className="w-5 h-5" />
                Aplicar Filtros
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
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
              {activeFiltersCount > 0 && (
                <span className="ml-2 text-primary-600 font-medium">
                  (filtradas)
                </span>
              )}
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