import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';

type Params = Promise<{ ref: string }>;

// GET /api/registrations/by-ref/[ref]
export async function GET(_: Request, { params }: { params: Params }) {
  const { ref } = await params;

  if (!ref || !/^[\w-]+$/.test(ref)) {
    return NextResponse.json(
      { success: false, error: 'Invalid reference format' },
      { status: 400 },
    );
  }

  try {
    await dbConnect();

    const registration = await Registration.findOne({ paystackReference: ref })
      .populate('meshSelection', 'name price')
      .populate('foodSelections', 'name')
      .populate('drinkSelection', 'name')
      .lean();

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: registration });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registration' },
      { status: 500 },
    );
  }
}