import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Download, Trash2, RefreshCw, Calendar, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://mekaplus-app-production.up.railway.app/api';

const Backups = () => {
  const [backups, setBackups] = useState([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/config/backup/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBackups(response.data);
    } catch (error) {
      toast.error('Error al cargar backups');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    const toastId = toast.loading('Generando backup...');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/config/backup/create`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.dismiss(toastId);
      toast.success(`✅ Backup creado: ${response.data.filename} (${response.data.sizeMB} MB)`);
      fetchBackups();
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Error al crear backup');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/config/backup/download/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Crear link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Backup descargado');
    } catch (error) {
      toast.error('Error al descargar backup');
      console.error(error);
    }
  };

  const deleteBackup = async (filename) => {
    if (!confirm(`¿Está seguro de eliminar el backup "${filename}"?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/config/backup/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Backup eliminado');
      fetchBackups();
    } catch (error) {
      toast.error('Error al eliminar backup');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Copias de Seguridad</h1>
        </div>
        
        <button
          onClick={createBackup}
          disabled={creating}
          className="btn-primary flex items-center gap-2"
        >
          {creating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Generar Backup
            </>
          )}
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Backups</p>
              <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Último Backup</p>
              <p className="text-sm font-semibold text-gray-900">
                {backups.length > 0 ? formatDate(backups[0].createdAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Backups */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Backups Disponibles</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No hay backups disponibles</p>
            <p className="text-sm">Genera tu primer backup haciendo clic en "Generar Backup"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Archivo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tamaño</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.filename} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{backup.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(backup.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {backup.sizeMB} MB
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadBackup(backup.filename)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBackup(backup.filename)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Backups;