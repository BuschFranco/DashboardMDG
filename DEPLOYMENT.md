# Deployment en Vercel

## Pasos para hacer deploy

### 1. Preparación del proyecto
El proyecto ya está configurado para Vercel con:
- `vercel.json` configurado
- Adaptador de Vercel instalado (`@astrojs/vercel`)
- `astro.config.mjs` actualizado

### 2. Variables de entorno en Vercel
Debes configurar estas variables de entorno en tu proyecto de Vercel:

```
MONGODB_URI=tu_uri_de_mongodb
MONGODB_DB_NAME=tu_nombre_de_base_de_datos
ADMIN_APPROVAL_TOKEN=tu_token_de_admin
```

### 3. Deployment

#### Opción A: Usando Vercel CLI
```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Login en Vercel
vercel login

# Deploy
vercel
```

#### Opción B: Conectar repositorio Git
1. Sube tu código a GitHub/GitLab/Bitbucket
2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu repositorio
4. Configura las variables de entorno
5. Deploy automático

### 4. Configuración post-deployment
- Actualiza la URL del token de admin en tu aplicación
- Verifica que todas las rutas funcionen correctamente
- Prueba la conexión a MongoDB

### 5. URLs importantes
- Panel de administración: `https://tu-dominio.vercel.app/admin/tu-token`
- API endpoints: `https://tu-dominio.vercel.app/api/*`