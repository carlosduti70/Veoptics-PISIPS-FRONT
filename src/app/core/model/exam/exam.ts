export interface ExamenOptometricoRequest {
    fecha: string;
    esferaOd: string;
    cilindroOd: string;
    ejeOd: string;
    esferaOi: string;
    cilindroOi: string;
    ejeOi: string;
    adicionOd: string;
    adicionOi: string;
    agudezaVisualCercaOi: string;
    agudezaVisualLejosOi: string;
    agudezaVisualLejosOd: string;
    agudezaVisualCercaOd: string;
    alturaOi: string;
    alturaOd: string;
    idPaciente: number;
    idOptometrista: number;
}

export interface ExamenOptometricoResponse extends ExamenOptometricoRequest {
    idexamen: number;
}
