// app/api/categorias/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Definición de tipo para los parámetros de la URL dinámica
interface RouteParams {
  params: {
    id: string;
  };
}

// GET: Obtener una categoría por ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de categoría inválido.' }, { status: 400 });
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        productos: true, // Opcional: Incluir los productos asociados a la categoría
      },
    });

    if (!categoria) {
      return NextResponse.json({ message: 'Categoría no encontrada.' }, { status: 404 });
    }

    return NextResponse.json(categoria, { status: 200 });
  } catch (error: unknown) { // CAMBIO CLAVE: de 'any' a 'unknown'
    console.error('Error al obtener categoría por ID:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor (desconocido)' }, { status: 500 });
  }
}

// PUT: Actualizar una categoría por ID
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nombre } = body;

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de categoría inválido.' }, { status: 400 });
    }

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return NextResponse.json({ message: 'El nombre de la categoría es requerido y debe ser una cadena de texto.' }, { status: 400 });
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id },
      data: { nombre },
    });

    return NextResponse.json(categoriaActualizada, { status: 200 });
  } catch (error: unknown) { // CAMBIO CLAVE: de 'any' a 'unknown'
    if (error instanceof Error) {
      // Manejo específico para errores de Prisma
      const prismaError = error as any; // Cast a any para acceder a propiedades específicas de PrismaClientKnownRequestError
      if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('nombre')) {
        return NextResponse.json({ message: 'Ya existe una categoría con este nombre.' }, { status: 409 });
      }
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: 'Categoría no encontrada para actualizar.' }, { status: 404 });
      }
      console.error('Error al actualizar categoría:', error);
      return NextResponse.json({ message: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
    console.error('Error desconocido al actualizar categoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor (desconocido)' }, { status: 500 });
  }
}

// DELETE: Eliminar una categoría por ID
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de categoría inválido.' }, { status: 400 });
    }

    await prisma.categoria.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Categoría eliminada exitosamente.' }, { status: 200 });
  } catch (error: unknown) { // CAMBIO CLAVE: de 'any' a 'unknown'
    if (error instanceof Error) {
      const prismaError = error as any;
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: 'Categoría no encontrada para eliminar.' }, { status: 404 });
      }
      if (prismaError.code === 'P2003') { // Foreign key constraint failed
        return NextResponse.json({ message: 'No se puede eliminar la categoría porque tiene productos asociados. Elimine los productos primero.' }, { status: 409 });
      }
      console.error('Error al eliminar categoría:', error);
      return NextResponse.json({ message: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
    console.error('Error desconocido al eliminar categoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor (desconocido)' }, { status: 500 });
  }
}