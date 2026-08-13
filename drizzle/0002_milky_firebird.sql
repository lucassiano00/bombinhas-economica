CREATE TYPE "public"."plan" AS ENUM('individual', 'casal', 'familia');--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "plan" "plan" DEFAULT 'familia' NOT NULL;