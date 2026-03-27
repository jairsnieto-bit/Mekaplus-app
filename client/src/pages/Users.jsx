import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Shield, 
  User, 
  Mail, 
  Phone,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  // ✅ Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // ✅ Estados de filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // ✅ Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'OPERATOR',
    status: 'ACTIVE',
     password: '',           // Para creación
    newPassword: '',        // Para edición
    confirmPassword: '',    // ✅ NUEVO: Confirmación de contraseña
    showPassword: false     // ✅ NUEVO: Control de visibilidad
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchTerm, filters, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 20,
        search: searchTerm,
        ...filters,
        sortBy,
        sortOrder
      };

      const response = await userAPI.getAll(params);
      setUsers(response.data.users);
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      toast.error('Error al cargar usuarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        password: '',
        newPassword: '',
        confirmPassword: '',  // ✅ Limpiar confirmación
        showPassword: false
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'OPERATOR',
        status: 'ACTIVE',
        password: '',
        newPassword: '',
        confirmPassword: '',  // ✅ Limpiar confirmación
        showPassword: false
      });
      setGeneratedPassword('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'OPERATOR',
      status: 'ACTIVE',
      newPassword: '',  // ✅ Limpiar contraseña
      showPassword: false
    });
  };

  /*const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await userAPI.update(editingUser.id, formData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        const response = await userAPI.create(formData);
        if (response.data.user.password) {
          setGeneratedPassword(response.data.user.password);
        }
        toast.success('Usuario creado exitosamente');
      }
      
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar usuario');
    }
  };*/

    /*const handleSubmit = async (e) => {
  e.preventDefault();
  
  // ✅ Validar que las contraseñas coincidan (solo en edición)
  if (editingUser && formData.newPassword) {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
  }
  
  // ✅ Validar contraseña en creación
  if (!editingUser && !formData.password) {
    // La contraseña se generará automáticamente si está vacía
  }
  
  try {
    // ✅ Preparar datos a enviar
    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: formData.status
    };
    
    // ✅ Agregar contraseña solo si se proporcionó una nueva
    if (editingUser && formData.newPassword && formData.newPassword.trim() !== '') {
      updateData.password = formData.newPassword;
    }
    
      if (editingUser && formData.newPassword && formData.newPassword.trim() !== '') {
      updateData.password = formData.newPassword;
    }
    // ✅ Para creación, enviar password (se generará si está vacío)
    //if (!editingUser) {
     // updateData.password = formData.password;
    //}
    
    if (editingUser) {
      await userAPI.update(editingUser.id, updateData);
      toast.success('Usuario actualizado exitosamente');
    } else {
      const response = await userAPI.create(updateData);
      if (response.data.user.password) {
        setGeneratedPassword(response.data.user.password);
      }
      toast.success('Usuario creado exitosamente');
    }
    
    fetchUsers();
    handleCloseModal();
  } catch (error) {
    toast.error(error.response?.data?.error || 'Error al guardar usuario');
  }
};*/  const handleSubmit = async (e) => {
          e.preventDefault();
          
          // ✅ Validar que las contraseñas coincidan
          if (!editingUser && formData.password) {
            if (formData.password !== formData.confirmPassword) {
              toast.error('Las contraseñas no coinciden');
              return;
            }
            
            if (formData.password.length < 6) {
              toast.error('La contraseña debe tener al menos 6 caracteres');
              return;
            }
          }
          
          // ✅ Validar contraseña en edición
          if (editingUser && formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
              toast.error('Las contraseñas no coinciden');
              return;
            }
            
            if (formData.newPassword.length < 6) {
              toast.error('La contraseña debe tener al menos 6 caracteres');
              return;
            }
          }
          
          try {
            // ✅ Preparar datos a enviar
            const updateData = {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              role: formData.role,
              status: formData.status
            };
            
            // ✅ Agregar contraseña solo si se proporcionó
            if (!editingUser && formData.password && formData.password.trim() !== '') {
              updateData.password = formData.password;
            }
            
            if (editingUser && formData.newPassword && formData.newPassword.trim() !== '') {
              updateData.password = formData.newPassword;
            }
            
            if (editingUser) {
              await userAPI.update(editingUser.id, updateData);
              toast.success('Usuario actualizado exitosamente');
            } else {
              const response = await userAPI.create(updateData);
              if (response.data.user.password) {
                setGeneratedPassword(response.data.user.password);
              }
              toast.success('Usuario creado exitosamente');
            }
            
            fetchUsers();
            handleCloseModal();
          } catch (error) {
            toast.error(error.response?.data?.error || 'Error al guardar usuario');
          }
        };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await userAPI.delete(id);
      toast.success('Usuario eliminado correctamente');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      await userAPI.update(id, { status: newStatus });
      toast.success(`Usuario ${newStatus === 'ACTIVE' ? 'activado' : 'desactivado'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Activo' },
      INACTIVE: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Inactivo' },
      BLOCKED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Bloqueado' }
    };

    const badge = badges[status] || badges.INACTIVE;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: { color: 'bg-purple-100 text-purple-800', icon: Shield, label: 'Administrador' },
      OPERATOR: { color: 'bg-blue-100 text-blue-800', icon: User, label: 'Operador' },
      MESSENGER: { color: 'bg-orange-100 text-orange-800', icon: User, label: 'Mensajero' }
    };

    const badge = badges[role] || badges.OPERATOR;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filtro por Rol */}
          <div className="w-full md:w-48">
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="input-field"
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Administrador</option>
              <option value="OPERATOR">Operador</option>
              <option value="MESSENGER">Mensajero</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="w-full md:w-48">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
              <option value="BLOCKED">Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-900">
                    Nombre
                    {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:text-gray-900">
                    Email
                    {sortBy === 'email' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-900">
                    Fecha Creación
                    {sortBy === 'createdAt' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          {user.phone && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`p-1 rounded ${
                            user.status === 'ACTIVE' 
                              ? 'text-orange-600 hover:bg-orange-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                        >
                          {user.status === 'ACTIVE' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Mostrando {users.length} de {pagination.total} usuarios
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

      {/* Modal de Crear/Editar Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="ADMIN">Administrador</option>
                      <option value="OPERATOR">Operador</option>
                      <option value="MESSENGER">Mensajero</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="ACTIVE">Activo</option>
                      <option value="INACTIVE">Inactivo</option>
                      <option value="BLOCKED">Bloqueado</option>
                    </select>
                  </div>
                </div>

                {/* Campo de Contraseña (solo al crear) */}
{!editingUser && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Contraseña *
    </label>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="input-field pr-10"
        placeholder="Mínimo 6 caracteres"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Si se deja vacío, se generará una contraseña segura automáticamente
    </p>
  </div>
)}

{/* ✅ Campo de Confirmar Contraseña (solo al crear) */}
{!editingUser && formData.password && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Confirmar Contraseña *
    </label>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        className={`input-field pr-10 ${
          formData.confirmPassword && formData.password !== formData.confirmPassword
            ? 'border-red-500 focus:ring-red-500'
            : ''
        } ${
          formData.confirmPassword && formData.password === formData.confirmPassword
            ? 'border-green-500 focus:ring-green-500'
            : ''
        }`}
        placeholder="Confirma la contraseña"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
      <p className="text-xs text-red-600 mt-1">
        ⚠️ Las contraseñas no coinciden
      </p>
    )}
    {formData.confirmPassword && formData.password === formData.confirmPassword && (
      <p className="text-xs text-green-600 mt-1">
        ✅ Las contraseñas coinciden
      </p>
    )}
  </div>
)}

