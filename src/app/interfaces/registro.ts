export interface Registro {
  idRegistro: number;
  fechaCarga: string;
  
  // Datos Planos (Coinciden con RegistroDTO.java)
  tipoOperacion: string;
  
  nombreUsuarioResponsable: string;
  legajoUsuarioResponsable: string;
  
  numDocumentoAfectado: string;
  tituloDocumentoAfectado: string;
  
  nombreUsuarioAfectado: string;
  legajoUsuarioAfectado: string;
}