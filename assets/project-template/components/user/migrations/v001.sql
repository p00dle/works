CREATE TABLE "users_role_ENUM" (
  "enum_value" text UNIQUE PRIMARY KEY
);

INSERT INTO "users_role_ENUM" ("enum_value") VALUES
  ('admin'),
  ('non-admin');

CREATE TABLE "users" (
  "uuid" uuid DEFAULT uuid_generate_v4() UNIQUE,
  "username" text UNIQUE,
  "passwordHash" text NOT NULL,
  "role" text NOT NULL DEFAULT 'non-admin',
  "email" text UNIQUE,
  "fullName" text,
  "lastLogin" timestamp,
  "managerId" text,
  "passwordLastChanged" timestamp,
  "passwordResetToken" text,
  "passwordResetTokenExpiry" timestamp,
  "permissions" jsonb DEFAULT '{}',
  CONSTRAINT "PK_users" PRIMARY KEY ("uuid"),
  CONSTRAINT "FK_users_role_ENUM" FOREIGN KEY ("role") REFERENCES "users_role_ENUM" ("enum_value") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- TODO: add managerId constraint
CREATE INDEX "IN_users__username" ON "users" (
  "username"
);

CREATE INDEX "IN_users__email" ON "users" (
  "email"
);

