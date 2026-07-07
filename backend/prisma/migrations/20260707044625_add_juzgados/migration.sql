/*
  Warnings:

  - You are about to drop the column `juzgado_origen` on the `procesos` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "juzgados" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_procesos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "radicado" TEXT NOT NULL,
    "demandante" TEXT NOT NULL,
    "demandado" TEXT NOT NULL,
    "instancia" TEXT NOT NULL,
    "fecha_ingreso_tribunal" DATETIME NOT NULL,
    "fecha_primera_instancia" DATETIME,
    "fecha_segunda_instancia" DATETIME,
    "juzgado_origen_id" INTEGER,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "color_estado" TEXT NOT NULL DEFAULT 'VERDE',
    "despacho_actual_id" INTEGER NOT NULL,
    "etapa_actual_id" INTEGER NOT NULL,
    "clase_proceso_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "procesos_juzgado_origen_id_fkey" FOREIGN KEY ("juzgado_origen_id") REFERENCES "juzgados" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "procesos_clase_proceso_id_fkey" FOREIGN KEY ("clase_proceso_id") REFERENCES "clases_proceso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "procesos_despacho_actual_id_fkey" FOREIGN KEY ("despacho_actual_id") REFERENCES "despachos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "procesos_etapa_actual_id_fkey" FOREIGN KEY ("etapa_actual_id") REFERENCES "etapas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_procesos" ("clase_proceso_id", "color_estado", "created_at", "demandado", "demandante", "despacho_actual_id", "etapa_actual_id", "fecha_ingreso_tribunal", "fecha_primera_instancia", "fecha_segunda_instancia", "id", "instancia", "radicado", "updated_at", "vigente") SELECT "clase_proceso_id", "color_estado", "created_at", "demandado", "demandante", "despacho_actual_id", "etapa_actual_id", "fecha_ingreso_tribunal", "fecha_primera_instancia", "fecha_segunda_instancia", "id", "instancia", "radicado", "updated_at", "vigente" FROM "procesos";
DROP TABLE "procesos";
ALTER TABLE "new_procesos" RENAME TO "procesos";
CREATE UNIQUE INDEX "procesos_radicado_key" ON "procesos"("radicado");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "juzgados_nombre_key" ON "juzgados"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "juzgados_codigo_key" ON "juzgados"("codigo");
