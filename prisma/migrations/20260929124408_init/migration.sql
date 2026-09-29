-- CreateEnum
CREATE TYPE "employee_role" AS ENUM ('Barista', 'Cashier', 'Manager');

-- CreateEnum
CREATE TYPE "menu_category" AS ENUM ('Coffee', 'Tea', 'Pastry', 'Dessert');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('Open', 'Paid', 'Cancelled');

-- CreateTable
CREATE TABLE "customer" (
    "customer_id" INTEGER NOT NULL,
    "full_name" VARCHAR(80) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(100),

    CONSTRAINT "customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "employee" (
    "employee_id" INTEGER NOT NULL,
    "full_name" VARCHAR(80) NOT NULL,
    "role" "employee_role" NOT NULL,
    "hire_date" DATE NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "menu_item" (
    "item_id" INTEGER NOT NULL,
    "item_name" VARCHAR(60) NOT NULL,
    "category" "menu_category" NOT NULL,
    "price" DECIMAL(6,2) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "menu_item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "orders" (
    "order_id" INTEGER NOT NULL,
    "order_date" DATE NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'Open',
    "customer_id" INTEGER,
    "employee_id" INTEGER NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "order_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(6,2) NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("order_id","item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_phone_key" ON "customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "customer_email_key" ON "customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "menu_item_item_name_key" ON "menu_item"("item_name");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "menu_item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
