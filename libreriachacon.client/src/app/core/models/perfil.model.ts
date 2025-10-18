export interface Perfil {
  id: string; 
  nombreCompleto: string | null;
  email: string;
  urlAvatar: string | null;
  rol: string;
  fechaCreacion: Date;
  passwordHash: string;
}
