CREATE TABLE "note_folder" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"parent_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "note" ALTER COLUMN "date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "folder_id" text;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "note_folder" ADD CONSTRAINT "note_folder_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_parent_folder_slug_unique" ON "note_folder" USING btree ("user_id","parent_id","slug");--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_folder_id_note_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."note_folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_folder_note_slug_unique" ON "note" USING btree ("user_id","folder_id","slug");