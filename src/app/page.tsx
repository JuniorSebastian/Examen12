// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Categoria {
  id: number;
  nombre: string;
}

export default function HomePage() {
  // Estados para el formulario de Categoría
  const [newCategoriaNombre, setNewCategoriaNombre] = useState('');
  const [categoriaFormError, setCategoriaFormError] = useState<string | null>(null);
  const [categoriaFormSuccess, setCategoriaFormSuccess] = useState<string | null>(null);

  // Estados para el formulario de Producto
  const [newProductoNombre, setNewProductoNombre] = useState('');
  const [newProductoDescripcion, setNewProductoDescripcion] = useState('');
  const [newProductoPrecio, setNewProductoPrecio] = useState('');
  const [newProductoStock, setNewProductoStock] = useState('');
  const [newProductoCategoriaId, setNewProductoCategoriaId] = useState('');
  const [productoFormError, setProductoFormError] = useState<string | null>(null);
  const [productoFormSuccess, setProductoFormSuccess] = useState<string | null>(null);

  // Estado para cargar las categorías disponibles en el select de productos
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [errorLoadingCategorias, setErrorLoadingCategorias] = useState<string | null>(null);

  // **MOVIDA AQUÍ**: Definimos la función fetchCategoriasForSelect fuera del useEffect
  // para que pueda ser llamada desde cualquier manejador de eventos del componente.
  const fetchCategoriasForSelect = async () => {
    try {
      setLoadingCategorias(true);
      const response = await fetch('/api/categorias');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Categoria[] = await response.json();
      setCategorias(data);
    } catch (e: any) {
      setErrorLoadingCategorias(e.message);
    } finally {
      setLoadingCategorias(false);
    }
  };

  // El useEffect ahora solo llama a la función al inicio.
  useEffect(() => {
    fetchCategoriasForSelect();
  }, []); // Se ejecuta una sola vez al montar el componente

  // Manejador para crear una nueva Categoría
  const handleCreateCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoriaFormError(null);
    setCategoriaFormSuccess(null);

    if (!newCategoriaNombre.trim()) {
      setCategoriaFormError('El nombre de la categoría no puede estar vacío.');
      return;
    }

    try {
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newCategoriaNombre }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido al crear categoría.');
      }

      setNewCategoriaNombre(''); // Limpia el input
      setCategoriaFormSuccess('¡Categoría creada con éxito!');
      // Ahora podemos llamar a fetchCategoriasForSelect() aquí sin problema
      fetchCategoriasForSelect(); // Vuelve a cargar las categorías para el select de productos
    } catch (error: any) {
      setCategoriaFormError(`Error al crear categoría: ${error.message}`);
    }
  };

  // Manejador para crear un nuevo Producto
  const handleCreateProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductoFormError(null);
    setProductoFormSuccess(null);

    // Validaciones básicas del formulario
    if (!newProductoNombre.trim() || !newProductoPrecio.trim() || !newProductoStock.trim() || !newProductoCategoriaId.trim()) {
      setProductoFormError('Todos los campos obligatorios deben ser llenados.');
      return;
    }
    if (isNaN(parseFloat(newProductoPrecio)) || parseFloat(newProductoPrecio) <= 0) {
      setProductoFormError('El precio debe ser un número válido mayor que cero.');
      return;
    }
    if (isNaN(parseInt(newProductoStock)) || parseInt(newProductoStock) < 0) {
      setProductoFormError('El stock debe ser un número entero válido mayor o igual a cero.');
      return;
    }
    if (isNaN(parseInt(newProductoCategoriaId)) || parseInt(newProductoCategoriaId) <= 0) {
      setProductoFormError('Debe seleccionar una categoría válida.');
      return;
    }

    const productData = {
      nombre: newProductoNombre,
      descripcion: newProductoDescripcion || null,
      precio: parseFloat(newProductoPrecio),
      stock: parseInt(newProductoStock),
      categoriaId: parseInt(newProductoCategoriaId),
    };

    try {
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido al crear producto.');
      }

      // Limpia los inputs
      setNewProductoNombre('');
      setNewProductoDescripcion('');
      setNewProductoPrecio('');
      setNewProductoStock('');
      setNewProductoCategoriaId('');
      setProductoFormSuccess('¡Producto creado con éxito!');
    } catch (error: any) {
      setProductoFormError(`Error al crear producto: ${error.message}`);
    }
  };

  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-4">
        ¡Bienvenido a la Aplicación de Farmacia!
      </h1>
      <p className="text-xl text-gray-700 mb-8">
        Gestiona tus categorías y productos de forma eficiente.
      </p>

      <div className="flex flex-col sm:flex-row justify-center items-start gap-8">
        {/* Sección para Categorías con Formulario de Creación */}
        <div className="bg-blue-100 p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 transition-transform transform hover:scale-105">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Crear Nueva Categoría</h2>
          <p className="text-gray-700 mb-6">
            Añade una nueva categoría para tus productos.
          </p>
          <form onSubmit={handleCreateCategoria} className="mb-4">
            <input
              type="text"
              placeholder="Nombre de la categoría"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-3"
              value={newCategoriaNombre}
              onChange={(e) => setNewCategoriaNombre(e.target.value)}
              required
            />
            {categoriaFormError && <p className="text-red-500 text-sm mb-2">{categoriaFormError}</p>}
            {categoriaFormSuccess && <p className="text-green-600 text-sm mb-2">{categoriaFormSuccess}</p>}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full"
            >
              Crear Categoría
            </button>
          </form>
          <Link href="/categorias" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors block">
            Ver y Gestionar Categorías Existentes
          </Link>
        </div>

        {/* Sección para Productos con Formulario de Creación */}
        <div className="bg-green-100 p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 transition-transform transform hover:scale-105">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Crear Nuevo Producto</h2>
          <p className="text-gray-700 mb-6">
            Registra un nuevo producto en tu inventario.
          </p>
          <form onSubmit={handleCreateProducto} className="mb-4">
            <div className="mb-3 text-left">
              <label htmlFor="nombreProducto" className="block text-gray-700 text-sm font-bold mb-1">Nombre:</label>
              <input
                type="text"
                id="nombreProducto"
                placeholder="Nombre del producto"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newProductoNombre}
                onChange={(e) => setNewProductoNombre(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 text-left">
              <label htmlFor="descripcionProducto" className="block text-gray-700 text-sm font-bold mb-1">Descripción:</label>
              <textarea
                id="descripcionProducto"
                placeholder="Descripción del producto (opcional)"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newProductoDescripcion}
                onChange={(e) => setNewProductoDescripcion(e.target.value)}
                rows={2}
              ></textarea>
            </div>
            <div className="mb-3 text-left">
              <label htmlFor="precioProducto" className="block text-gray-700 text-sm font-bold mb-1">Precio:</label>
              <input
                type="number"
                id="precioProducto"
                step="0.01"
                placeholder="Ej: 9.99"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newProductoPrecio}
                onChange={(e) => setNewProductoPrecio(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 text-left">
              <label htmlFor="stockProducto" className="block text-gray-700 text-sm font-bold mb-1">Stock:</label>
              <input
                type="number"
                id="stockProducto"
                placeholder="Ej: 50"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newProductoStock}
                onChange={(e) => setNewProductoStock(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 text-left">
              <label htmlFor="categoriaProducto" className="block text-gray-700 text-sm font-bold mb-1">Categoría:</label>
              {loadingCategorias ? (
                <p className="text-gray-600 text-sm">Cargando categorías...</p>
              ) : errorLoadingCategorias ? (
                <p className="text-red-500 text-sm">Error: {errorLoadingCategorias}. No se pueden cargar categorías.</p>
              ) : (
                <select
                  id="categoriaProducto"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newProductoCategoriaId}
                  onChange={(e) => setNewProductoCategoriaId(e.target.value)}
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {productoFormError && <p className="text-red-500 text-sm mb-2">{productoFormError}</p>}
            {productoFormSuccess && <p className="text-green-600 text-sm mb-2">{productoFormSuccess}</p>}
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full"
            >
              Crear Producto
            </button>
          </form>
          <Link href="/productos" className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors block">
            Ver y Gestionar Productos Existentes
          </Link>
        </div>
      </div>
    </div>
  );
}