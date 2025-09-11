# Deployment Guide - Dashboard MDG

## 🚀 Proyecto Deployado en Vercel

### URLs de Producción
- **URL Principal**: https://dashboard-8pg1ko98d-franco-buschs-projects.vercel.app
- **Panel de Control Vercel**: https://vercel.com/franco-buschs-projects/dashboard_lps
- **Inspect URL**: https://vercel.com/franco-buschs-projects/dashboard_lps/66CgPs86YzmeH8TgkFwzJPRQcGSN

## 📋 Variables de Entorno Configuradas

Todas las variables de entorno han sido configuradas en Vercel para los ambientes de Production, Preview y Development:

### Variables de Base de Datos
- ✅ `MONGODB_URI`: mongodb+srv://buschfranc0:YochicosDev30@devrequest.bp72ljp.mongodb.net/?retryWrites=true&w=majority&appName=DevRequest
- ✅ `MONGODB_DB_NAME`: DevRequest

### Variables de Autenticación
- ✅ `ADMIN_APPROVAL_TOKEN`: 4444

### Variables de Integración Jira
- ✅ `JIRA_BASE_URL`: https://mobisoft.atlassian.net/
- ✅ `JIRA_EMAIL`: franco@mediadigitalgroup.com
- ✅ `JIRA_API_TOKEN`: [Token configurado]
- ✅ `JIRA_PROJECT_KEY`: DO

## 🛠️ Comandos de Deployment

### Deployment Inicial
```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Login en Vercel
vercel login

# Primer deployment
vercel
```

### Deployments Posteriores
```bash
# Deployment a producción
vercel --prod

# Deployment a preview
vercel
```

### Gestión de Variables de Entorno
```bash
# Listar variables de entorno
vercel env ls

# Agregar nueva variable
vercel env add VARIABLE_NAME

# Eliminar variable
vercel env rm VARIABLE_NAME
```

## 📁 Configuración del Proyecto

### Astro Config (astro.config.mjs)
```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel()
});
```

### Vercel Config (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro",
  "regions": ["iad1"]
}
```

## 🔧 Configuración Automática de Vercel

- **Framework**: Astro (detectado automáticamente)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Development Command**: `astro dev --port $PORT`
- **Install Command**: `npm install`

## 📝 Notas Importantes

1. **Dominio Personalizado**: Para configurar un dominio personalizado, ve a la configuración del proyecto en Vercel
2. **Logs**: Puedes ver los logs de deployment y runtime en el panel de Vercel
3. **Rollback**: Vercel permite hacer rollback a deployments anteriores desde el panel
4. **Analytics**: Vercel proporciona analytics automáticos para el proyecto

## 🔄 Workflow de Desarrollo

1. **Desarrollo Local**: `npm run dev`
2. **Build Local**: `npm run build`
3. **Preview**: `npm run preview`
4. **Deploy a Preview**: `vercel`
5. **Deploy a Producción**: `vercel --prod`

## 🚨 Troubleshooting

### Known Issues

#### Production Database Connection (SSL Error)
**Status**: UNRESOLVED
**Error**: `SSL routines:ssl3_read_bytes:tlsv1 alert internal error`

**Problem**: MongoDB connection works locally but fails in Vercel production environment with SSL/TLS errors.

**Attempted Solutions**:
- ✅ Verified environment variables are correctly set in Vercel
- ✅ Tested multiple MongoDB client configurations (timeouts, SSL options, connection pooling)
- ✅ Simplified configuration to minimal settings
- ✅ Added Vercel-specific environment detection
- ✅ Removed retry logic that might interfere with connections
- ❌ SSL/TLS configuration adjustments (still failing)
- ❌ Node.js version specification (still failing)

**Current Workaround**: None available. The application works in development but not in production.

**Next Steps**:
1. Consider migrating to a different MongoDB hosting provider
2. Investigate Vercel-specific MongoDB connection libraries
3. Contact Vercel support for SSL/TLS configuration guidance

### Database Connection Issues

#### Connection Configuration
- Uses environment-specific configuration (minimal for Vercel, full for local)
- Implements proper error handling and logging
- Connection pooling disabled for serverless compatibility

### General Issues

#### Environment Variables
- Ensure all required environment variables are set in Vercel dashboard
- Check that `MONGODB_URI` and `MONGODB_DB_NAME` are properly configured
- Verify Jira integration variables if using approval features

#### Build Issues
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript compilation succeeds with `npm run build`
- Verify Astro configuration is compatible with Vercel

### Si el deployment falla:
1. Verificar que todas las dependencias estén en `package.json`
2. Revisar los logs en el panel de Vercel
3. Verificar que las variables de entorno estén configuradas
4. Asegurar que el build local funcione: `npm run build`

### Para actualizar variables de entorno:
1. Usar `vercel env add` para nuevas variables
2. Hacer un nuevo deployment: `vercel --prod`
3. Las variables se aplicarán en el siguiente deployment

---

**Proyecto**: Dashboard MDG  
**Framework**: Astro + Vercel Serverless  
**Última actualización**: $(date)  
**Estado**: ✅ Deployado y funcionando