import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import { auth } from '@/auth';

export async function GET() {
  try {
    await dbConnect();
    const settings = await Settings.findOne().lean();
    return NextResponse.json({ success: true, data: settings ?? null });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();

    const settings = await Settings.findOneAndUpdate(
      {},
      {$set: body},
      { new: true, upsert: true, runValidators: true },
    ).lean();

    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 },
    );
  }
}