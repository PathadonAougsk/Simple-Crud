import { prisma } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const orders = await prisma.orders.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      customer: true,
      employee: { select: { employee_id: true, full_name: true } },
      order_items: { include: { item: { select: { item_name: true } } } },
    },
    orderBy: { order_id: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const { employee_id, customer_id, items } = await req.json();

  if (!employee_id || !Array.isArray(items) || items.length === 0)
    return NextResponse.json({ error: "employee_id and items required" }, { status: 400 });

  const menu = await prisma.menu_item.findMany({
    where: { item_id: { in: items.map((i: any) => i.item_id) }, is_available: true },
  });
  const priceById = new Map(menu.map((m) => [m.item_id, m.price]));

  if (items.some((i: any) => !priceById.has(i.item_id) || !(i.quantity > 0)))
    return NextResponse.json({ error: "Unknown/unavailable item or bad quantity" }, { status: 400 });

  try {
    const order = await prisma.orders.create({
      data: {
        order_date: new Date(),
        employee_id,
        customer_id: customer_id ?? null,
        order_items: {
          create: items.map((i: any) => ({
            item_id: i.item_id,
            quantity: i.quantity,
            unit_price: priceById.get(i.item_id)!,
          })),
        },
      },
      include: { order_items: true },
    });
    return NextResponse.json(order, { status: 201 });
  } catch (e: any) {
    console.log(e)
    if (e.code === "P2003")
      return NextResponse.json({ error: "Invalid employee or customer" }, { status: 400 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
