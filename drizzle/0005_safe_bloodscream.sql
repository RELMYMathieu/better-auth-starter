CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"event_category" text NOT NULL,
	"severity" text NOT NULL,
	"user_id" text,
	"user_email" text,
	"user_role" text,
	"target_user_id" text,
	"target_user_email" text,
	"ip_address" text,
	"user_agent" text,
	"session_id" text,
	"description" text NOT NULL,
	"metadata" jsonb,
	"success" text NOT NULL,
	"error_message" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_change_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"current_email" text NOT NULL,
	"new_email" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"verified_at" timestamp,
	CONSTRAINT "email_change_request_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "email_change_request" ADD CONSTRAINT "email_change_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;