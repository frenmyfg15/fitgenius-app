import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Linking, Platform } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Shield, FileText, Mail, ExternalLink } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabKey = "terminos" | "privacidad";

const APP_NAME = "FitGenius";
const RESPONSABLE = "Frenmy Manuel García Flete";
const CONTACTO_EMAIL = "soporte@fitgenius.app";
const JURISDICCION = "España";

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className={
        "rounded-2xl p-4 border " +
        (isDark ? "bg-[#0b1220] border-white/10" : "bg-white border-neutral-200") +
        " " +
        className
      }
      style={{
        shadowColor: "#0f172a",
        shadowOpacity: isDark ? 0.22 : 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      }}
    >
      {children}
    </View>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-row items-start gap-3">
      <View
        className={
          "h-10 w-10 rounded-xl items-center justify-center border " +
          (isDark ? "bg-white/5 border-white/10" : "bg-neutral-50 border-neutral-200")
        }
      >
        {icon}
      </View>

      <View className="flex-1">
        <Text className={(isDark ? "text-white" : "text-slate-900") + " text-[15px] font-semibold"}>
          {title}
        </Text>
        {!!subtitle && (
          <Text className={(isDark ? "text-[#94a3b8]" : "text-neutral-600") + " text-xs mt-1 leading-4"}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Text className={(isDark ? "text-[#cbd5e1]" : "text-neutral-700") + " text-[13px] leading-5 mt-3"}>
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-row gap-2 mt-2">
      <Text className={(isDark ? "text-[#cbd5e1]" : "text-neutral-700") + " text-[13px] leading-5"}>•</Text>
      <Text className={(isDark ? "text-[#cbd5e1]" : "text-neutral-700") + " flex-1 text-[13px] leading-5"}>
        {children}
      </Text>
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Pressable
      onPress={onPress}
      className={
        "mt-3 flex-row items-center justify-between rounded-xl px-3 py-3 border " +
        (isDark ? "bg-white/5 border-white/10" : "bg-neutral-50 border-neutral-200")
      }
      accessibilityRole="button"
    >
      <View className="flex-row items-center gap-2">
        <Mail size={16} color={isDark ? "#E2E8F0" : "#0F172A"} />
        <Text className={(isDark ? "text-white" : "text-slate-900") + " text-[13px] font-semibold"}>
          {label}
        </Text>
      </View>
      <ExternalLink size={16} color={isDark ? "#E2E8F0" : "#0F172A"} />
    </Pressable>
  );
}

