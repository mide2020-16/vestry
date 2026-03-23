import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { auth } from '@/auth';

type Params = Promise<{ id: string }>;

function invalidId() {
  return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
}

function notFound() {
  return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
}

function serverError() {
  return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
}

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

// GET /api/products/[id]
export async function GET(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return invalidId();

  try {
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product) return notFound();
    return NextResponse.json({ success: true, data: product });
  } catch {
    return serverError();
  }
}

// PUT /api/products/[id]
export async function PUT(request: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return unauthorized();

  const { id } = await params;
  if (!isValidObjectId(id)) return invalidId();

  try {
    await dbConnect();
    const body = await request.json();
    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!product) return notFound();
    return NextResponse.json({ success: true, data: product });
  } catch {
    return serverError();
  }
}

// DELETE /api/products/[id]
export async function DELETE(_: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return unauthorized();

  const { id } = await params;
  if (!isValidObjectId(id)) return invalidId();

  try {
    await dbConnect();
    const product = await Product.findByIdAndDelete(id).lean();
    if (!product) return notFound();
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch {
    return serverError();
  }
}