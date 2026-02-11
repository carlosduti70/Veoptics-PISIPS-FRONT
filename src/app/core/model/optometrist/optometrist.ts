export interface Optometrist {
    idOptometrista?: number;
    estado: string;
    registroProfesional: string;
    telefono: string;
    idUsuario: number;
}

export interface OptometristUpdate {
    idOptometrista: number;
    estado: string;
    registroProfesional: string;
    telefono: string;
}
