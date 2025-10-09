CREATE TABLE "session_code" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"used_by_session_id" text,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	CONSTRAINT "session_code_code_unique" UNIQUE("code")
);

ALTER TABLE "session_code" ADD CONSTRAINT "session_code_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;