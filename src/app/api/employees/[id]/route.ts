import { prisma } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };
const ROLES = ["Barista", "Cashier", "Manager"];

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { employee_id: Number(id) },
    include: { _count: { select: { orders: true } } },
  });
  return employee
    ? NextResponse.json(employee)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.full_name !== undefined) data.full_name = body.full_name;
  if (body.role !== undefined) {
    if (!ROLES.includes(body.role))
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    data.role = body.role;
  }
  if (body.hire_date !== undefined) {
    if (isNaN(Date.parse(body.hire_date)))
      return NextResponse.json({ error: "Invalid hire_date" }, { status: 400 });
    data.hire_date = new Date(body.hire_date);
  }

  try {
    const employee = await prisma.employee.update({
      where: { employee_id: Number(id) },
      data,
    });
    return NextResponse.json(employee);
  } catch (e: any) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.employee.delete({ where: { employee_id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (e.code === "P2003")
      return NextResponse.json(
        { error: "Employee has orders and cannot be deleted" },
        { status: 409 }
      );
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