{/* Campos de Contraseña (solo al editar) */}
{editingUser && (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Nueva Contraseña
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          className="input-field pr-10"
          placeholder="Dejar vacío para mantener la actual"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Ingresa una nueva contraseña para cambiarla, o deja vacío para mantener la actual
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Confirmar Nueva Contraseña
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className={`input-field pr-10 ${
            formData.confirmPassword && formData.newPassword !== formData.confirmPassword
              ? 'border-red-500 focus:ring-red-500'
              : ''
          } ${
            formData.confirmPassword && formData.newPassword === formData.confirmPassword
              ? 'border-green-500 focus:ring-green-500'
              : ''
          }`}
          placeholder="Confirma la nueva contraseña"
          disabled={!formData.newPassword}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          disabled={!formData.newPassword}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
        <p className="text-xs text-red-600 mt-1">
          ⚠️ Las contraseñas no coinciden
        </p>
      )}
      {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
        <p className="text-xs text-green-600 mt-1">
          ✅ Las contraseñas coinciden
        </p>
      )}
    </div>
  </>
)}
                    
                
             

              {generatedPassword && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-1">
                    ✅ Contraseña generada:
                  </p>
                  <p className="font-mono text-green-800">{generatedPassword}</p>
                  <p className="text-xs text-green-700 mt-1">
                    ⚠️ Copia esta contraseña, no se mostrará nuevamente
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingUser ? 'Actualizar' : 'Crear'} Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;