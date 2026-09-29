import { prisma } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { customer_id: Number(id) },
    include: {
      orders: {
        orderBy: { order_id: "desc" },
        take: 10,
        select: { order_id: true, order_date: true, status: true },
      },
    },
  });
  return customer
    ? NextResponse.json(customer)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.full_name !== undefined) {
    if (!body.full_name)
      return NextResponse.json({ error: "full_name cannot be empty" }, { status: 400 });
    data.full_name = body.full_name;
  }
  if (body.phone !== undefined) data.phone = body.phone || null;
  if (body.email !== undefined) {
    if (body.email && !/^\S+@\S+\.\S+$/.test(body.email))
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    data.email = body.email || null;
  }

  try {
    const customer = await prisma.customer.update({
      where: { customer_id: Number(id) },
      data,
    });
    return NextResponse.json(customer);
  } catch (e: any) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (e.code === "P2002")
      return NextResponse.json({ error: "Phone or email already in use" }, { status: 409 });
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.customer.delete({ where: { customer_id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
