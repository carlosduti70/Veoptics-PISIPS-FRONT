export interface ExamenOptometricoRequest {
    fecha: string;
    // Ojo Derecho (OD)
    esferaOd: string;
    cilindroOd: string;
    ejeOd: string;
    adicionOd: string;
    agudezaVisualLejosOd: string;
    agudezaVisualCercaOd: string;
    dnpOd: string;
    alturaOd: string;
    // Ojo Izquierdo (OI)
    esferaOi: string;
    cilindroOi: string;
    ejeOi: string;
    adicionOi: string;
    agudezaVisualLejosOi: string;
    agudezaVisualCercaOi: string;
    dnpOi: string;
    alturaOi: string;
    // Campos de Evaluación Diagnóstica
    diagnostico: string;
    visionCercana: string;
    visionLejana: string;
    percepcionColores: string;
    coloresVisibles: string;
    // Relaciones (Foreign Keys)
    idPaciente: number;
    idOptometrista: number;
}

export interface ExamenOptometricoResponse extends ExamenOptometricoRequest {
    idExamen: number;
}
