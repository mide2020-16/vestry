/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { auth } from "@/auth";
import { getEventBySlug } from "@/lib/utils/event";

const ALLOWED_CATEGORIES = ["food", "drink", "mesh"] as const;
type Category = (typeof ALLOWED_CATEGORIES)[number];

function isValidCategory(value: unknown): value is Category {
  return ALLOWED_CATEGORIES.includes(value as Category);
}

// GET /api/products
export async function GET(request: Request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");
    const eventId = searchParams.get("eventId");
    
    const session = await auth();
    const isAdmin = !!session;

    if (category !== null && !isValidCategory(category)) {
      return NextResponse.json(
        {
          success: false,
          error: `category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    let finalEventId = eventId;
    if (!finalEventId && slug) {
      const event = await getEventBySlug(slug);
      if (event) finalEventId = (event as any)._id.toString();
    }

    if (!finalEventId) {
      return NextResponse.json(
        { success: false, error: "eventId or slug is required" },
        { status: 400 }
      );
    }

    // Admins see everything; public only sees available products
    const query: Record<string, unknown> = { eventId: finalEventId };
    if (category) query.category = category;
    if (!isAdmin) query.available = true;

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST /api/products — admin only
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    await dbConnect();

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const {
      name,
      image_url,
      price,
      category,
      available,
      modelUrl,
      inscriptions,
      eventId,
    } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "name is required and must be a non-empty string",
        },
        { status: 400 },
      );
    }

    if (!isValidCategory(category)) {
      return NextResponse.json(
        {
          success: false,
          error: `category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const product = await Product.create({
      name: name.trim(),
      image_url: image_url.trim(),
      price: Number(price) || 0,
      category,
      available: available !== false,
      modelUrl: typeof modelUrl === "string" ? modelUrl.trim() : undefined,
      inscriptions: Array.isArray(inscriptions) ? inscriptions : [],
      eventId,
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/products] error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}
