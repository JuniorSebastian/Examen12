// app/categorias/page.tsx
'use client';

import { useState, useEffect } from 'react';
import FormModal from '@/components/FormModal'; // Importa el componente del modal

interface Categoria {
  id: number;
  nombre: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState<Categoria | null>(null); // Para editar
  const [categoriaNombre, setCategoriaNombre] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categorias');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Categoria[] = await response.json();
      setCategorias(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const openCreateModal = () => {
    setCurrentCategoria(null); // No hay categoría actual para crear
    setCategoriaNombre('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (categoria: Categoria) => {
    setCurrentCategoria(categoria);
    setCategoriaNombre(categoria.nombre);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCategoria(null);
    setCategoriaNombre('');
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!categoriaNombre.trim()) {
      setFormError('El nombre de la categoría no puede estar vacío.');
      return;
    }

    try {
      let response;
      if (currentCategoria) {
        // Actualizar categoría existente
        response = await fetch(`/api/categorias/${currentCategoria.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nombre: categoriaNombre }),
        });
      } else {
        // Crear nueva categoría
        response = await fetch('/api/categorias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nombre: categoriaNombre }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP! status: ${response.status}`);
      }

      closeModal();
      fetchCategorias(); // Recargar la lista de categorías
    } catch (e: any) {
      setFormError(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría? Esto podría afectar a los productos asociados.')) {
      return;
    }
    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP! status: ${response.status}`);
      }

      fetchCategorias(); // Recargar la lista
    } catch (e: any) {
      alert(`Error al eliminar categoría: ${e.message}`);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Cargando categorías...</p>;
  if (error) return <p className="text-center text-red-500">Error al cargar categorías: {error}</p>;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Listado de Categorías</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Crear Categoría
        </button>
      </div>

      {categorias.length === 0 ? (
        <p className="text-center text-gray-600">No hay categorías registradas. ¡Crea una nueva!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left border-b border-gray-200">ID</th>
                <th className="py-3 px-6 text-left border-b border-gray-200">Nombre</th>
                <th className="py-3 px-6 text-center border-b border-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {categorias.map((categoria) => (
                <tr key={categoria.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{categoria.id}</td>
                  <td className="py-3 px-6 text-left">{categoria.nombre}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => openEditModal(categoria)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-md text-xs mr-2 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(categoria.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md text-xs transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para Crear/Editar Categoría */}
      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentCategoria ? 'Editar Categoría' : 'Crear Nueva Categoría'}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre de la Categoría:
            </label>
            <input
              type="text"
              id="nombre"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={categoriaNombre}
              onChange={(e) => setCategoriaNombre(e.target.value)}
              required
            />
          </div>
          {formError && <p className="text-red-500 text-xs italic mb-4">{formError}</p>}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {currentCategoria ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}