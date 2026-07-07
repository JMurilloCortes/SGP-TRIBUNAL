export interface User {
  id: number
  nombre: string
  email: string
  rol: 'ADMIN' | 'ESCRIBIENTE'
  despachos: Despacho[]
  activo: boolean
}

export interface Despacho {
  id: number
  nombre: string
  codigo: string
}

export interface Proceso {
  id: number
  radicado: string
  demandante: string
  demandado: string
  instancia: 'PRIMERA' | 'SEGUNDA'
  fechaIngresoTribunal: string
  fechaPrimeraInstancia: string | null
  fechaSegundaInstancia: string | null
  juzgadoOrigen: string | null
  vigente: boolean
  colorEstado: 'VERDE' | 'AMARILLO' | 'NARANJA' | 'ROJO' | 'GRIS'
  despachoActualId: number
  etapaActualId: number
  claseProcesoId: number
  createdAt: string
  claseProceso?: ClaseProceso
  etapaActual?: Etapa
  despachoActual?: Despacho
  providencias?: Providencia[]
  terminos?: TerminoProceso[]
}

export interface ClaseProceso {
  id: number
  nombre: string
}

export interface Etapa {
  id: number
  nombre: string
  descripcion: string | null
  orden: number
}

export interface TipoProvidencia {
  id: number
  nombre: string
  diasTermino: number
  ordenPredeterminada: string
}

export interface Providencia {
  id: number
  procesoId: number
  tipoProvidenciaId: number
  fechaProvidencia: string
  fechaNotificacion: string
  descripcion: string | null
  orden: string
  createdAt: string
  tipoProvidencia?: TipoProvidencia
  terminos?: TerminoProceso[]
}

export interface TerminoProceso {
  id: number
  procesoId: number
  providenciaId: number
  diasTotales: number
  fechaInicio: string
  fechaVencimiento: string
  fechaCumplimiento: string | null
  estado: 'PENDIENTE' | 'CUMPLIDO' | 'VENCIDO'
  providencia?: Providencia
}

export interface Notificacion {
  id: number
  userId: number | null
  procesoId: number
  tipo: 'ALERTA_VENCIMIENTO' | 'VENCIDO' | 'TAREA' | 'INFO'
  mensaje: string
  leida: boolean
  createdAt: string
  proceso?: Proceso
}

export interface LoginResponse {
  token: string
  user: User
}
