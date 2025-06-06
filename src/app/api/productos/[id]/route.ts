// app/api/productos/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Obtener un producto por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de producto inválido.' }, { status: 400 });
    }

    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true, // Incluir la información de la categoría
      },
    });

    if (!producto) {
      return NextResponse.json({ message: 'Producto no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(producto, { status: 200 });
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT: Actualizar un producto por ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nombre, descripcion, precio, stock, categoriaId } = body;

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de producto inválido.' }, { status: 400 });
    }

    if (!nombre || !precio || !stock || !categoriaId) {
      return NextResponse.json({ message: 'Todos los campos obligatorios (nombre, precio, stock, categoriaId) son requeridos.' }, { status: 400 });
    }

    if (isNaN(parseFloat(precio)) || isNaN(parseInt(stock)) || isNaN(parseInt(categoriaId))) {
      return NextResponse.json({ message: 'Precio, stock y categoriaId deben ser números válidos.' }, { status: 400 });
    }

    const productoActualizado = await prisma.producto.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        categoriaId: parseInt(categoriaId),
      },
    });

    return NextResponse.json(productoActualizado, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Producto no encontrado para actualizar.' }, { status: 404 });
    }
    if (error.code === 'P2003' && error.meta?.cause?.includes('foreign key constraint failed')) {
      return NextResponse.json({ message: 'La categoriaId proporcionada no existe.' }, { status: 400 });
    }
    console.error('Error al actualizar producto:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE: Eliminar un producto por ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de producto inválido.' }, { status: 400 });
    }

    await prisma.producto.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Producto eliminado exitosamente.' }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Producto no encontrado para eliminar.' }, { status: 404 });
    }
    console.error('Error al eliminar producto:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}