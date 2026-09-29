import { prisma } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

const ROLES = ["Barista", "Cashier", "Manager"];

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");
  if (role && !ROLES.includes(role))
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const employees = await prisma.employee.findMany({
    where: role ? { role: role as any } : undefined,
    orderBy: { full_name: "asc" },
  });
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.full_name || !ROLES.includes(body.role) || isNaN(Date.parse(body.hire_date)))
    return NextResponse.json(
      { error: "full_name, valid role and hire_date required" },
      { status: 400 }
    );

  try {
    const employee = await prisma.employee.create({
      data: {
        full_name: body.full_name,
        role: body.role,
        hire_date: new Date(body.hire_date),
      },
    });
    return NextResponse.json(employee, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
