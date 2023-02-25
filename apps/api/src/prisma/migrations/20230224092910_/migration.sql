/*
  Warnings:

  - You are about to drop the column `spotifyUri` on the `music_tag` table. All the data in the column will be lost.
  - Added the required column `type` to the `music_tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uri` to the `music_tag` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_music_tag" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "imageUrl" TEXT
);
INSERT INTO "new_music_tag" ("created_at", "imageUrl", "name", "uid", "updated_at") SELECT "created_at", "imageUrl", "name", "uid", "updated_at" FROM "music_tag";
DROP TABLE "music_tag";
ALTER TABLE "new_music_tag" RENAME TO "music_tag";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
