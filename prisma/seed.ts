import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.order_item.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.menu_item.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.customer.deleteMany();

  await prisma.customer.createMany({
    data: [
      { customer_id: 1, full_name: "Anong Suwan", phone: "081-234-5678", email: "anong@example.com" },
      { customer_id: 2, full_name: "Ben Carter", phone: "082-345-6789", email: null },
      { customer_id: 3, full_name: "Chai Prasert", phone: "083-456-7890", email: "chai@example.com" },
      { customer_id: 4, full_name: "Dara Lee", phone: "084-567-8901", email: "dara@example.com" },
    ],
  });

  await prisma.employee.createMany({
    data: [
      { employee_id: 1, full_name: "Mali Chan", role: "Barista", hire_date: new Date("2024-03-01") },
      { employee_id: 2, full_name: "Noi Somchai", role: "Cashier", hire_date: new Date("2024-06-15") },
      { employee_id: 3, full_name: "Pim Rattana", role: "Manager", hire_date: new Date("2023-01-10") },
    ],
  });

  await prisma.menu_item.createMany({
    data: [
      { item_id: 1, item_name: "Espresso", category: "Coffee", price: "60.00", is_available: true },
      { item_id: 2, item_name: "Latte", category: "Coffee", price: "85.00", is_available: true },
      { item_id: 3, item_name: "Green Tea", category: "Tea", price: "70.00", is_available: true },
      { item_id: 4, item_name: "Croissant", category: "Pastry", price: "75.00", is_available: true },
      { item_id: 5, item_name: "Cheesecake", category: "Dessert", price: "120.00", is_available: true },
    ],
  });

  await prisma.orders.createMany({
    data: [
      { order_id: 1, order_date: new Date("2026-09-25"), status: "Paid", customer_id: 1, employee_id: 2 },
      { order_id: 2, order_date: new Date("2026-09-26"), status: "Paid", customer_id: null, employee_id: 2 }, // walk-in
      { order_id: 3, order_date: new Date("2026-09-27"), status: "Paid", customer_id: 3, employee_id: 1 },
      { order_id: 4, order_date: new Date("2026-09-28"), status: "Open", customer_id: 1, employee_id: 2 },
    ],
  });

  await prisma.order_item.createMany({
    data: [
      { order_id: 1, item_id: 2, quantity: 2, unit_price: "85.00" },
      { order_id: 1, item_id: 4, quantity: 1, unit_price: "75.00" },
      { order_id: 2, item_id: 1, quantity: 1, unit_price: "60.00" },
      { order_id: 3, item_id: 3, quantity: 1, unit_price: "70.00" },
      { order_id: 3, item_id: 5, quantity: 1, unit_price: "120.00" },
      { order_id: 3, item_id: 2, quantity: 1, unit_price: "85.00" },
      { order_id: 4, item_id: 1, quantity: 2, unit_price: "60.00" },
      { order_id: 4, item_id: 4, quantity: 2, unit_price: "75.00" },
    ],
  });

  console.log("Seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
