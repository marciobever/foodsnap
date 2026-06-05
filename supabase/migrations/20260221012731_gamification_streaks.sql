alter table "public"."profiles" 
add column "current_streak" integer not null default 0,
add column "longest_streak" integer not null default 0,
add column "last_scan_date" date;
