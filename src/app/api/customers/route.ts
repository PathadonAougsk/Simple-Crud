import { prisma } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { full_name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { full_name: "asc" },
  });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.full_name || typeof body.full_name !== "string")
    return NextResponse.json({ error: "full_name required" }, { status: 400 });

  if (body.email && !/^\S+@\S+\.\S+$/.test(body.email))
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  try {
    const customer = await prisma.customer.create({
      data: {
        full_name: body.full_name,
        phone: body.phone || null,
        email: body.email || null,
      },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002")
      return NextResponse.json(
        { error: "Phone or email already registered" },
        { status: 409 }
      );
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
