import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // 1. Importar HttpClient
import { firstValueFrom } from 'rxjs';

// Quita el "* as" para que funcione la asignación de vfs
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ExamenOptometricoResponse } from '../../../model/exam/exam';

// Asignación de fuentes segura
(pdfMake as any).vfs = (pdfFonts as any)['pdfMake'] ? (pdfFonts as any)['pdfMake'].vfs : (pdfFonts as any)['vfs'];

export interface CertificateData {
    examen: ExamenOptometricoResponse;
    nombrePaciente: string;
    // logoBase64?: string; // Ya no es necesario pedirlo aquí, lo cargamos interno
}

@Injectable({
    providedIn: 'root'
})
export class CertificateService {

    // Ruta al logo en tus assets (ajustada para que Angular la encuentre al ejecutarse)
    private readonly LOGO_URL = 'assets/image/logoestesi-02.svg';

    constructor(private http: HttpClient) { } // 2. Inyectar HttpClient

    // Función Helper para evitar que 'null' rompa el PDF
    private txt(value: any): string {
        return (value === null || value === undefined) ? '' : String(value);
    }

    // 3. Método para cargar el SVG como texto plano
    private async loadLogo(): Promise<string> {
        try {
            return await firstValueFrom(this.http.get(this.LOGO_URL, { responseType: 'text' }));
        } catch (error) {
            console.warn('No se pudo cargar el logo desde assets:', error);
            return ''; // Retorna vacío si falla para no romper el PDF
        }
    }

    // 4. Ahora el método es ASYNC para esperar la carga del logo
    async generateCertificate(data: CertificateData) {
        try {
            const { examen, nombrePaciente } = data;
            const fechaEmision = new Date().toLocaleDateString('es-ES');

            // Cargamos el logo antes de armar el documento
            const logoSvg = await this.loadLogo();

            const documentDefinition: any = {
                pageSize: 'A4',
                pageMargins: [40, 40, 40, 60],
                content: [
                    this.createHeader(logoSvg), // Pasamos el string del SVG
                    this.createPatientInfo(nombrePaciente, fechaEmision),

                    { text: 'RX FINAL', style: 'sectionHeader', margin: [0, 20, 0, 5] },
                    this.createRxTable(examen),

                    { text: 'DIAGNÓSTICO PROFESIONAL', style: 'sectionHeader', margin: [0, 20, 0, 5] },
                    this.createDiagnosisBox(examen.diagnostico),

                    { text: 'PRUEBAS DE CAPACIDAD VISUAL', style: 'sectionHeader', margin: [0, 20, 0, 10] },
                    this.createVisualTestsSection(examen),

                    this.createSignatureSection()
                ],
                styles: this.getStyles(),
                defaultStyle: { fontSize: 10, color: '#333' }
            };

            // Crear y abrir el PDF
            pdfMake.createPdf(documentDefinition).download(nombrePaciente.replace(/\s+/g, '_') + '_Certificado.pdf');

        } catch (error) {
            console.error("Error INTERNO generando el PDF:", error);
            throw error;
        }
    }

    // --- SECCIONES MODIFICADAS ---

    private createHeader(logoSvg: string): any {
        // Lógica: Si hay SVG, mostramos la imagen vectorial. Si falla, mostramos texto.
        const logoColumn = logoSvg ?
            {
                svg: logoSvg, // <--- Propiedad 'svg' para vectores
                width: 100,   // Ajusta el tamaño según necesites
                alignment: 'left'
            } :
            {
                text: 'VEOPTICS',
                style: 'brandTitle',
                width: 100,
                alignment: 'left'
            };

        return {
            columns: [
                logoColumn,
                {
                    stack: [
                        { text: 'VEOPTICS', style: 'brandTitle', alignment: 'right' },
                        { text: 'Pío Bravo y Manuel Vega', style: 'brandSub', alignment: 'right' },
                        { text: 'Cel: 0985574955', style: 'brandSub', alignment: 'right' },
                        { text: 'Email: veoptics.cuenca@gmail.com', style: 'brandSub', alignment: 'right' }
                    ],
                    width: '*'
                }
            ],
            margin: [0, 0, 0, 20]
        };
    }

