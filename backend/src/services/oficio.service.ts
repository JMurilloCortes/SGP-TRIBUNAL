import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx'

function formatDate(d: Date): string {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
}

interface DatosOficio {
  ciudad: string
  radicado: string
  demandante: string
  demandado: string
  fecha: Date
  destinatario: string
  cargo: string
  entidad: string
  direccion: string
  asunto: string
  cuerpo?: string
  despachoOrigen?: string
}

function firma(): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: 'Atentamente,', font: 'Arial', size: 22 })] }),
    new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: '___________________________________', font: 'Arial', size: 22 })] }),
    new Paragraph({ children: [new TextRun({ text: 'MAGISTRADO(A)', font: 'Arial', size: 22, bold: true })] }),
    new Paragraph({ children: [new TextRun({ text: 'Tribunal Administrativo del Chocó', font: 'Arial', size: 22 })] }),
  ]
}

function crearDocumento(datos: DatosOficio): Document {
  return new Document({
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: `Quibdó, ${formatDate(datos.fecha)}`, font: 'Arial', size: 22 })],
        }),
        new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: '', size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: 'Señor(a):', font: 'Arial', size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: datos.destinatario, font: 'Arial', size: 22, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: datos.cargo, font: 'Arial', size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: datos.entidad, font: 'Arial', size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: datos.direccion, font: 'Arial', size: 22 })] }),
        new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: '', size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: 'Referencia: ', font: 'Arial', size: 22, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: datos.asunto, font: 'Arial', size: 22 })] }),
        new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: `Radicado: ${datos.radicado}`, font: 'Arial', size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: `Demandante: ${datos.demandante}`, font: 'Arial', size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: `Demandado: ${datos.demandado}`, font: 'Arial', size: 22 })] }),
        new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: '', size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: 'Respetado(a) señor(a):', font: 'Arial', size: 22 })] }),
        new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: datos.cuerpo || '', font: 'Arial', size: 22 })] }),
        ...firma(),
      ],
    }],
  })
}

export function generarOficioDevolverJuzgado(datos: DatosOficio): Document {
  datos.cuerpo = `De manera atenta me permito remitir a su Despacho el expediente contentivo del proceso de la referencia, para lo de su competencia, una vez surtido el trámite correspondiente en esta Corporación.

Lo anterior, en cumplimiento de lo ordenado mediante providencia del ${formatDate(datos.fecha)}, debidamente ejecutoriada.

Adjunto: Expediente contentivo de ${datos.despachoOrigen || 'las actuaciones surtidas'}.`
  return crearDocumento(datos)
}

export function generarOficioComunicarProvidencia(datos: DatosOficio): Document {
  datos.cuerpo = `De manera atenta me permito comunicar a usted la providencia dictada dentro del proceso de la referencia, para los fines legales correspondientes.

La providencia en mención fue notificada por estado el día de hoy, y el término de ejecutoria comienza a correr a partir de la presente comunicación.

Sírvase tener en cuenta lo dispuesto en la parte resolutiva de la misma.`
  return crearDocumento(datos)
}

export function generarOficioSolicitarInformes(datos: DatosOficio): Document {
  datos.cuerpo = `De manera comedida me permito solicitar a usted se sirva rendir los informes solicitados dentro del proceso de la referencia, en los términos y condiciones señalados en la providencia respectiva.

La información solicitada deberá ser remitida a esta Corporación dentro del término indicado, so pena de las consecuencias legales dispuestas en la ley.

Agradezco se sirva dar pronta respuesta a la presente solicitud.`
  return crearDocumento(datos)
}

export function generarOficioComisionNotificar(datos: DatosOficio): Document {
  datos.cuerpo = `De manera atenta me permito comisionar a su Despacho para que, en los términos señalados en la ley, proceda a realizar la notificación personal de la providencia dictada dentro del proceso de la referencia a la parte demandante/demandada, según corresponda.

Para tal efecto, se adjunta copia de la providencia y los formularios necesarios para la diligencia de notificación.

Una vez surtida la notificación, sírvase remitir el expediente a esta Corporación con las constancias respectivas.`
  return crearDocumento(datos)
}

export async function bufferFromDocument(doc: Document): Promise<Buffer> {
  return await Packer.toBuffer(doc)
}
