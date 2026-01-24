'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchBrands, createBrand, deleteBrand } from '@/features/brands/brandsSlice';
import { PlusIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BrandsPage() {
  const dispatch = useAppDispatch();
  const { brands, isLoading, error } = useAppSelector((state) => state.brands);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: '',
    category: '',
    language: 'es',
    tone: 'casual',
    companyId: '550e8400-e29b-41d4-a716-446655440000', // Temporal
  });

  useEffect(() => {
    // Cargar marcas de la empresa
    dispatch(fetchBrands('550e8400-e29b-41d4-a716-446655440000'));
  }, [dispatch]);

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createBrand(newBrand));
    if (createBrand.fulfilled.match(result)) {
      setShowCreateModal(false);
      setNewBrand({
        name: '',
        category: '',
        language: 'es',
        tone: 'casual',
        companyId: '550e8400-e29b-41d4-a716-446655440000',
      });
      dispatch(fetchBrands('550e8400-e29b-41d4-a716-446655440000'));
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta marca?')) {
      await dispatch(deleteBrand(id));
      dispatch(fetchBrands('550e8400-e29b-41d4-a716-446655440000'));
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      fashion: 'from-pink-500 to-rose-500',
      tech: 'from-blue-500 to-cyan-500',
      food: 'from-orange-500 to-red-500',
      health: 'from-green-500 to-emerald-500',
      education: 'from-purple-500 to-violet-500',
    };
    return colors[category?.toLowerCase()] || 'from-gray-500 to-gray-700';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marcas</h1>
            <p className="mt-2 text-gray-600">
              Gestiona las marcas de tus campañas de marketing
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nueva Marca</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <TagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No tienes marcas registradas</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Crear tu primera marca
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className={`h-24 bg-gradient-to-r ${getCategoryColor(brand.category)}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {brand.name}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {brand.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Idioma:</span>
                      <span className="text-gray-900 font-medium">{brand.language.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tono:</span>
                      <span className="text-gray-900 font-medium capitalize">{brand.tone}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert(`Ver campañas de ${brand.name}`)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                    >
                      Ver Campañas
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(brand.id)}
                      className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Brand Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Marca</h2>

              <form onSubmit={handleCreateBrand} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Marca
                  </label>
                  <input
                    type="text"
                    value={newBrand.name}
                    onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Mi Marca Cool"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={newBrand.category}
                    onChange={(e) => setNewBrand({ ...newBrand, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="fashion">Moda</option>
                    <option value="tech">Tecnología</option>
                    <option value="food">Comida y Bebida</option>
                    <option value="health">Salud y Bienestar</option>
                    <option value="education">Educación</option>
                    <option value="entertainment">Entretenimiento</option>
                    <option value="travel">Viajes</option>
                    <option value="finance">Finanzas</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      value={newBrand.language}
                      onChange={(e) => setNewBrand({ ...newBrand, language: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tono
                    </label>
                    <select
                      value={newBrand.tone}
                      onChange={(e) => setNewBrand({ ...newBrand, tone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="casual">Casual</option>
                      <option value="professional">Profesional</option>
                      <option value="friendly">Amigable</option>
                      <option value="formal">Formal</option>
                      <option value="humorous">Humorístico</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Crear Marca
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
