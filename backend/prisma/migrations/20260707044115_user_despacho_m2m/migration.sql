-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users_despachos" (
    "user_id" INTEGER NOT NULL,
    "despacho_id" INTEGER NOT NULL,

    PRIMARY KEY ("user_id", "despacho_id"),
    CONSTRAINT "users_despachos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "users_despachos_despacho_id_fkey" FOREIGN KEY ("despacho_id") REFERENCES "despachos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "despachos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "clases_proceso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "etapas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "procesos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "radicado" TEXT NOT NULL,
    "demandante" TEXT NOT NULL,
    "demandado" TEXT NOT NULL,
    "instancia" TEXT NOT NULL,
    "fecha_ingreso_tribunal" DATETIME NOT NULL,
    "fecha_primera_instancia" DATETIME,
    "fecha_segunda_instancia" DATETIME,
    "juzgado_origen" TEXT,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "color_estado" TEXT NOT NULL DEFAULT 'VERDE',
    "despacho_actual_id" INTEGER NOT NULL,
    "etapa_actual_id" INTEGER NOT NULL,
    "clase_proceso_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "procesos_clase_proceso_id_fkey" FOREIGN KEY ("clase_proceso_id") REFERENCES "clases_proceso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "procesos_despacho_actual_id_fkey" FOREIGN KEY ("despacho_actual_id") REFERENCES "despachos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "procesos_etapa_actual_id_fkey" FOREIGN KEY ("etapa_actual_id") REFERENCES "etapas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tipos_providencia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "dias_termino" INTEGER NOT NULL,
    "orden_predeterminada" TEXT NOT NULL DEFAULT 'OTRO',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "providencias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proceso_id" INTEGER NOT NULL,
    "tipo_providencia_id" INTEGER NOT NULL,
    "fecha_providencia" DATETIME NOT NULL,
    "fecha_notificacion" DATETIME NOT NULL,
    "descripcion" TEXT,
    "orden" TEXT NOT NULL DEFAULT 'OTRO',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "providencias_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "procesos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "providencias_tipo_providencia_id_fkey" FOREIGN KEY ("tipo_providencia_id") REFERENCES "tipos_providencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "terminos_proceso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proceso_id" INTEGER NOT NULL,
    "providencia_id" INTEGER NOT NULL,
    "dias_totales" INTEGER NOT NULL,
    "fecha_inicio" DATETIME NOT NULL,
    "fecha_vencimiento" DATETIME NOT NULL,
    "fecha_cumplimiento" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "terminos_proceso_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "procesos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "terminos_proceso_providencia_id_fkey" FOREIGN KEY ("providencia_id") REFERENCES "providencias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER,
    "proceso_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notificaciones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "notificaciones_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "procesos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "actuaciones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proceso_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "actuaciones_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "procesos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "actuaciones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "despachos_codigo_key" ON "despachos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "clases_proceso_nombre_key" ON "clases_proceso"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "etapas_nombre_key" ON "etapas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "procesos_radicado_key" ON "procesos"("radicado");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_providencia_nombre_key" ON "tipos_providencia"("nombre");
