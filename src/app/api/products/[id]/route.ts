/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { isValidObjectId, Error as MongooseError } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { auth } from "@/auth";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// Helper to extract file key from UploadThing URL
function extractFileKey(url?: string): string | null {
  if (!url || !url.includes("utfs.io/f/")) return null;
  const parts = url.split("/");
  return parts[parts.length - 1] || null;
}

// Define the shape of your expected response data for better DX
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

type Params = Promise<{ id: string }>;

/* ── Response Helpers ───────────────────────────────────────────────────── */

// Fixed: Replaced 'data: any' with a generic T for better type safety
const jsonRes = <T>(data: ApiResponse<T>, status: number) =>
  NextResponse.json(data, { status });

const errorRes = (msg: string, status: number) =>
  NextResponse.json({ success: false, error: msg }, { status });

/* ── Handlers ───────────────────────────────────────────────────────────── */

// GET /api/products/[id]
export async function GET(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return errorRes("Invalid product ID", 400);

  try {
    await dbConnect();
    const product = await Product.findById(id).lean();

    if (!product) return errorRes("Product not found", 404);
    return jsonRes({ success: true, data: product }, 200);
  } catch (error) {
    console.error("GET Product Error:", error);
    return errorRes("Internal server error", 500);
  }
}

// PUT /api/products/[id]
export async function PUT(request: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return errorRes("Unauthorized", 401);

  const { id } = await params;
  if (!isValidObjectId(id)) return errorRes("Invalid product ID", 400);

  try {
    await dbConnect();
    const body = await request.json();

    // Data Sanitization
    if (body.inscriptions && !Array.isArray(body.inscriptions)) {
      return errorRes("Inscriptions must be an array of strings", 400);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    ).lean();

    if (!product) return errorRes("Product not found", 404);
    return jsonRes({ success: true, data: product }, 200);
  } catch (error: unknown) {
    // Fixed: Catch errors are 'unknown' by default in TS
    if (error instanceof MongooseError.ValidationError) {
      return errorRes(error.message, 400);
    }
    return errorRes("Internal server error", 500);
  }
}

// DELETE /api/products/[id]
export async function DELETE(_: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return errorRes("Unauthorized", 401);

  const { id } = await params;
  if (!isValidObjectId(id)) return errorRes("Invalid product ID", 400);

  try {
    await dbConnect();
    
    // Find the product first to get asset URLs
    const product = await Product.findById(id).lean();
    if (!product) return errorRes("Product not found", 404);

    // Delete associated UploadThing assets
    const keysToDelete: string[] = [];
    const imageKey = extractFileKey(product.image_url);
    const modelKey = extractFileKey(product.modelUrl);

    if (imageKey) keysToDelete.push(imageKey);
    if (modelKey) keysToDelete.push(modelKey);

    if (keysToDelete.length > 0) {
      try {
        await utapi.deleteFiles(keysToDelete);
      } catch (err) {
        console.error("Failed to delete assets from UploadThing:", err);
        // We continue anyway so the product is at least removed from DB
      }
    }

    await Product.findByIdAndDelete(id);

    return jsonRes({ success: true, message: "Product deleted and assets purged" }, 200);
  } catch (error) {
    return errorRes("Internal server error", 500);
  }
}