function TabPill({
  active,
  onPress,
  icon,
  label,
  accessibilityLabel,
}: {
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  accessibilityLabel: string;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Pressable
      onPress={onPress}
      className={
        "flex-1 px-3 py-2.5 items-center rounded-2xl border " +
        (active
          ? isDark
            ? "bg-white/10 border-white/15"
            : "bg-neutral-100 border-neutral-200"
          : "bg-transparent border-transparent")
      }
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className={(isDark ? "text-white" : "text-slate-900") + " text-[13px] font-semibold"}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function LegalScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [tab, setTab] = useState<TabKey>("terminos");

  const updatedAt = useMemo(() => {
    return "28 de marzo de 2026";
  }, []);

  const mailto = () => {
    const subject = encodeURIComponent(`[${APP_NAME}] Consulta legal / privacidad`);
    const body = encodeURIComponent(
      `Hola,\n\nQuiero realizar una consulta relacionada con ${APP_NAME}.\n\nDetalles:\n- Dispositivo: ${Platform.OS}\n- Versión app: (indicar)\n\nGracias.`
    );
    Linking.openURL(`mailto:${CONTACTO_EMAIL}?subject=${subject}&body=${body}`);
  };

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      style={{ flex: 1 }}
      className={isDark ? "bg-[#050814]" : "bg-neutral-100"}
    >
      <View className={"flex-1 " + (isDark ? "bg-[#050814]" : "bg-neutral-100")}>
        <LinearGradient
          colors={
            isDark
              ? (["rgba(99,102,241,0.20)", "rgba(168,85,247,0.10)", "rgba(0,0,0,0)"] as any)
              : (["rgba(99,102,241,0.10)", "rgba(168,85,247,0.06)", "rgba(255,255,255,0)"] as any)
          }
          style={{ paddingTop: 18, paddingBottom: 12 }}
        >
          <View className="px-4">
            <Text className={(isDark ? "text-white" : "text-slate-900") + " text-2xl font-extrabold"}>
              Legal
            </Text>
            <Text className={(isDark ? "text-[#94a3b8]" : "text-neutral-600") + " text-[12px] mt-1 leading-4"}>
              Términos, condiciones y privacidad de {APP_NAME}.
            </Text>

            <View
              className={
                "mt-4 p-1 flex-row rounded-2xl border " +
                (isDark ? "border-white/10 bg-white/5" : "border-neutral-200 bg-white")
              }
            >
              <TabPill
                active={tab === "terminos"}
                onPress={() => setTab("terminos")}
                icon={<FileText size={16} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                label="Términos"
                accessibilityLabel="Ver Términos y Condiciones"
              />
              <TabPill
                active={tab === "privacidad"}
                onPress={() => setTab("privacidad")}
                icon={<Shield size={16} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                label="Privacidad"
                accessibilityLabel="Ver Política de Privacidad"
              />
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          {tab === "terminos" ? (
            <View style={{ gap: 12 }}>
              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Términos y Condiciones"
                  subtitle={`Condiciones de uso aplicables a ${APP_NAME}.`}
                />
                <Paragraph>
                  Al registrarte, acceder o utilizar {APP_NAME}, aceptas estos Términos y Condiciones. Si no estás de
                  acuerdo con ellos, no debes utilizar la App.
                </Paragraph>
                <Paragraph>
                  {APP_NAME} es una aplicación de fitness que permite generar rutinas personalizadas, registrar sesiones
                  y recibir recomendaciones automáticas, incluyendo funciones basadas en inteligencia artificial.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Text className={(isDark ? "text-white" : "text-slate-900") + " text-base font-extrabold"}>14+</Text>}
                  title="Edad mínima"
                  subtitle="Uso exclusivo para mayores de 14 años."
                />
                <Paragraph>
                  La App está dirigida únicamente a personas de 14 años o más. Si tienes menos de 14 años, no debes
                  crear una cuenta ni utilizar el servicio.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Cuenta de usuario"
                  subtitle="Registro obligatorio por email o Google."
                />
                <Bullet>Para utilizar la App es obligatorio crear una cuenta.</Bullet>
                <Bullet>Puedes registrarte mediante email y contraseña o usando tu cuenta de Google.</Bullet>
                <Bullet>Debes facilitar información veraz, actualizada y mantener seguras tus credenciales.</Bullet>
                <Bullet>Eres responsable de toda actividad realizada desde tu cuenta.</Bullet>
                <Bullet>Puedes eliminar tu cuenta desde el perfil en cualquier momento.</Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Salud y uso responsable"
                  subtitle="La App no sustituye asesoramiento profesional."
                />
                <Paragraph>
                  {APP_NAME} no es un servicio médico ni sustituye a un médico, fisioterapeuta, entrenador personal u
                  otro profesional cualificado.
                </Paragraph>
                <Bullet>
                  Las rutinas, sugerencias y respuestas del chat tienen carácter orientativo.
                </Bullet>
                <Bullet>
                  Eres responsable de tu estado físico, de cómo realizas los ejercicios y de adaptar la intensidad a tu
                  situación personal.
                </Bullet>
                <Bullet>
                  Antes de iniciar o modificar una rutina, especialmente si tienes limitaciones físicas o condiciones
                  médicas, deberías consultar con un profesional.
                </Bullet>
                <Bullet>
                  Debes detener la actividad si notas dolor, mareo, malestar o cualquier síntoma adverso.
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Text className={(isDark ? "text-white" : "text-slate-900") + " text-base font-extrabold"}>€</Text>}
                  title="Suscripciones y pagos"
                  subtitle="Planes mensuales o anuales gestionados con Stripe."
                />
                <Bullet>{APP_NAME} ofrece suscripciones de pago mensuales o anuales.</Bullet>
                <Bullet>Los pagos y la gestión técnica de la suscripción se realizan mediante Stripe.</Bullet>
                <Bullet>La suscripción puede renovarse automáticamente salvo cancelación previa.</Bullet>
                <Bullet>Puedes cancelar desde tu perfil en cualquier momento.</Bullet>
                <Bullet>Si cancelas, mantendrás el acceso hasta el final del periodo ya pagado.</Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Reembolsos y desistimiento"
                  subtitle="Contenido digital con acceso inmediato."
                />
                <Paragraph>
                  Con carácter general, no se realizan reembolsos por las suscripciones contratadas.
                </Paragraph>
                <Paragraph>
                  Al activar la suscripción y empezar a utilizar el servicio, aceptas expresamente el acceso inmediato
                  al contenido digital y la pérdida del derecho de desistimiento en la medida permitida por la ley.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Uso permitido"
                  subtitle="Uso personal, legal y no comercial."
                />
                <Bullet>La App solo puede utilizarse para fines personales y lícitos.</Bullet>
                <Bullet>No puedes copiar, modificar, distribuir o explotar la App sin autorización.</Bullet>
                <Bullet>No puedes intentar acceder a sistemas o datos no autorizados.</Bullet>
                <Bullet>No puedes realizar ingeniería inversa, suplantaciones o actividades fraudulentas.</Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Contenido introducido por el usuario"
                  subtitle="Rutinas personalizadas, nombres y notas."
                />
                <Paragraph>
                  Puedes crear rutinas personalizadas con las herramientas de la App, asignarles nombre y añadir notas.
                  Eres responsable del contenido que introduzcas y de que no infrinja derechos de terceros ni la
                  normativa aplicable.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Funciones de inteligencia artificial"
                  subtitle="Generación de rutinas y respuestas a dudas."
                />
                <Paragraph>
                  La App utiliza inteligencia artificial para generar rutinas y responder preguntas concretas dentro del
                  chat interno.
                </Paragraph>
                <Bullet>
                  Las respuestas son automatizadas y pueden contener errores o no ajustarse totalmente a tu situación.
                </Bullet>
                <Bullet>
                  El chat tiene carácter temporal y no está pensado como historial persistente dentro de la App.
                </Bullet>
                <Bullet>
                  Las respuestas deben entenderse como orientación general y no como asesoramiento profesional.
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Propiedad intelectual"
                  subtitle="Diseño, marca, textos, código y contenido."
                />
                <Paragraph>
                  La App, su diseño, estructura, textos, funcionalidades, logotipos, software y demás elementos propios
                  están protegidos por derechos de propiedad intelectual. No se concede ninguna licencia de uso más allá
                  de la necesaria para utilizar el servicio conforme a estos términos.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Disponibilidad y limitación de responsabilidad"
                  subtitle="Uso bajo tu propio riesgo."
                />
                <Bullet>
                  No se garantiza que la App esté siempre disponible, libre de errores o sin interrupciones.
                </Bullet>
                <Bullet>
                  En la medida permitida por la ley, el Responsable no será responsable de lesiones, daños, pérdidas o
                  perjuicios derivados del uso de la App, de las rutinas sugeridas o de la imposibilidad de usar el
                  servicio.
                </Bullet>
                <Bullet>
                  Nada de lo anterior limita los derechos irrenunciables que correspondan a los consumidores conforme a
                  la legislación aplicable.
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Mail size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Contacto"
                  subtitle="Consultas sobre el servicio o estos términos."
                />
                <Paragraph>Puedes contactar con el responsable del servicio en:</Paragraph>
                <LinkRow label={CONTACTO_EMAIL} onPress={mailto} />
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Legislación aplicable"
                  subtitle={`${JURISDICCION} · Servicio dirigido a usuarios en España.`}
                />
                <Paragraph>
                  Estos términos se rigen por la legislación española. En caso de conflicto, serán competentes los
                  juzgados y tribunales que correspondan conforme a la normativa de consumidores y usuarios aplicable.
                </Paragraph>
              </Card>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Política de Privacidad"
                  subtitle={`Cómo tratamos tus datos en ${APP_NAME}.`}
                />
                <Paragraph>
                  Esta política explica qué datos recopilamos, para qué los usamos, con qué base legal los tratamos y
                  qué derechos tienes como usuario.
                </Paragraph>
                <Paragraph>
                  Responsable del tratamiento: {RESPONSABLE} · Contacto: {CONTACTO_EMAIL}.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Text className={(isDark ? "text-white" : "text-slate-900") + " text-base font-extrabold"}>14+</Text>}
                  title="Edad mínima"
                  subtitle="Servicio reservado a usuarios de 14 años o más."
                />
                <Paragraph>
                  {APP_NAME} no está dirigida a menores de 14 años. Si no tienes esa edad, no debes utilizar la App ni
                  facilitarnos datos personales.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Datos que recopilamos"
                  subtitle="Cuenta, perfil, entrenamiento y suscripción."
                />
                <Bullet>Datos de cuenta: email, contraseña o datos básicos de acceso con Google.</Bullet>
                <Bullet>Datos de perfil: edad, sexo, altura, peso y objetivo físico.</Bullet>
                <Bullet>Preferencias: lugar de entrenamiento, como casa o gimnasio.</Bullet>
                <Bullet>Datos de entrenamiento: rutinas creadas, sesiones guardadas, nombres y notas.</Bullet>
                <Bullet>
                  Limitaciones físicas: si decides indicarlas, pueden considerarse datos relativos a la salud.
                </Bullet>
                <Bullet>Datos de suscripción: plan, estado, renovaciones, cancelaciones y referencias técnicas de pago.</Bullet>
                <Bullet>Datos técnicos mínimos para seguridad, diagnóstico de errores y estabilidad del servicio.</Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Finalidades del tratamiento"
                  subtitle="Para prestar y mejorar el servicio."
                />
                <Bullet>Crear y gestionar tu cuenta.</Bullet>
                <Bullet>Autenticar el acceso mediante email/contraseña o Google.</Bullet>
                <Bullet>Generar rutinas personalizadas según tu perfil y preferencias.</Bullet>
                <Bullet>Guardar sesiones e historial para seguimiento de tu progreso.</Bullet>
                <Bullet>Permitirte crear rutinas personalizadas, nombres y notas.</Bullet>
                <Bullet>Responder preguntas concretas mediante el chat interno con IA.</Bullet>
                <Bullet>Gestionar suscripciones, renovaciones, cancelaciones y acceso premium.</Bullet>
                <Bullet>Detectar errores, mantener la seguridad y mejorar el rendimiento de la App.</Bullet>
                <Bullet>Cumplir obligaciones legales que resulten aplicables.</Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Base legal"
                  subtitle="RGPD y normativa española."
                />
                <Bullet>
                  Ejecución del contrato: para crear tu cuenta, prestarte el servicio, generar rutinas, guardar
                  sesiones y gestionar tu suscripción.
                </Bullet>
                <Bullet>
                  Interés legítimo: para seguridad, prevención del fraude, monitorización técnica y mejora del servicio.
                </Bullet>
                <Bullet>
                  Cumplimiento de obligaciones legales: cuando sea necesario por razones fiscales, administrativas o de
                  seguridad.
                </Bullet>
                <Bullet>
                  Consentimiento explícito: para los datos que puedan considerarse relativos a la salud, cuando decidas
                  introducirlos en la App.
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Datos relativos a la salud"
                  subtitle="Tratamiento limitado a personalización."
                />
                <Paragraph>
                  Algunas limitaciones físicas u otra información que introduzcas para adaptar entrenamientos pueden
                  considerarse datos relativos a la salud.
                </Paragraph>
                <Paragraph>
                  Estos datos se usan únicamente para personalizar rutinas, sugerencias y recomendaciones dentro de la
                  App. Te recomendamos no introducir información médica innecesaria en campos libres o notas.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Proveedores y terceros"
                  subtitle="Infraestructura, pagos, IA y monitorización."
                />
                <Bullet>Railway: infraestructura y alojamiento técnico del servicio.</Bullet>
                <Bullet>Stripe: pagos y gestión de suscripciones.</Bullet>
                <Bullet>OpenAI: funciones de inteligencia artificial para rutinas y chat interno.</Bullet>
                <Bullet>Sentry: monitorización de errores y estabilidad técnica.</Bullet>
                <Bullet>Google: autenticación si decides iniciar sesión con Google.</Bullet>
                <Paragraph>
                  No vendemos tus datos personales ni los cedemos a terceros con fines comerciales.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="IA y chat interno"
                  subtitle="Consultas temporales y respuestas automáticas."
                />
                <Paragraph>
                  {APP_NAME} utiliza IA para generar rutinas y responder preguntas concretas, como dudas sobre cómo
                  realizar un ejercicio.
                </Paragraph>
                <Bullet>El chat interno es temporal y no se guarda como historial persistente dentro de la App.</Bullet>
                <Bullet>
                  El contenido enviado puede ser procesado técnicamente por el proveedor de IA para generar la respuesta.
                </Bullet>
                <Bullet>
                  Evita introducir datos innecesariamente sensibles o excesivos en tus consultas.
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Emails del servicio"
                  subtitle="Solo comunicaciones necesarias."
                />
                <Bullet>Podemos enviarte códigos de verificación para confirmar tu email.</Bullet>
                <Bullet>Podemos enviarte mensajes para recuperación de contraseña.</Bullet>
                <Bullet>No usamos tu email para marketing según la configuración actual del servicio.</Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Conservación y eliminación"
                  subtitle="Control total desde tu perfil."
                />
                <Paragraph>
                  Conservamos tus datos mientras tu cuenta permanezca activa y mientras sean necesarios para prestarte
                  el servicio.
                </Paragraph>
                <Bullet>Puedes eliminar tu cuenta desde el perfil de la App.</Bullet>
                <Bullet>La eliminación es permanente e irreversible.</Bullet>
                <Bullet>
                  Tras eliminar la cuenta, se borran los datos asociados, salvo aquellos que deban conservarse
                  temporalmente por obligación legal o necesidad técnica justificada.
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Tus derechos"
                  subtitle="Acceso, rectificación, supresión y más."
                />
                <Bullet>Acceder a tus datos personales.</Bullet>
                <Bullet>Rectificar datos inexactos o incompletos.</Bullet>
                <Bullet>Solicitar la supresión de tus datos cuando proceda.</Bullet>
                <Bullet>Oponerte al tratamiento o solicitar su limitación en ciertos supuestos.</Bullet>
                <Bullet>Solicitar la portabilidad de tus datos cuando resulte aplicable.</Bullet>
                <Bullet>Retirar el consentimiento cuando el tratamiento se base en él.</Bullet>
                <Paragraph>
                  Para ejercer tus derechos, escríbenos a {CONTACTO_EMAIL}. También puedes presentar una reclamación
                  ante la Agencia Española de Protección de Datos.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Mail size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Contacto"
                  subtitle="Privacidad y protección de datos."
                />
                <LinkRow label={CONTACTO_EMAIL} onPress={mailto} />
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Cambios en esta política"
                  subtitle="Actualizaciones legales o funcionales."
                />
                <Paragraph>
                  Podemos actualizar esta Política de Privacidad para reflejar cambios legales, técnicos o funcionales
                  del servicio. Cuando el cambio sea relevante, lo comunicaremos dentro de la App o por otros medios
                  adecuados.
                </Paragraph>
              </Card>
            </View>
          )}

          <View className="mt-6 pb-2">
            <View
              className={
                "rounded-2xl px-4 py-3 border " +
                (isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200")
              }
            >
              <Text className={(isDark ? "text-[#94a3b8]" : "text-neutral-600") + " text-[11px] leading-4"}>
                {APP_NAME} · {JURISDICCION}
              </Text>
              <Text className={(isDark ? "text-white" : "text-slate-900") + " text-[12px] font-semibold mt-1"}>
                Actualizado: {updatedAt}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}