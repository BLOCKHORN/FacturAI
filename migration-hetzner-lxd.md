# Plan de Migración: FacturAI a Hetzner (LXD)

## Objetivo
Migrar el proyecto FacturAI (Frontend en Next.js y Backend en Express) desde el entorno local al servidor Hetzner, utilizando el contenedor/máquina virtual LXD ya configurado, garantizando el aislamiento total respecto al servidor de Minecraft.

## Estado Inicial y Contexto
- El servidor Hetzner es accesible mediante Tailscale (`ssh root@100.68.69.57`).
- Dentro del servidor, el entorno LXD ya está provisionado (`Ubuntu 24.04.4 LTS`).
- El repositorio en GitHub (`https://github.com/BLOCKHORN/FacturAI`) está configurado como público.
- El directorio local del proyecto (`/home/crystalchemist/Proyectos/FacturAI`) necesita ser inicializado y subido al repositorio.

## Pasos de Implementación

### Fase 1: Sincronización del Código (Entorno Local)
1. Inicializar el directorio local como repositorio Git (si no lo está).
2. Añadir el origen remoto: `https://github.com/BLOCKHORN/FacturAI`.
3. Hacer commit de todo el código (asegurándose de que `.env` y `.env.local` estén en `.gitignore`).
4. Hacer un push de la rama principal a GitHub.

### Fase 2: Configuración del Entorno en LXD (Hetzner)
1. Acceder vía SSH al servidor Hetzner: `ssh root@100.68.69.57`. *(Nota: Si Tailscale solicita autenticación web, el usuario deberá validarlo).*
2. Actualizar el sistema e instalar dependencias esenciales (`git`, `curl`, `nginx`).
3. Instalar Node.js (preferiblemente usando NVM para gestionar versiones, recomendada v20 o v22).
4. Instalar `pm2` globalmente (`npm install -g pm2`) para la gestión de procesos del backend y frontend.

### Fase 3: Despliegue de la Aplicación (Hetzner)
1. Clonar el repositorio público en el servidor LXD (ej. en `/var/www/facturai`).
2. Transferir de forma segura las variables de entorno (`.env` local de backend y frontend) al servidor remoto usando `scp` o creándolas directamente con `nano`.
3. **Backend:** 
   - Instalar dependencias: `npm install`.
   - Compilar el proyecto TypeScript: `npm run build`.
   - Iniciar con pm2: `pm2 start dist/index.js --name "facturai-backend"`.
4. **Frontend:**
   - Instalar dependencias: `npm install`.
   - Compilar la aplicación Next.js: `npm run build`.
   - Iniciar con pm2: `pm2 start npm --name "facturai-frontend" -- start`.
5. Guardar la configuración de pm2 para que arranque tras reinicios del servidor: `pm2 save` y `pm2 startup`.

### Fase 4: Configuración del Servidor Web (Nginx)
1. Configurar un bloque de servidor (Server Block) en Nginx dentro del LXD.
2. Hacer proxy inverso (Reverse Proxy):
   - Redirigir el tráfico del puerto 80/443 (cuando se asigne un dominio/subdominio o la IP de ngrok/tailscale) hacia el Frontend (puerto 3000 por defecto).
   - Redirigir las rutas de la API (ej. `/api`) hacia el Backend (puerto configurado en el backend, ej. 3001).
3. Reiniciar Nginx para aplicar los cambios.

## Verificación
- Comprobar que los procesos de PM2 están corriendo sin errores.
- Acceder al frontend desde un navegador utilizando la IP de Tailscale (`100.68.69.57` o la IP interna `10.222.248.139` si Nginx expone el servicio por Tailscale) y verificar que la interfaz de usuario cargue.
- Verificar que las peticiones del frontend al backend funcionen correctamente, incluyendo la integración de autenticación.