    // ... EL RESTO DE MÉTODOS (createPatientInfo, createRxTable, createVisualTestsSection, etc.)
    // SE QUEDAN EXACTAMENTE IGUAL QUE EN LA VERSIÓN ANTERIOR ...
    // Solo cópialos aquí abajo.

    private createPatientInfo(paciente: string, fecha: string): any {
        return {
            stack: [
                { text: 'CERTIFICADO DE AGUDEZA VISUAL', style: 'docTitle', alignment: 'center', margin: [0, 10, 0, 20] },
                {
                    columns: [
                        {
                            text: [
                                { text: 'PACIENTE: ', bold: true },
                                { text: this.txt(paciente).toUpperCase(), fontSize: 12 }
                            ]
                        },
                        {
                            text: [
                                { text: 'FECHA DE EMISIÓN: ', bold: true },
                                { text: this.txt(fecha) }
                            ],
                            alignment: 'right'
                        }
                    ]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#10265C' }] }
            ]
        };
    }

    private createRxTable(ex: ExamenOptometricoResponse): any {
        return {
            table: {
                headerRows: 1,
                widths: ['auto', '*', '*', '*', '*', '*', '*', '*', '*'],
                body: [
                    [
                        { text: 'OJO', style: 'tableHeader' },
                        { text: 'ESFERA', style: 'tableHeader' },
                        { text: 'CILINDRO', style: 'tableHeader' },
                        { text: 'EJE', style: 'tableHeader' },
                        { text: 'ADD', style: 'tableHeader' },
                        { text: 'AV VL', style: 'tableHeader' },
                        { text: 'AV VP', style: 'tableHeader' },
                        { text: 'DNP', style: 'tableHeader' },
                        { text: 'ALT', style: 'tableHeader' }
                    ],
                    [
                        { text: 'OD', style: 'eyeLabelOD' },
                        { text: this.txt(ex.esferaOd), style: 'tableCell' },
                        { text: this.txt(ex.cilindroOd), style: 'tableCell' },
                        { text: this.txt(ex.ejeOd), style: 'tableCell' },
                        { text: this.txt(ex.adicionOd), style: 'tableCell' },
                        { text: this.txt(ex.agudezaVisualLejosOd), style: 'tableCell' },
                        { text: this.txt(ex.agudezaVisualCercaOd), style: 'tableCell' },
                        { text: this.txt(ex.dnpOd), style: 'tableCell' },
                        { text: this.txt(ex.alturaOd), style: 'tableCell' }
                    ],
                    [
                        { text: 'OI', style: 'eyeLabelOI' },
                        { text: this.txt(ex.esferaOi), style: 'tableCell' },
                        { text: this.txt(ex.cilindroOi), style: 'tableCell' },
                        { text: this.txt(ex.ejeOi), style: 'tableCell' },
                        { text: this.txt(ex.adicionOi), style: 'tableCell' },
                        { text: this.txt(ex.agudezaVisualLejosOi), style: 'tableCell' },
                        { text: this.txt(ex.agudezaVisualCercaOi), style: 'tableCell' },
                        { text: this.txt(ex.dnpOi), style: 'tableCell' },
                        { text: this.txt(ex.alturaOi), style: 'tableCell' }
                    ]
                ]
            },
            layout: {
                fillColor: (rowIndex: number) => (rowIndex === 0) ? '#10265C' : (rowIndex % 2 === 0) ? '#f3f4f6' : null,
                hLineColor: '#ccc',
                vLineColor: '#ccc'
            }
        };
    }

    private createDiagnosisBox(diagnosis: string): any {
        return {
            table: {
                widths: ['*'],
                body: [
                    [{ text: this.txt(diagnosis) || 'Sin diagnóstico registrado.', margin: [5, 10], fontSize: 11 }]
                ]
            },
            layout: 'lightHorizontalLines'
        };
    }

    private createVisualTestsSection(ex: ExamenOptometricoResponse): any {
        const drawCheck = (checked: boolean) => {
            if (checked) {
                return {
                    canvas: [
                        { type: 'rect', x: 0, y: 0, w: 12, h: 12, r: 2, lineWidth: 1, lineColor: '#10265C' },
                        { type: 'polyline', lineWidth: 2, closePath: false, points: [{ x: 3, y: 6 }, { x: 5, y: 9 }, { x: 9, y: 3 }], lineColor: '#10265C' }
                    ]
                };
            } else {
                return {
                    canvas: [
                        { type: 'rect', x: 0, y: 0, w: 12, h: 12, r: 2, lineWidth: 1, lineColor: '#aaaaaa' }
                    ]
                };
            }
        };

        const item = (checked: boolean, label: string) => {
            return {
                columns: [
                    { width: 20, stack: [drawCheck(checked)] },
                    { width: 'auto', text: label, margin: [0, 2, 0, 0], fontSize: 10 }
                ],
                margin: [0, 2]
            };
        };

        const vc = this.txt(ex.visionCercana).toLowerCase();
        const vl = this.txt(ex.visionLejana).toLowerCase();
        const pc = this.txt(ex.percepcionColores).toLowerCase();

        return {
            stack: [
                {
                    columns: [
                        {
                            stack: [
                                { text: 'VISIÓN CERCANA', style: 'subHeader' },
                                { text: 'Capacidad de leer la escala 1 de la carta Jaeger.', fontSize: 9, color: '#666', margin: [0, 0, 0, 8] },
                                item(vc.includes('aprobado') && !vc.includes('no aprobado'), 'Aprobado'),
                                item(vc.includes('no aprobado'), 'No Aprobado'),
                                item(vc.includes('lentes'), 'Precisa lentes')
                            ]
                        },
                        {
                            stack: [
                                { text: 'VISIÓN LEJANA', style: 'subHeader' },
                                { text: 'Agudeza visual según la escala SNELLEN.', fontSize: 9, color: '#666', margin: [0, 0, 0, 8] },
                                item(vl.includes('mayor') || vl.includes('20/20'), '20/20 o superior'),
                                item(vl.includes('menor'), 'Menor a 20/20'),
                                item(vl.includes('lentes'), 'Precisa lentes')
                            ]
                        }
                    ]
                },
                {
                    margin: [0, 20, 0, 0],
                    stack: [
                        { text: 'PERCEPCIÓN COLORES', style: 'subHeader' },
                        { text: 'Test de Ishihara / Otros.', fontSize: 9, color: '#666', margin: [0, 0, 0, 8] },
                        {
                            columns: [
                                { width: 'auto', stack: [item(pc.includes('normal') || pc.includes('capacidad'), 'Normal')] },
                                { width: 40, text: '' },
                                { width: 'auto', stack: [item(!pc.includes('normal') && !pc.includes('capacidad') && pc.length > 0, 'Anomalía')] }
                            ]
                        },
                        { text: this.txt(ex.coloresVisibles), fontSize: 9, italics: true, color: '#444', margin: [0, 5, 0, 0] }
                    ]
                }
            ]
        };
    }

    private createSignatureSection(): any {
        return {
            stack: [
                { text: '____________________________________', alignment: 'center', margin: [0, 60, 0, 5] },
                { text: 'Firma', alignment: 'center', bold: true }
            ],
            unbreakable: true
        };
    }

    private getStyles(): any {
        return {
            brandTitle: { fontSize: 18, bold: true, color: '#10265C' },
            brandSub: { fontSize: 9, color: '#555' },
            docTitle: { fontSize: 16, bold: true, color: '#10265C', decoration: 'underline' },
            sectionHeader: { fontSize: 12, bold: true, color: '#10265C', background: '#eef2f5', padding: 5 },
            subHeader: { fontSize: 10, bold: true, color: '#10265C', margin: [0, 5] },
            tableHeader: { bold: true, fontSize: 9, color: 'white', alignment: 'center', margin: [0, 4] },
            tableCell: { fontSize: 9, alignment: 'center', margin: [0, 4] },
            eyeLabelOD: { fontSize: 10, bold: true, color: '#1D4ED8', alignment: 'center' },
            eyeLabelOI: { fontSize: 10, bold: true, color: '#15803D', alignment: 'center' },
            iconCheck: { fontSize: 12, color: '#10265C' },
            iconUncheck: { fontSize: 12, color: '#ccc' }
        };
    }
}
