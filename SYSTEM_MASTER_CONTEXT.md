# 🏛️ FACTURAI: SYSTEM MASTER CONTEXT & B2B/B2B2C ORCHESTRATION

## 1. MODELO DE NEGOCIO DUAL Y PRICING
FacturAI opera bajo dos vías de monetización simultáneas. El sistema debe soportar ambas lógicas y adaptar las interfaces (Dashboards) según el rol del usuario:

**VÍA A: B2B Directo (Autónomos y Empresas)**
Venta a puerta fría. El cliente es el dueño del Tenant y puede invitar a su gestor externo (solo lectura/exportación).
- **Plan Autónomo (49€/mes):** Límite de facturas (ej. 30-50/mes).
- **Plan Empresa (299€/mes):** Facturación ilimitada, multi-usuario.

**VÍA B: B2B2C Canal (Gestorías)**
Venta de licencias por volumen. La Gestoría compra lotes baratos y distribuye el software a sus clientes.
- **Modelo:** El Gestor es el dueño del Tenant principal. Sus clientes (Autónomos) son Sub-Tenants que solo ven la pantalla de emitir facturas (UX de cero fricción).
- **El Gancho de Retención:** Dashboards de control masivo para el gestor y exportación directa a sus programas contables (A3/Sage).

## 2. ARQUITECTURA MULTI-TENANT Y ROLES (RBAC)
La base de datos (PostgreSQL/Supabase) debe soportar esta jerarquía:
- **Roles en `profiles`:** `autonomo`, `empresa`, `gestoria`, `gestor_invitado`.
- **Relaciones:** - Un perfil B2B Directo (`autonomo`/`empresa`) puede generar un enlace de acceso para un `gestor_invitado` (dashboard capado para descargar lotes y CSVs).
  - Un perfil `gestoria` tiene una clave foránea que lo vincula a múltiples perfiles de autónomos (sus clientes).

## 3. EL NÚCLEO CONTABLE: EXPORTACIONES A3 / SAGE
Independientemente de la vía de negocio, el gestor (ya sea el cliente principal o el invitado) necesita un módulo de exportación avanzado.
- El sistema debe poder transformar las tablas `invoices` e `invoice_lines` en archivos posicionales nativos (ej. `suenlace.dat` para A3) o CSV tabulados, eliminando la necesidad de picar datos a mano en la asesoría.

## 4. REQUISITOS LEGALES (VERIFACTU - AEAT)
- **Aislamiento de Responsabilidad:** El usuario final asume el riesgo fiscal.
- **Entorno de Pruebas:** Los XML van al Sandbox de la AEAT hasta confirmación.
- **Metadatos Backend:** Hash de encadenamiento (SHA-256), QR estandarizado y Huella FacturAI.

## 5. AUTOCOMPLETADO HÍBRIDO Y MOTOR DE LÍNEAS
El objetivo es fricción cero para el usuario que emite la factura (Paco).
- **DB Aislada:** `global_verified_companies` (pública, lectura) vs `tenant_private_clients` (agenda privada del tenant). NO cruzar agendas privadas.
- **Autocompletado:** Busca en privado; si no, busca en público. Foco en campos vacíos. Guarda siempre en privado. Validación matemática obligatoria (CIF/NIF/NIE).
- **Matemáticas Invisibles:** En `invoice_lines`, el usuario introduce "Precio Total". El frontend calcula de forma transparente la Base Imponible y la Cuota de IVA (21% por defecto).

## 6. REGLAS DE ORO PARA EL AGENTE AI (SYSTEM INSTRUCTIONS)
Como CTO virtual y Arquitecto del Monorepo, debes cumplir estas leyes:
1. **Cero Suposiciones:** Si faltan variables de entorno, modelos de Prisma/SQL o estados de React, PREGUNTA. No inventes.
2. **Código 100% Limpio:** Scripts y componentes SIN COMENTARIOS (`//`, `/*`) y SIN EMOJIS en el código final.
3. **Perspectiva de Negocio:** Valora pros y contras técnicos. Si una petición del usuario es ineficiente o revienta la escalabilidad del modelo B2B/B2B2C, dímelo de frente y propón la alternativa lógica.
4. **Análisis de Raíz:** No apliques parches a los bugs. Desglosa el origen del problema y atácalo en la arquitectura.
5. **Stack Oficial:** Node.js, Express, Next.js, React Hook Form, Tailwind CSS, Supabase (PostgreSQL), TypeScript.