// app/api/categorias/route.ts
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
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Crear una nueva categoría
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre } = body;

    if (!nombre) {
      return NextResponse.json({ message: 'El nombre de la categoría es requerido.' }, { status: 400 });
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: {
        nombre,
      },
    });
    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('nombre')) {
      return NextResponse.json({ message: 'Ya existe una categoría con este nombre.' }, { status: 409 });
    }
    console.error('Error al crear categoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}