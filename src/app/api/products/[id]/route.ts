/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { isValidObjectId, Error as MongooseError } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { auth } from "@/auth";
import { UTApi } from "uploadthing/server";
import { UserRole } from "@/models/User";

const utapi = new UTApi();

function extractFileKey(url?: string): string | null {
  if (!url || !url.includes("utfs.io/f/")) return null;
  const parts = url.split("/");
  return parts[parts.length - 1] || null;
}

// GET /api/products/[id]
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });

  try {
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

// PUT /api/products/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  try {
    await dbConnect();
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Role check: Super Admin can do anything; Event Admin must own the event
    if (user.role !== UserRole.SUPER_ADMIN) {
      const managedEventIds = user.managedEvents?.map((id: any) => id.toString()) || [];
      if (!managedEventIds.includes(product.eventId.toString())) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await request.json();
    Object.assign(product, body);
    await product.save();

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  try {
    await dbConnect();
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    if (user.role !== UserRole.SUPER_ADMIN) {
      const managedEventIds = user.managedEvents?.map((id: any) => id.toString()) || [];
      if (!managedEventIds.includes(product.eventId.toString())) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }

    const keysToDelete: string[] = [];
    if (product.image_url) {
      const key = extractFileKey(product.image_url);
      if (key) keysToDelete.push(key);
    }
    if (product.modelUrl) {
      const key = extractFileKey(product.modelUrl);
      if (key) keysToDelete.push(key);
    }

    if (keysToDelete.length > 0) {
      await utapi.deleteFiles(keysToDelete).catch(console.error);
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
