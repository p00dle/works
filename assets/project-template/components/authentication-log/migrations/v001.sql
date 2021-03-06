CREATE TABLE "authenticationLogs" (
  "uuid" uuid DEFAULT uuid_generate_v4(),
  "timestamp" timestamp without time zone NOT NULL,
  "username" text NOT NULL,
  "success" bool NOT NULL,
  "ipAddress" text,
  "country" text,
  "region" text,
  "city" text,
  CONSTRAINT "PK_authenticationLogs" PRIMARY KEY ("uuid")
);