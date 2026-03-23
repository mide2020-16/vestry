import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import { nanoid } from 'nanoid';

// ── types ──────────────────────────────────────────────────────────────────

interface RegistrationBody {
  name?: unknown;
  email?: unknown;
  ticketType?: unknown;
  partnerName?: unknown;
  meshSelection?: unknown;
  foodSelections?: unknown;
  drinkSelection?: unknown;
}

// ── helpers ────────────────────────────────────────────────────────────────

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidTicketType(value: unknown): value is 'single' | 'couple' {
  return value === 'single' || value === 'couple';
}

async function calculateTotal(
  ticketType: 'single' | 'couple',
  meshSelection: unknown,
): Promise<number> {
  const settings = await Settings.findOne().lean() ?? await Settings.create({});
  const base = ticketType === 'couple' ? settings.couplePrice : settings.singlePrice;

  if (!meshSelection) return base;

  const mesh = await Product.findById(meshSelection).lean();
  const meshPrice = (mesh?.price ?? 0) * (ticketType === 'couple' ? 2 : 1);

  return base + meshPrice;
}

// ── route handler ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = (await request.json()) as RegistrationBody;
    const { name, email, ticketType, partnerName, meshSelection, foodSelections, drinkSelection } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'A valid email is required' },
        { status: 400 },
      );
    }
    if (!isValidTicketType(ticketType)) {
      return NextResponse.json(
        { success: false, error: 'ticketType must be "single" or "couple"' },
        { status: 400 },
      );
    }

    const totalAmount = await calculateTotal(ticketType, meshSelection);
    const paystackReference = `VESTRY-${nanoid(10).toUpperCase()}`;

    const registration = await Registration.create({
      name,
      email,
      ticketType,
      partnerName,
      meshSelection,
      foodSelections,
      drinkSelection,
      totalAmount,
      paystackReference,
      payment_status: false,
    });

    console.log('Registration created:', registration._id, 'ref:', paystackReference);

    return NextResponse.json(
      {
        _id: registration._id,
        paystackReference: registration.paystackReference,
        totalAmount: registration.totalAmount,
        paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create registration';
    console.error('Registration error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}