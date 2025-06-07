import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/* =========================================================================
   GET /api/categorias ─ Obtener todas las categorías
   ====================================================================== */
export async function GET(_request: NextRequest) {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(categorias, { status: 200 });
  } catch (error: unknown) {
    console.error('Error al obtener categorías:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: `Error interno del servidor: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: 'Error interno del servidor (desconocido)' },
      { status: 500 },
    );
  }
}

/* =========================================================================
   POST /api/categorias ─ Crear una nueva categoría
   ====================================================================== */
export async function POST(request: NextRequest) {
  try {
    const { nombre } = await request.json();

    // Validación
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return NextResponse.json(
        { message: 'El nombre de la categoría es requerido y debe ser texto no vacío.' },
        { status: 400 },
      );
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: { nombre: nombre.trim() },
    });

    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const prismaError = error as any; // acceso a propiedades específicas de Prisma

      // Violación de UNIQUE (nombre duplicado)
      if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('nombre')) {
        return NextResponse.json(
          { message: 'Ya existe una categoría con este nombre.' },
          { status: 409 },
        );
      }

      console.error('Error al crear categoría:', error);
      return NextResponse.json(
        { message: `Error interno del servidor: ${error.message}` },
        { status: 500 },
      );
    }

    console.error('Error desconocido al crear categoría:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor (desconocido)' },
      { status: 500 },
    );
  }
}
