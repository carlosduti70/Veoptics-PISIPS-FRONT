export interface Patient {

    idPaciente?: number; // Opcional si es auto-generado
    nombre: string;
    apellido: string;
    ci: string;
    fecNacimiento: Date | string;
    direccion: string;
    telefono: string;
    correo: string;
    fecRegistro: Date | string;
    estado: string;
}

export interface PatientUpdate {

    idPaciente: number; // Opcional si es auto-generado
    nombre: string;
    apellido: string;
    ci: string;
    fecNacimiento: Date | string;
    direccion: string;
    telefono: string;
    correo: string;
    estado: string;
}
