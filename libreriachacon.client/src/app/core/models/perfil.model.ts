// En src/app/models/perfil.model.ts
export interface Perfil {
  id: string; // En TypeScript, el Guid se maneja como un string
  nombreCompleto: string | null;
  email: string;
  urlAvatar: string | null;
  rol: string;
  fechaCreacion: Date;
  passwordHash: string;
}
