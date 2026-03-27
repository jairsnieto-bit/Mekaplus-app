import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { guideAPI } from '../services/api';
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




     // ✅ AGREGAR: Estado para remitentes
  const [senders, setSenders] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState('');

  // ✅ AGREGAR: Cargar remitentes al montar
  useEffect(() => {
    const fetchSenders = async () => {
      try {
        const response = await guideAPI.getActive();
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

    const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  /*const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await guideAPI.create(formData,);
      toast.success('Guía creada exitosamente');
      navigate('/guides');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear guía');
    } finally {
      setLoading(false);
    }
  };*/

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    await guideAPI.create({
      ...formData,
      senderId: selectedSenderId  // ✅ NUEVO: Agregar senderId
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
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Crear Nueva Guía</h1>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="card space-y-6">

          {/* ✅ NUEVO: Select de Remitente */}
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