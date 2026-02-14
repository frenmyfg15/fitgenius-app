import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Linking, Platform } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Shield, FileText, Mail, ExternalLink } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabKey = "terminos" | "privacidad";

const APP_NAME = "fitgenius";
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
        shadowOpacity: isDark ? 0.22 : 0.10,
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
          : isDark
          ? "bg-transparent border-transparent"
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
    // Puedes actualizar manualmente esta fecha cuando publiques cambios
    return "15 de diciembre de 2025";
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
        {/* Header (sin "Actualizado") */}
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

            {/* Tabs */}
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
                  subtitle={`Aplicables a ${APP_NAME}. Al usar la app aceptas estos términos.`}
                />
                <Paragraph>
                  Estos Términos y Condiciones regulan el acceso y uso de la aplicación móvil {APP_NAME} (en adelante, la
                  “App”), ofrecida por {RESPONSABLE} (en adelante, el “Responsable”).
                </Paragraph>
                <Paragraph>
                  Si no estás de acuerdo con estos términos, por favor no uses la App. Algunos apartados pueden referirse a
                  funciones que aún estén en desarrollo; en ese caso, se aplicarán cuando estén disponibles.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Text className={(isDark ? "text-white" : "text-slate-900") + " text-base font-extrabold"}>14+</Text>}
                  title="Edad mínima"
                  subtitle="Uso permitido solo para mayores de 14 años."
                />
                <Paragraph>
                  La App está dirigida a usuarios de 14 años o más. Si tienes menos de 14 años, no debes usar la App ni
                  proporcionar datos personales.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Uso responsable y salud"
                  subtitle="La App no sustituye a profesionales."
                />
                <Paragraph>
                  {APP_NAME} ofrece rutinas y sugerencias de entrenamiento generadas de forma automática (incluyendo
                  recomendaciones basadas en sesiones previas). Estas sugerencias son orientativas.
                </Paragraph>
                <Bullet>
                  La App <Text className="font-semibold">no</Text> presta servicios médicos, no realiza diagnósticos y no
                  sustituye a un entrenador personal, fisioterapeuta o profesional sanitario.
                </Bullet>
                <Bullet>
                  Antes de iniciar o modificar tu actividad física, especialmente si tienes limitaciones, lesiones o
                  condiciones médicas, consulta con un profesional.
                </Bullet>
                <Bullet>
                  Eres responsable de evaluar tu estado físico, ejecutar los ejercicios con técnica adecuada y detenerte si
                  sientes dolor, mareo o cualquier síntoma adverso.
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Cuenta y seguridad"
                  subtitle="Registro por email/contraseña o Google."
                />
                <Bullet>Para usar ciertas funciones debes crear una cuenta.</Bullet>
                <Bullet>Debes proporcionar información veraz y mantener la confidencialidad de tus credenciales.</Bullet>
                <Bullet>
                  Puedes eliminar tu cuenta desde el perfil. La eliminación es definitiva e irreversible, incluyendo tus
                  datos asociados (salvo obligaciones legales aplicables).
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Text className={(isDark ? "text-white" : "text-slate-900") + " text-base font-extrabold"}>€</Text>}
                  title="Versiones y pagos"
                  subtitle="Gratis con anuncios y versión de pago."
                />
                <Bullet>
                  La App puede ofrecer una versión gratuita que muestra anuncios y una versión de pago (sin anuncios u otras
                  ventajas).
                </Bullet>
                <Bullet>
                  Los precios, características y disponibilidad pueden cambiar. Cualquier cambio relevante se comunicará
                  dentro de la App o por los canales disponibles.
                </Bullet>
                <Bullet>
                  La compra de la versión de pago se gestiona mediante la tienda correspondiente (Google Play / App Store) y
                  está sujeta a sus políticas de facturación y reembolsos.
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Propiedad intelectual"
                  subtitle="Contenido y marca."
                />
                <Paragraph>
                  La App, su interfaz, diseño, textos, logotipos, y contenido propio están protegidos por derechos de
                  propiedad intelectual. No se permite copiar, modificar, distribuir o explotar la App sin autorización.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Limitación de responsabilidad"
                  subtitle="Uso bajo tu propio riesgo."
                />
                <Bullet>
                  El Responsable no garantiza que la App esté libre de errores o interrupciones, aunque se aplican medidas
                  razonables para su correcto funcionamiento.
                </Bullet>
                <Bullet>
                  En la medida permitida por la ley, el Responsable no será responsable por lesiones, daños o pérdidas
                  derivadas del uso de rutinas, sugerencias o información mostrada en la App.
                </Bullet>
                <Bullet>
                  Nada en estos términos limita derechos irrenunciables del consumidor conforme a la normativa aplicable.
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Mail size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Contacto"
                  subtitle="Soporte y consultas legales."
                />
                <Paragraph>Para consultas relacionadas con estos términos o con el uso de la App, puedes contactarnos en:</Paragraph>
                <LinkRow label={CONTACTO_EMAIL} onPress={mailto} />
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Ley aplicable y jurisdicción"
                  subtitle={`${JURISDICCION} · Uso internacional.`}
                />
                <Paragraph>
                  Estos términos se rigen por la legislación de {JURISDICCION}. Si eres consumidor, podrán aplicarse
                  disposiciones obligatorias del país donde residas. En caso de disputa, las partes se someterán a los
                  tribunales que correspondan conforme a la normativa aplicable.
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
                  Esta Política describe qué datos recopilamos, para qué los usamos y los derechos que tienes. {APP_NAME} se
                  diseña para ser transparente y respetar tu privacidad.
                </Paragraph>
                <Paragraph>
                  Responsable del tratamiento: {RESPONSABLE} · Contacto: {CONTACTO_EMAIL}.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Datos que recopilamos"
                  subtitle="Datos de cuenta y entrenamiento."
                />
                <Bullet>Identificación y cuenta: nombre, email.</Bullet>
                <Bullet>Perfil: edad, altura, peso actual y peso objetivo.</Bullet>
                <Bullet>Preferencias: objetivos fitness y nivel de experiencia.</Bullet>
                <Bullet>
                  Limitaciones físicas: si decides proporcionarlas, pueden considerarse datos relacionados con la salud.
                  Solo se usan para adaptar rutinas y recomendaciones.
                </Bullet>
                <Bullet>Historial: sesiones, rutinas creadas o realizadas, ajustes y progreso.</Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Cómo usamos tus datos"
                  subtitle="Finalidades del tratamiento."
                />
                <Bullet>Crear y gestionar tu cuenta.</Bullet>
                <Bullet>Generar rutinas (IA o manual) basadas en tus datos y ejercicios disponibles.</Bullet>
                <Bullet>Ofrecer un “coach” algorítmico con sugerencias basadas en sesiones previas.</Bullet>
                <Bullet>Responder dudas sobre ejercicios o rutinas dentro de la App.</Bullet>
                <Bullet>Mejorar estabilidad y corregir errores (monitoreo de fallos).</Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Base legal"
                  subtitle="RGPD / normativa aplicable."
                />
                <Bullet>
                  Ejecución del contrato: para prestar el servicio que solicitas al usar la App (cuenta, rutinas, historial).
                </Bullet>
                <Bullet>
                  Interés legítimo: seguridad, prevención de fraude, y mejora de la App mediante reportes de errores.
                </Bullet>
                <Bullet>
                  Consentimiento: cuando sea necesario (por ejemplo, permisos del dispositivo o personalizaciones no esenciales).
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Proveedores y terceros"
                  subtitle="Alojamiento, login y anuncios."
                />
                <Bullet>Los datos se almacenan en servidores de terceros (proveedores cloud) con medidas de seguridad razonables.</Bullet>
                <Bullet>
                  Inicio de sesión con Google: si eliges esta opción, Google procesa datos necesarios para autenticarte según
                  sus propias políticas.
                </Bullet>
                <Bullet>
                  Anuncios: la versión gratuita puede mostrar publicidad. Los proveedores de anuncios pueden usar identificadores
                  técnicos para entregar anuncios y prevenir fraude (según configuración y permisos del dispositivo).
                </Bullet>
                <Paragraph>
                  En el momento de publicación, los proveedores específicos pueden variar. Cuando corresponda, se indicarán
                  dentro de la App o en una sección de “Proveedores” actualizada.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Cookies / sesión"
                  subtitle="Tecnología esencial."
                />
                <Paragraph>
                  {APP_NAME} puede usar tokens o mecanismos equivalentes a “cookies” para mantener tu sesión iniciada y
                  recordar tu autenticación. No se usan para fines no esenciales fuera de lo descrito en esta política.
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Conservación y eliminación"
                  subtitle="Control total desde tu perfil."
                />
                <Bullet>
                  Puedes eliminar tu cuenta desde el perfil. La eliminación es definitiva e irreversible, incluyendo todos
                  tus datos asociados, salvo conservación obligatoria por ley o por motivos de seguridad (por ejemplo, registros
                  mínimos antifraude durante un tiempo razonable).
                </Bullet>
              </Card>

              <Card>
                <SectionTitle
                  icon={<FileText size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Tus derechos"
                  subtitle="Acceso, rectificación, supresión, etc."
                />
                <Bullet>Acceder a tus datos personales.</Bullet>
                <Bullet>Rectificar datos inexactos.</Bullet>
                <Bullet>Solicitar la supresión (cuando corresponda).</Bullet>
                <Bullet>Limitar u oponerte a ciertos tratamientos (según base legal).</Bullet>
                <Bullet>Portabilidad (cuando aplique).</Bullet>
                <Paragraph>
                  Para ejercer tus derechos, contáctanos en {CONTACTO_EMAIL}. También puedes presentar una reclamación ante la
                  autoridad de control competente (por ejemplo, en España, la AEPD).
                </Paragraph>
              </Card>

              <Card>
                <SectionTitle
                  icon={<Mail size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Contacto"
                  subtitle="Privacidad y datos."
                />
                <LinkRow label={CONTACTO_EMAIL} onPress={mailto} />
              </Card>

              <Card>
                <SectionTitle
                  icon={<Shield size={18} color={isDark ? "#E2E8F0" : "#0F172A"} />}
                  title="Cambios en esta política"
                  subtitle="Actualizaciones razonables."
                />
                <Paragraph>
                  Podemos actualizar esta Política para reflejar mejoras o cambios legales. Te avisaremos dentro de la App si
                  el cambio es relevante. La fecha de “Actualizado” indica la última revisión.
                </Paragraph>
              </Card>
            </View>
          )}

          {/* Footer final (Aquí va “Actualizado”) */}
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
