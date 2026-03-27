import { useState, useEffect } from 'react';
import { guideAPI } from '../services/api';
import { Search, Download, Trash2, Eye, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [selectedGuides, setSelectedGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchGuides();
  }, [pagination.page, search]);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const response = await guideAPI.getAll({
        page: pagination.page,
        limit: 20,
        search
      });
      setGuides(response.data.guides);
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      toast.error('Error al cargar guías');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchGuides();
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

      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por número, razón social o referencia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Buscar
          </button>
        </form>
      </div>

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
                    No se encontraron guías
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
                        'bg-red-100 text-red-800'
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
              Mostrando {pagination.total} guías
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
    </div>
  );
};

export default Guides;