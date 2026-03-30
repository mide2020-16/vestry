import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { auth } from '@/auth';

const ALLOWED_CATEGORIES = ['food', 'drink', 'mesh'] as const;
type Category = (typeof ALLOWED_CATEGORIES)[number];

function isValidCategory(value: unknown): value is Category {
  return ALLOWED_CATEGORIES.includes(value as Category);
}

// GET /api/products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const session = await auth();
    const isAdmin = !!session;

    if (category !== null && !isValidCategory(category)) {
      return NextResponse.json(
        { success: false, error: `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` },
        { status: 400 },
      );
    }

    await dbConnect();

    // Admins see everything; public only sees available products
    const query: Record<string, unknown> = category ? { category } : {};
    if (!isAdmin) query.available = true;

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}

// POST /api/products — admin only
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { success: false, error: 'Request body must be a JSON object' },
        { status: 400 },
      );
    }

    const { name, image_url, price, category, available, modelUrl, inscriptions } = body as {
      name?: unknown;
      image_url?: unknown;
      price?: unknown;
      category?: unknown;
      available?: unknown;
      modelUrl?: unknown;
      inscriptions?: unknown;
    };

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'name is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    if (!image_url || typeof image_url !== 'string' || image_url.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'image_url is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    if (!isValidCategory(category)) {
      return NextResponse.json(
        { success: false, error: `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` },
        { status: 400 },
      );
    }

    const parsedPrice =
      typeof price === 'number'
        ? price
        : typeof price === 'string' && price.trim() !== ''
          ? parseFloat(price)
          : 0;

    const product = await Product.create({
      name: name.trim(),
      image_url: image_url.trim(),
      price: isNaN(parsedPrice) || parsedPrice < 0 ? 0 : parsedPrice,
      category,
      available: available !== false,
      modelUrl: typeof modelUrl === 'string' ? modelUrl.trim() : undefined,
      inscriptions: Array.isArray(inscriptions) ? inscriptions.filter((i): i is string => typeof i === 'string') : [],
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/products] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product',
      },
      { status: 500 },
    );
  }
}