import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función auxiliar para obtener el ID desde la URL
function getIdFromUrl(request: NextRequest): number | null {
  const urlParts = request.nextUrl.pathname.split('/');
  const idStr = urlParts[urlParts.length - 1];
  const id = parseInt(idStr);
  return isNaN(id) ? null : id;
}

export async function GET(request: NextRequest) {
  try {
    const id = getIdFromUrl(request);
    if (!id) {
      return NextResponse.json({ message: 'ID de categoría inválido.' }, { status: 400 });
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        productos: true,
      },
    });

    if (!categoria) {
      return NextResponse.json({ message: 'Categoría no encontrada.' }, { status: 404 });
    }

    return NextResponse.json(categoria, { status: 200 });
  } catch (error: unknown) {
    console.error('Error al obtener categoría por ID:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor (desconocido)' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = getIdFromUrl(request);
    if (!id) {
      return NextResponse.json({ message: 'ID de categoría inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return NextResponse.json({ message: 'El nombre de la categoría es requerido.' }, { status: 400 });
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id },
      data: { nombre },
    });

    return NextResponse.json(categoriaActualizada, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const prismaError = error as any;
      if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('nombre')) {
        return NextResponse.json({ message: 'Ya existe una categoría con este nombre.' }, { status: 409 });
      }
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: 'Categoría no encontrada para actualizar.' }, { status: 404 });
      }
      console.error('Error al actualizar categoría:', error);
      return NextResponse.json({ message: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor (desconocido)' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = getIdFromUrl(request);
    if (!id) {
      return NextResponse.json({ message: 'ID de categoría inválido.' }, { status: 400 });
    }

    await prisma.categoria.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Categoría eliminada exitosamente.' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const prismaError = error as any;
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: 'Categoría no encontrada para eliminar.' }, { status: 404 });
      }
      if (prismaError.code === 'P2003') {
        return NextResponse.json({ message: 'No se puede eliminar la categoría porque tiene productos asociados.' }, { status: 409 });
      }
      console.error('Error al eliminar categoría:', error);
      return NextResponse.json({ message: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor (desconocido)' }, { status: 500 });
  }
}
