CREATE TABLE "userTelemetryLogs" (
  "uuid" uuid UNIQUE,
  "type" text NOT NULL,
  "username" text,
  "path" text,
  "timestamp" timestamp without time zone DEFAULT now(),
  "interval" integer DEFAULT 0,
  "details" jsonb,
  CONSTRAINT "PK_user_telemetry_logs" PRIMARY KEY ("uuid")
);
