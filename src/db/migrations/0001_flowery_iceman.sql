CREATE TABLE "comment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"todo_id" text,
	"note_id" text,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_todo_id_todo_id_fk" FOREIGN KEY ("todo_id") REFERENCES "public"."todo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_note_id_note_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."note"("id") ON DELETE cascade ON UPDATE no action;