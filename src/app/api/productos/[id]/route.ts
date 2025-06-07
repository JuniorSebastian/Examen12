import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/* ────────────────────────────────
   Función auxiliar: obtiene el id
   ──────────────────────────────── */
function getIdFromUrl(request: NextRequest): number | null {
  const idStr = request.nextUrl.pathname.split('/').pop();
  const id = Number(idStr);
  return Number.isNaN(id) ? null : id;
}

/* ═══════════════════════════════════════════════════════════════════════════
   GET /api/productos/[id]  →  Obtener un producto por ID
   ═══════════════════════════════════════════════════════════════════════════ */
export async function GET(request: NextRequest) {
  try {
    const id = getIdFromUrl(request);
    if (!id) {
      return NextResponse.json({ message: 'ID de producto inválido.' }, { status: 400 });
    }

    const producto = await prisma.producto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!producto) {
      return NextResponse.json({ message: 'Producto no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(producto, { status: 200 });
  } catch (error: unknown) {
    console.error('Error al obtener producto por ID:', error);
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

/* ═══════════════════════════════════════════════════════════════════════════
   PUT /api/productos/[id]  →  Actualizar un producto por ID
   ═══════════════════════════════════════════════════════════════════════════ */
export async function PUT(request: NextRequest) {
  try {
    const id = getIdFromUrl(request);
    if (!id) {
      return NextResponse.json({ message: 'ID de producto inválido.' }, { status: 400 });
    }

    const { nombre, descripcion, precio, stock, categoriaId } = await request.json();

    // Validaciones básicas
    if (!nombre || precio === undefined || stock === undefined || !categoriaId) {
      return NextResponse.json(
        { message: 'nombre, precio, stock y categoriaId son obligatorios.' },
        { status: 400 },
      );
    }

    const parsedPrecio = Number(precio);
    const parsedStock = Number(stock);
    const parsedCategoriaId = Number(categoriaId);

    if (
      Number.isNaN(parsedPrecio) ||
      Number.isNaN(parsedStock) ||
      Number.isNaN(parsedCategoriaId)
    ) {
      return NextResponse.json(
        { message: 'precio, stock y categoriaId deben ser números válidos.' },
        { status: 400 },
      );
    }

    const productoActualizado = await prisma.producto.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        precio: parsedPrecio,
        stock: parsedStock,
        categoriaId: parsedCategoriaId,
      },
    });

    return NextResponse.json(productoActualizado, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const prismaError = error as any;

      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { message: 'Producto no encontrado para actualizar.' },
          { status: 404 },
        );
      }

      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { message: 'La categoriaId proporcionada no existe.' },
          { status: 400 },
        );
      }

      console.error('Error al actualizar producto:', error);
      return NextResponse.json(
        { message: `Error interno del servidor: ${error.message}` },
        { status: 500 },
      );
    }

    console.error('Error desconocido al actualizar producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor (desconocido)' },
      { status: 500 },
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   DELETE /api/productos/[id]  →  Eliminar un producto por ID
   ═══════════════════════════════════════════════════════════════════════════ */
export async function DELETE(request: NextRequest) {
  try {
    const id = getIdFromUrl(request);
    if (!id) {
      return NextResponse.json({ message: 'ID de producto inválido.' }, { status: 400 });
    }

    await prisma.producto.delete({ where: { id } });
    return NextResponse.json({ message: 'Producto eliminado exitosamente.' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const prismaError = error as any;

      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { message: 'Producto no encontrado para eliminar.' },
          { status: 404 },
        );
      }

      console.error('Error al eliminar producto:', error);
      return NextResponse.json(
        { message: `Error interno del servidor: ${error.message}` },
        { status: 500 },
      );
    }

    console.error('Error desconocido al eliminar producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor (desconocido)' },
      { status: 500 },
    );
  }
}
