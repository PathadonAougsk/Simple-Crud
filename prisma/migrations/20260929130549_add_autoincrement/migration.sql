-- AlterTable
CREATE SEQUENCE customer_customer_id_seq;
ALTER TABLE "customer" ALTER COLUMN "customer_id" SET DEFAULT nextval('customer_customer_id_seq');
ALTER SEQUENCE customer_customer_id_seq OWNED BY "customer"."customer_id";

-- AlterTable
CREATE SEQUENCE employee_employee_id_seq;
ALTER TABLE "employee" ALTER COLUMN "employee_id" SET DEFAULT nextval('employee_employee_id_seq');
ALTER SEQUENCE employee_employee_id_seq OWNED BY "employee"."employee_id";

-- AlterTable
CREATE SEQUENCE menu_item_item_id_seq;
ALTER TABLE "menu_item" ALTER COLUMN "item_id" SET DEFAULT nextval('menu_item_item_id_seq');
ALTER SEQUENCE menu_item_item_id_seq OWNED BY "menu_item"."item_id";

-- AlterTable
CREATE SEQUENCE orders_order_id_seq;
ALTER TABLE "orders" ALTER COLUMN "order_id" SET DEFAULT nextval('orders_order_id_seq');
ALTER SEQUENCE orders_order_id_seq OWNED BY "orders"."order_id";
