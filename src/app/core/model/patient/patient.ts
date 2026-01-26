export interface Patient {
    idPaciente?: number; // Opcional si es auto-generado
    nombre: string;
    apellido: string;
    ci: string;
    fecNacimiento: Date | string;
    direccion: string;
    telefono: string;
    correo: string;
    motivoConsulta: string;
    fecRegistro: Date | string;
    fecPrimero: Date | string;
    estado: string;
}
