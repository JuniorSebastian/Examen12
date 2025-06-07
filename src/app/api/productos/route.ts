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
  } catch (error: unknown) {
    console.error('Error al obtener productos:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor (desconocido)' }, { status: 500 });
  }
}

// POST: Crear un nuevo producto
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, descripcion, precio, stock, categoriaId } = body;

    // Validación básica
    if (!nombre || precio === undefined || stock === undefined || categoriaId === undefined) {
      return NextResponse.json(
        { message: 'Todos los campos obligatorios (nombre, precio, stock, categoriaId) son requeridos.' },
        { status: 400 }
      );
    }

    // Conversión y validación de tipos
    const parsedPrecio = parseFloat(precio);
    const parsedStock = parseInt(stock);
    const parsedCategoriaId = parseInt(categoriaId);

    if (isNaN(parsedPrecio) || isNaN(parsedStock) || isNaN(parsedCategoriaId)) {
      return NextResponse.json(
        { message: 'Precio, stock y categoriaId deben ser números válidos.' },
        { status: 400 }
      );
    }

    // Crear el nuevo producto
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion ?? '', // Asegurarse de que no sea null
        precio: parsedPrecio,
        stock: parsedStock,
        categoriaId: parsedCategoriaId,
      },
    });

    return NextResponse.json(nuevoProducto, { status: 201 });

  } catch (error: unknown) {
    console.error('Error al crear producto:', error);
    if (error instanceof Error) {
      const prismaError = error as any;
      if (prismaError.code === 'P2003') {
        return NextResponse.json({ message: 'La categoriaId proporcionada no existe.' }, { status: 400 });
      }
      return NextResponse.json({ message: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor (desconocido)' }, { status: 500 });
  }
}
