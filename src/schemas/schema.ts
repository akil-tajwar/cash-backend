import { relations, sql } from "drizzle-orm";

import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  varchar,
  AnyMySqlColumn,
  text,
  mysqlEnum,
  decimal,
} from "drizzle-orm/mysql-core";

export const companyModel = mysqlTable("company", {
  companyId: int("company_id").primaryKey().autoincrement(),
  companyName: varchar("company_name", { length: 100 }).notNull().unique(),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 50 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 50 }),
  postalCode: varchar("postal_code", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  website: varchar("website", { length: 100 }),
  taxId: varchar("tax_id", { length: 50 }),
  logo: text("logo"),
  parentCompanyId: int("parent_company_id").references(
    (): AnyMySqlColumn => companyModel.companyId,
    { onDelete: "set null" }
  ),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
});

export const userModel = mysqlTable("users", {
  userId: int("user_id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("PASSWORD", { length: 255 }).notNull(),
  active: boolean("active").notNull().default(true),
  roleId: int("role_id").references(() => roleModel.roleId, {
    onDelete: "set null",
  }),
   isPasswordResetRequired: boolean("is_password_reset_required").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
});

export const userRelations = relations(userModel, ({ one, many }) => ({
  role: one(roleModel, {
    fields: [userModel.roleId],
    references: [roleModel.roleId],
  }),
  userCompanies: many(userCompanyModel),

}));
export const roleModel = mysqlTable("Roles", {
  roleId: int("role_id").primaryKey(),
  roleName: varchar("role_name", { length: 50 }).notNull(),
});

export const permissionsModel = mysqlTable("permissions", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});
export const rolePermissionsModel = mysqlTable("role_permissions", {
  roleId: int("role_id").references(() => roleModel.roleId),
  permissionId: int("permission_id").notNull().references(() => permissionsModel.id),
});
export const userRolesModel = mysqlTable("user_roles", {
  userId: int("user_id").notNull().references(() => userModel.userId),
  roleId: int("role_id").notNull().references(() => roleModel.roleId),
});

export const companyRelations = relations(companyModel, ({ one, many }) => ({
  parentCompany: one(companyModel, {
    fields: [companyModel.parentCompanyId],
    references: [companyModel.companyId],
  }),

  userCompanies: many(userCompanyModel),
}));

export const userCompanyModel = mysqlTable(
  "user_company",
  {
    userId: int("user_id")
      .notNull()
      .references(() => userModel.userId, { onDelete: "cascade" }),
    companyId: int("company_id")
      .notNull()
      .references(() => companyModel.companyId, { onDelete: "cascade" }),
  },
  (table) => ({
    primaryKey: [table.userId, table.companyId],
  })
);

export const userCompanyRelations = relations(userCompanyModel, ({ one }) => ({
  user: one(userModel, {
    fields: [userCompanyModel.userId],
    references: [userModel.userId],
  }),
  company: one(companyModel, {
    fields: [userCompanyModel.companyId],
    references: [companyModel.companyId],
  }),
}));

// Role ↔ Permissions
export const roleRelations = relations(roleModel, ({ many }) => ({
  rolePermissions: many(rolePermissionsModel),
}));

export const rolePermissionsRelations = relations(rolePermissionsModel, ({ one }) => ({
  role: one(roleModel, {
    fields: [rolePermissionsModel.roleId],
    references: [roleModel.roleId],
  }),
  permission: one(permissionsModel, {
    fields: [rolePermissionsModel.permissionId],
    references: [permissionsModel.id],
  }),
}));

// User ↔ Roles
export const userRolesRelations = relations(userRolesModel, ({ one }) => ({
  user: one(userModel, {
    fields: [userRolesModel.userId],
    references: [userModel.userId],
  }),
  role: one(roleModel, {
    fields: [userRolesModel.roleId],
    references: [roleModel.roleId],
  }),
}));

export const accountTypeModel = mysqlTable("account_type", {
  id: int("id").primaryKey().autoincrement(),
  type: mysqlEnum("type", ['BD','CC','EDF','TC','AER','STP','SOFR','STD','STC']).notNull(),
});

export const accountMainModel = mysqlTable("account_main", {
  id: int("id").primaryKey().autoincrement(),
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  accountType: int("account_type").references(() => accountTypeModel.id, {
    onDelete: "cascade",
  }).notNull(),
  accountNo: int("account_no").notNull(),
  limit: int("limit"),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default('0.00'),
  term: int("term"),
  companyId: int("company_id").references(() => companyModel.companyId, {
    onDelete: "cascade",
  }).notNull(),
});

export const transactionModel = mysqlTable("transactions", {
  id: int("id").primaryKey().autoincrement(),
  transactionDate: timestamp("transaction_date").default(sql`CURRENT_TIMESTAMP`),
  transactionType: mysqlEnum("transaction_type", ['Deposite', 'Withdraw']).notNull(),
  details: mysqlEnum("details", ['']).notNull(), // this will be come from another table
  amount: int("amount").notNull(),
});

export type User = typeof userModel.$inferSelect;
export type NewUser = typeof userModel.$inferInsert;
export type Role = typeof roleModel.$inferSelect;
export type NewRole = typeof roleModel.$inferInsert;
export type Company = typeof companyModel.$inferSelect;
export type NewCompany = typeof companyModel.$inferInsert;