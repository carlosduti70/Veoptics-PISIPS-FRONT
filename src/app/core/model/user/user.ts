export interface UserRequest {
    idUser?: string;
    nombre: string;
    apellido: string;
    cedula: string;
    correo: string;
    clave: string;
    estado: boolean;
    idRol: number;
}

export interface UserResponse {
    idUser?: string;
    nombre: string;
    apellido: string;
    cedula: string;
    correo: string;
    indicador: string;
    estado: boolean;
    nombreRol: string;
}

export interface UserUpdate {
    idUsuario?: string;
    nombre: string;
    apellido: string;
    cedula: string;
    correo: string;
    estado: boolean;
    idRol: string;
}
