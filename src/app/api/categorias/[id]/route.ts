// app/api/categorias/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Obtener una categoría por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
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
  } catch (error) {
    console.error('Error al obtener categoría por ID:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT: Actualizar una categoría por ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nombre } = body;

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de categoría inválido.' }, { status: 400 });
    }

    if (!nombre) {
      return NextResponse.json({ message: 'El nombre de la categoría es requerido.' }, { status: 400 });
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id },
      data: { nombre },
    });

    return NextResponse.json(categoriaActualizada, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('nombre')) {
      return NextResponse.json({ message: 'Ya existe una categoría con este nombre.' }, { status: 409 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Categoría no encontrada para actualizar.' }, { status: 404 });
    }
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE: Eliminar una categoría por ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de categoría inválido.' }, { status: 400 });
    }

    // Antes de eliminar la categoría, asegúrate de que no haya productos asociados
    // o maneja la eliminación en cascada si tu base de datos lo permite.
    // Prisma por defecto lanzará un error si intentas eliminar una categoría con productos asociados.
    // Puedes eliminar los productos primero o configurar el onDelete en el schema.prisma
    // (Ejemplo: @relation(fields: [categoriaId], references: [id], onDelete: Cascade))
    // Para este ejemplo, asumiremos que no hay productos o que los manejarás por separado.

    await prisma.categoria.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Categoría eliminada exitosamente.' }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Categoría no encontrada para eliminar.' }, { status: 404 });
    }
    if (error.code === 'P2003') { // Foreign key constraint failed
      return NextResponse.json({ message: 'No se puede eliminar la categoría porque tiene productos asociados. Elimine los productos primero.' }, { status: 409 });
    }
    console.error('Error al eliminar categoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}