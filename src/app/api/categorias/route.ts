import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importa la instancia de Prisma

// GET: Obtener todas las categorías
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: 'asc', // Ordenar por nombre ascendente
      },
    });
    return NextResponse.json(categorias, { status: 200 });
  } catch (error: unknown) { // CAMBIO CLAVE: de 'error' a 'error: unknown'
    console.error('Error al obtener categorías:', error);
    if (error instanceof Error) { // Verificar si es una instancia de Error
      return NextResponse.json({ message: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
    // Si no es una instancia de Error, manejarlo como un error desconocido
    return NextResponse.json({ message: 'Error interno del servidor (desconocido)' }, { status: 500 });
  }
}

// POST: Crear una nueva categoría
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') { // Añadida validación de tipo y trim
      return NextResponse.json({ message: 'El nombre de la categoría es requerido y debe ser una cadena de texto no vacía.' }, { status: 400 });
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: {
        nombre,
      },
    });
    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error: unknown) { // CAMBIO CLAVE: de 'error: any' a 'error: unknown'
    if (error instanceof Error) { // Verificar si es una instancia de Error
      const prismaError = error as any; // Castear a 'any' para acceder a propiedades específicas de PrismaClientKnownRequestError
      if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('nombre')) {
        return NextResponse.json({ message: 'Ya existe una categoría con este nombre.' }, { status: 409 });
      }
      console.error('Error al crear categoría:', error);
      return NextResponse.json({ message: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
    // Si no es una instancia de Error, manejarlo como un error desconocido
    console.error('Error desconocido al crear categoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor (desconocido)' }, { status: 500 });
  }
}