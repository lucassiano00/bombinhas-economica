ALTER TABLE "clients" ADD COLUMN "country" text DEFAULT 'BR' NOT NULL;--> statement-breakpoint
ALTER TABLE "dependents" ADD COLUMN "phone" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "dependents" ADD COLUMN "country" text DEFAULT 'BR' NOT NULL;