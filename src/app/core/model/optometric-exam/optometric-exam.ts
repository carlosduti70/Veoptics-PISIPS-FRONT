export interface OptometricExam {
    fecha: Date | null; // Cambiado a Date para el p-calendar, luego se formatea
    esfera_od: string;
    cilindro_od: string;
    eje_od: string;
    esfera_oi: string;
    cilindro_oi: string;
    eje_oi: string;
    adicion_od: string;
    adicion_oi: string;
    agudeza_visual_cerca_oi: string;
    agudeza_visual_lejos_oi: string;
    agudeza_visual_lejos_od: string;
    agudeza_visual_cerca_od: string;
    altura_oi: string;
    altura_od: string;
}
