CREATE TABLE "works_keyValues" (
  "key" text UNIQUE,
  "value" jsonb DEFAULT NULL,
  CONSTRAINT "PK_works_keyValues" PRIMARY KEY ("key")
);

CREATE INDEX "IN_works_keyValues__key" ON "works_keyValues" (
  "key"
);