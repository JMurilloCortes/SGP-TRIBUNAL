-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'ESCRIBIENTE', 'NOTIFICADOR', 'CONTADOR_LIQUIDADOR', 'PROFESIONAL', 'SECRETARIO', 'OFICIAL_MAYOR');

-- CreateEnum
CREATE TYPE "Instancia" AS ENUM ('PRIMERA', 'SEGUNDA');

-- CreateEnum
CREATE TYPE "ColorEstado" AS ENUM ('VERDE', 'AMARILLO', 'NARANJA', 'ROJO', 'GRIS');

-- CreateEnum
CREATE TYPE "OrdenProvidencia" AS ENUM ('ADMITIR', 'INADMITIR', 'RECHAZAR', 'SENTENCIA', 'ARCHIVAR', 'REMITIR_CORTE', 'REMITIR_CONSEJO_ESTADO', 'DEVOLVER_JUZGADO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('ALERTA_VENCIMIENTO', 'VENCIDO', 'TAREA', 'INFO');

-- CreateEnum
CREATE TYPE "EstadoTermino" AS ENUM ('PENDIENTE', 'CUMPLIDO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "TipoConsecutivo" AS ENUM ('OFICIO', 'CIRCULAR', 'CITACION', 'RESOLUCION');

-- CreateEnum
CREATE TYPE "EstadoConsecutivo" AS ENUM ('DISPONIBLE', 'OCUPADO');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "cargo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_despachos" (
    "user_id" INTEGER NOT NULL,
    "despacho_id" INTEGER NOT NULL,

    CONSTRAINT "users_despachos_pkey" PRIMARY KEY ("user_id","despacho_id")
);

-- CreateTable
CREATE TABLE "despachos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "despachos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_juzgados" (
    "user_id" INTEGER NOT NULL,
    "juzgado_id" INTEGER NOT NULL,

    CONSTRAINT "users_juzgados_pkey" PRIMARY KEY ("user_id","juzgado_id")
);

-- CreateTable
CREATE TABLE "juzgados" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "juzgados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clases_proceso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clases_proceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etapas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procesos" (
    "id" SERIAL NOT NULL,
    "radicado" TEXT NOT NULL,
    "demandante" TEXT NOT NULL,
    "demandado" TEXT NOT NULL,
    "instancia" "Instancia" NOT NULL,
    "fecha_ingreso_tribunal" TIMESTAMP(3) NOT NULL,
    "fecha_primera_instancia" TIMESTAMP(3),
    "fecha_segunda_instancia" TIMESTAMP(3),
    "juzgado_origen_id" INTEGER,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "color_estado" "ColorEstado" NOT NULL DEFAULT 'VERDE',
    "despacho_actual_id" INTEGER NOT NULL,
    "etapa_actual_id" INTEGER NOT NULL,
    "clase_proceso_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_providencia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "dias_termino" INTEGER NOT NULL,
    "orden_predeterminada" "OrdenProvidencia" NOT NULL DEFAULT 'OTRO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_providencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providencias" (
    "id" SERIAL NOT NULL,
    "proceso_id" INTEGER NOT NULL,
    "tipo_providencia_id" INTEGER NOT NULL,
    "fecha_providencia" TIMESTAMP(3) NOT NULL,
    "fecha_notificacion" TIMESTAMP(3),
    "notificado_por" INTEGER,
    "descripcion" TEXT,
    "orden" "OrdenProvidencia" NOT NULL DEFAULT 'OTRO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "providencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos_oficio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modelos_oficio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terminos_proceso" (
    "id" SERIAL NOT NULL,
    "proceso_id" INTEGER NOT NULL,
    "providencia_id" INTEGER NOT NULL,
    "dias_totales" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "fecha_cumplimiento" TIMESTAMP(3),
    "estado" "EstadoTermino" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terminos_proceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "proceso_id" INTEGER NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consecutivos" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "TipoConsecutivo" NOT NULL DEFAULT 'OFICIO',
    "estado" "EstadoConsecutivo" NOT NULL DEFAULT 'DISPONIBLE',
    "tomado_por" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consecutivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuaciones" (
    "id" SERIAL NOT NULL,
    "proceso_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "despachos_codigo_key" ON "despachos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "juzgados_nombre_key" ON "juzgados"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "juzgados_codigo_key" ON "juzgados"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "clases_proceso_nombre_key" ON "clases_proceso"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "etapas_nombre_key" ON "etapas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "procesos_radicado_key" ON "procesos"("radicado");

-- CreateIndex
CREATE INDEX "procesos_radicado_idx" ON "procesos"("radicado");

-- CreateIndex
CREATE INDEX "procesos_demandante_idx" ON "procesos"("demandante");

-- CreateIndex
CREATE INDEX "procesos_demandado_idx" ON "procesos"("demandado");

-- CreateIndex
CREATE INDEX "procesos_despacho_actual_id_idx" ON "procesos"("despacho_actual_id");

-- CreateIndex
CREATE INDEX "procesos_etapa_actual_id_idx" ON "procesos"("etapa_actual_id");

-- CreateIndex
CREATE INDEX "procesos_color_estado_idx" ON "procesos"("color_estado");

-- CreateIndex
CREATE INDEX "procesos_vigente_idx" ON "procesos"("vigente");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_providencia_nombre_key" ON "tipos_providencia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_oficio_nombre_key" ON "modelos_oficio"("nombre");

-- CreateIndex
CREATE INDEX "consecutivos_numero_tipo_estado_idx" ON "consecutivos"("numero", "tipo", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "consecutivos_numero_tipo_key" ON "consecutivos"("numero", "tipo");

-- AddForeignKey
ALTER TABLE "users_despachos" ADD CONSTRAINT "users_despachos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_despachos" ADD CONSTRAINT "users_despachos_despacho_id_fkey" FOREIGN KEY ("despacho_id") REFERENCES "despachos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_juzgados" ADD CONSTRAINT "users_juzgados_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_juzgados" ADD CONSTRAINT "users_juzgados_juzgado_id_fkey" FOREIGN KEY ("juzgado_id") REFERENCES "juzgados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procesos" ADD CONSTRAINT "procesos_juzgado_origen_id_fkey" FOREIGN KEY ("juzgado_origen_id") REFERENCES "juzgados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procesos" ADD CONSTRAINT "procesos_clase_proceso_id_fkey" FOREIGN KEY ("clase_proceso_id") REFERENCES "clases_proceso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procesos" ADD CONSTRAINT "procesos_despacho_actual_id_fkey" FOREIGN KEY ("despacho_actual_id") REFERENCES "despachos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procesos" ADD CONSTRAINT "procesos_etapa_actual_id_fkey" FOREIGN KEY ("etapa_actual_id") REFERENCES "etapas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providencias" ADD CONSTRAINT "providencias_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "procesos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providencias" ADD CONSTRAINT "providencias_tipo_providencia_id_fkey" FOREIGN KEY ("tipo_providencia_id") REFERENCES "tipos_providencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providencias" ADD CONSTRAINT "providencias_notificado_por_fkey" FOREIGN KEY ("notificado_por") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminos_proceso" ADD CONSTRAINT "terminos_proceso_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "procesos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminos_proceso" ADD CONSTRAINT "terminos_proceso_providencia_id_fkey" FOREIGN KEY ("providencia_id") REFERENCES "providencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "procesos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consecutivos" ADD CONSTRAINT "consecutivos_tomado_por_fkey" FOREIGN KEY ("tomado_por") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuaciones" ADD CONSTRAINT "actuaciones_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "procesos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuaciones" ADD CONSTRAINT "actuaciones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
