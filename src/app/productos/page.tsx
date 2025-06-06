// app/productos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import FormModal from '@/components/FormModal'; // Importa el componente del modal

interface Categoria {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  categoriaId: number;
  categoria: Categoria; // Incluye la relación de categoría
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]); // Para el select de categorías
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProducto, setCurrentProducto] = useState<Producto | null>(null); // Para editar
  
  // Estados del formulario de producto
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/productos');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Producto[] = await response.json();
      setProductos(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriasForSelect = async () => {
    try {
      const response = await fetch('/api/categorias');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Categoria[] = await response.json();
      setCategorias(data);
    } catch (e: any) {
      console.error("Error al cargar categorías para el select:", e);
      setFormError("No se pudieron cargar las categorías para el formulario.");
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchCategoriasForSelect(); // Cargar categorías cuando el componente se monta
  }, []);

  const openCreateModal = () => {
    setCurrentProducto(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setStock('');
    setCategoriaId('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (producto: Producto) => {
    setCurrentProducto(producto);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion || '');
    setPrecio(producto.precio.toString());
    setStock(producto.stock.toString());
    setCategoriaId(producto.categoriaId.toString());
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProducto(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setStock('');
    setCategoriaId('');
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validaciones básicas
    if (!nombre.trim() || !precio.trim() || !stock.trim() || !categoriaId.trim()) {
      setFormError('Todos los campos obligatorios deben ser llenados.');
      return;
    }
    if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
      setFormError('El precio debe ser un número válido mayor que cero.');
      return;
    }
    if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      setFormError('El stock debe ser un número entero válido mayor o igual a cero.');
      return;
    }
    if (isNaN(parseInt(categoriaId)) || parseInt(categoriaId) <= 0) {
      setFormError('Debe seleccionar una categoría válida.');
      return;
    }

    const productData = {
      nombre,
      descripcion: descripcion || null, // Envía null si está vacío
      precio: parseFloat(precio),
      stock: parseInt(stock),
      categoriaId: parseInt(categoriaId),
    };

    try {
      let response;
      if (currentProducto) {
        // Actualizar producto existente
        response = await fetch(`/api/productos/${currentProducto.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      } else {
        // Crear nuevo producto
        response = await fetch('/api/productos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP! status: ${response.status}`);
      }

      closeModal();
      fetchProductos(); // Recargar la lista de productos
    } catch (e: any) {
      setFormError(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }
    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP! status: ${response.status}`);
      }

      fetchProductos(); // Recargar la lista
    } catch (e: any) {
      alert(`Error al eliminar producto: ${e.message}`);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Cargando productos...</p>;
  if (error) return <p className="text-center text-red-500">Error al cargar productos: {error}</p>;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Listado de Productos</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Crear Producto
        </button>
      </div>

      {productos.length === 0 ? (
        <p className="text-center text-gray-600">No hay productos registrados. ¡Crea uno nuevo!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left border-b border-gray-200">ID</th>
                <th className="py-3 px-6 text-left border-b border-gray-200">Nombre</th>
                <th className="py-3 px-6 text-left border-b border-gray-200">Descripción</th>
                <th className="py-3 px-6 text-left border-b border-gray-200">Precio</th>
                <th className="py-3 px-6 text-left border-b border-gray-200">Stock</th>
                <th className="py-3 px-6 text-left border-b border-gray-200">Categoría</th>
                <th className="py-3 px-6 text-center border-b border-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {productos.map((producto) => (
                <tr key={producto.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{producto.id}</td>
                  <td className="py-3 px-6 text-left">{producto.nombre}</td>
                  <td className="py-3 px-6 text-left">{producto.descripcion || 'N/A'}</td>
                  <td className="py-3 px-6 text-left">S/ {producto.precio.toFixed(2)}</td>
                  <td className="py-3 px-6 text-left">{producto.stock}</td>
                  <td className="py-3 px-6 text-left">{producto.categoria.nombre}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => openEditModal(producto)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-md text-xs mr-2 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(producto.id)}
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

      {/* Modal para Crear/Editar Producto */}
      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentProducto ? 'Editar Producto' : 'Crear Nuevo Producto'}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre:
            </label>
            <input
              type="text"
              id="nombre"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">
              Descripción (opcional):
            </label>
            <textarea
              id="descripcion"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="precio" className="block text-gray-700 text-sm font-bold mb-2">
              Precio:
            </label>
            <input
              type="number"
              id="precio"
              step="0.01"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="stock" className="block text-gray-700 text-sm font-bold mb-2">
              Stock:
            </label>
            <input
              type="number"
              id="stock"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="categoriaId" className="block text-gray-700 text-sm font-bold mb-2">
              Categoría:
            </label>
            <select
              id="categoriaId"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
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
              {currentProducto ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}