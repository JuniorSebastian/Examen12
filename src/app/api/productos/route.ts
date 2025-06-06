// app/api/productos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Obtener todos los productos
export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: true, // Incluir la información de la categoría asociada
      },
      orderBy: {
        nombre: 'asc', // Ordenar por nombre de producto
      },
    });
    return NextResponse.json(productos, { status: 200 });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Crear un nuevo producto
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, descripcion, precio, stock, categoriaId } = body;

    if (!nombre || !precio || !stock || !categoriaId) {
      return NextResponse.json({ message: 'Todos los campos obligatorios (nombre, precio, stock, categoriaId) son requeridos.' }, { status: 400 });
    }

    if (isNaN(parseFloat(precio)) || isNaN(parseInt(stock)) || isNaN(parseInt(categoriaId))) {
      return NextResponse.json({ message: 'Precio, stock y categoriaId deben ser números válidos.' }, { status: 400 });
    }

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        categoriaId: parseInt(categoriaId),
      },
    });
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2025' && error.meta?.cause?.includes('foreign key constraint failed')) {
      return NextResponse.json({ message: 'La categoriaId proporcionada no existe.' }, { status: 400 });
    }
    console.error('Error al crear producto:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}