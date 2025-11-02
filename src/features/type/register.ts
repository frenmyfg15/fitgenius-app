export type Nombre = string;
export type Apellido = string;
export type Correo = string;
export type Contrasena = string;
export type Objetivo = 'PERDIDA_GRASA' | 'GANANCIA_MUSCULAR' | 'TONIFICAR_FORMA' | 'MATENER_FORMA' | '';
export type Sexo = 'MASCULINO' | 'FEMENINO' | '';
export type Enfoque = 'ESPALDA' | 'HOMBROS' | 'PECHOS' | 'BRAZOS' | 'ABS' | 'GLUTEOS' | 'PIERNAS' | 'COMPLETO' | '';
export type Nivel = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO' | '';
export type Actividad = 'SEDENTARIO' | 'LIGERAMENTE_ACTIVO' | 'MODERADAMENTE_ACTIVO' | 'MUY_ACTIVO' | '';
export type Lugar = 'GIMNASIO' | 'CASA' | '';
export type Equipamiento =
   'BANCO'
  | 'NINGUNO'
  | 'BODY_WEIGHT'
  | 'CUERDA'
  | 'BARRAS_PARALELAS'
  | 'PESO_CORPORAL'
  | 'BARRA_DOMINADAS'
  | 'BALON_ESTABILIDAD'
  | 'MANCUERNAS'
  | 'KETTLEBELL'
  | 'BALON_BOSU'
  | 'BALON_MEDICINAL'
  | 'CON_PESO'
  | 'RUEDA_ABDOMINAL';
export type Altura = number;
export type MedidaAltura = 'CM' | 'FT' | '';
export type Peso = number;
export type MedidaPeso = 'KG' | 'LB' | '';
export type PesoObjetivo = number;
export type Edad = number | undefined;
export type Dias = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO' | '';
export type Duracion = 'TREINTA_MINUTOS' | 'CUARENTA_Y_CINCO_MINUTOS' | 'SESENTA_MINUTOS' | 'NOVENTA_MINUTOS' | 'CIENTO_VEINTE_MINUTOS' | 'CIENTO_CINCUENTA_MINUTOS' | 'CIENTO_OCHENTA_MINUTOS' | '';
export type Limitaciones = 'RODILLA' | 'MUNECA' | 'HOMBRO' | 'ESPALDA' | 'TOBILLO' | 'CUELLO' | 'EMBARAZO' | 'OTRA' | '';
export type Step = 'objetivo' | 'enfoque' | 'sexo' | 'nivel' | 'actividad' | 'lugar' | 'lugar' | 'equipamiento' | 'altura' | 'peso' | 'pesoObjetivo' | 'edad' | 'dias' | 'duracion' | 'limitaciones' | 'registrar';

export type Usuario = {
    nombre: Nombre
    apellido: Apellido
    correo: Correo
    contrasena: Contrasena
    objetivo: Objetivo
    sexo: Sexo
    enfoque: Enfoque[] | []
    nivel: Nivel
    actividad: Actividad
    lugar: Lugar
    equipamiento: Equipamiento[] | []
    altura: Altura
    medidaAltura: MedidaAltura
    peso: Peso
    medidaPeso: MedidaPeso
    pesoObjetivo: PesoObjetivo
    edad: Edad
    dias: Dias[] | []
    duracion: Duracion
    limitaciones: Limitaciones[] | []
}

export type DatosActualizables = Pick<
  Usuario,
  | 'pesoObjetivo'
  | 'sexo'
  | 'nivel'
  | 'actividad'
  | 'objetivo'
  | 'duracion'
  | 'lugar'
  | 'enfoque'
  | 'limitaciones'
  | 'dias'
  | 'equipamiento'
>;

export type DatosConGoogle = Omit<Usuario,'nombre' | 'apellido' | 'correo' | 'contrasena'>
