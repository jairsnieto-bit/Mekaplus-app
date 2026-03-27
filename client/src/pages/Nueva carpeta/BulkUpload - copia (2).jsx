import { useState, useCallback, useEffect } from 'react';  // ✅ Agregar useEffect
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { guideAPI } from '../services/api';
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { senderAPI } from '../services/api';  // ✅ Asegúrate de importar

const BulkUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  
  // ✅ NUEVO: Estados para remitentes
  const [senders, setSenders] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState('');

  // ✅ NUEVO: Cargar remitentes al montar
  useEffect(() => {
    const fetchSenders = async () => {
      try {
        //const response = await guideAPI.getSenders();
        const response = await senderAPI.getActive();  // ✅ No requiere auth
        setSenders(response.data);
        if (response.data.length > 0) {
          setSelectedSenderId(response.data[0].id);
        }
      } catch (error) {
        console.error('Error cargando remitentes:', error);
        toast.error('No se pudieron cargar los remitentes');
      }
    };
    fetchSenders();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Seleccione un archivo');
      return;
    }

    if (!selectedSenderId) {
      toast.error('Seleccione un remitente');
      return;
    }

    console.log('📤 Enviando archivo:', file.name);
    console.log('📋 Sender ID:', selectedSenderId);
    
    setUploading(true);
    const formData = new FormData();
    formData.append('excel', file);
    formData.append('senderId', selectedSenderId);  // ✅ NUEVO: Agregar senderId

    try {
      console.log('🔄 Llamando a API...');
      const response = await guideAPI.createBulk(formData);
      console.log('✅ Respuesta:', response.data);
      setResult(response.data);
      toast.success(`Se crearon ${response.data.count} guías exitosamente`);
    } catch (error) {
      console.error('❌ Error en upload:', error);
      console.error('❌ Response data:', error.response?.data);
      toast.error(error.response?.data?.error || 'Error al procesar archivo');
    } finally {
      setUploading(false);
    }
  };

      // ✅ Función para descargar un lote de guías
const downloadBatch = async (guideIds, filename) => {
  try {
    const response = await guideAPI.downloadPDF(guideIds);
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Carga Masiva de Guías</h1>

      <div className="max-w-4xl">
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Instrucciones</h2>
          <div className="space-y-2 text-gray-700">
            <p>1. Descargue la plantilla de Excel con las columnas requeridas:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>RAZON SOCIAL</li>
              <li>LOCALIDAD</li>
              <li>DIRECCION</li>
              <li>IDENTIFICACION / CODIGO USUARIO</li>
              <li>REFERENCIA DE ENTREGA</li>
            </ul>
            <p className="mt-4">2. Complete la información en el Excel</p>
            <p>3. Seleccione el remitente</p>
            <p>4. Suba el archivo y el sistema generará automáticamente las guías</p>
          </div>
        </div>

        {/* ✅ NUEVO: Select de Remitente */}
        <div className="card mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remitente *
            </label>
            <select
              value={selectedSenderId}
              onChange={(e) => setSelectedSenderId(e.target.value)}
              className="input-field w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar Remitente</option>
              {senders.map(sender => (
                <option key={sender.id} value={sender.id}>
                  {sender.name} {sender.nit ? `(NIT: ${sender.nit})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg text-primary-600">Suelte el archivo aquí...</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">
                Arrastre un archivo Excel aquí, o haga clic para seleccionar
              </p>
              <p className="text-sm text-gray-500">
                Soporta archivos .xlsx y .xls (máx. 10MB)
              </p>
            </>
          )}
        </div>

        {file && (
          <div className="mt-6 card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileSpreadsheet className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 btn-primary w-full"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Procesar Archivo
                </span>
              )}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6 card bg-green-50 border border-green-200">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-bold text-green-800">
                Proceso Completado Exitosamente
              </h3>
            </div>
            <p className="text-green-700 mb-4">
              Se crearon <strong>{result.count}</strong> guías correctamente
            </p>
            <div className="flex gap-4">
                <button
                  onClick={() => navigate('/guides')}
                  className="btn-primary"
                >
                  Ver Guías Creadas
                </button>
                
                {/* ✅ NUEVO: Botón Imprimir Guías */}
                {/* ✅ NUEVO: Botón Imprimir Guías */}
                  {result && result.allGuideIds && (
                    <button
                      onClick={async () => {
                        const totalGuides = result.allGuideIds.length;
                        
                        // ⚠️ Advertencia para muchas guías
                        if (totalGuides > 100) {
                          const confirm = window.confirm(
                            `⚠️ ADVERTENCIA: Vas a imprimir ${totalGuides} guías.\n\n` +
                            `• El PDF será muy grande\n` +
                            `• Puede tardar varios minutos\n` +
                            `• Consume mucha memoria\n\n` +
                            `¿Deseas continuar?`
                          );
                          if (!confirm) return;
                        }
                        
                        try {
                          toast.loading('Generando PDF... Esto puede tardar');
                          
                          // ✅ Dividir en lotes si son muchas guías
                          if (totalGuides > 500) {
                            // Imprimir en lotes de 100
                            const batchSize = 100;
                            for (let i = 0; i < totalGuides; i += batchSize) {
                              const batch = result.allGuideIds.slice(i, i + batchSize);
                              await downloadBatch(batch, `guias-masivas-lote-${Math.floor(i/batchSize) + 1}`);
                            }
                            toast.success(`PDF generado en ${Math.ceil(totalGuides/batchSize)} archivos`);
                          } else {
                            // Imprimir todas juntas
                            await downloadBatch(result.allGuideIds, `guias-masivas-${Date.now()}`);
                            toast.success(`PDF de ${totalGuides} guías descargado`);
                          }
                        } catch (error) {
                          toast.error('Error al descargar PDF');
                        }
                      }}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Imprimir Guías ({result.count})
                    </button>
                  )}
                
                <button
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                  }}
                  className="btn-secondary"
                >
                  Subir Otro Archivo
                </button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;