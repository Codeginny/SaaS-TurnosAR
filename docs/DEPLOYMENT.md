# Guía de Deployment

## Descripción

Este documento describe cómo desplegar TurnosAR en un entorno de producción.

## Requisitos de Producción

### Software Requerido
- **Node.js**: 18.x o superior
- **PostgreSQL**: 14.x o superior
- **Nginx**: Opcional, para reverse proxy y SSL
- **PM2**: Para gestión de procesos en producción

### Hardware Recomendado
- **CPU**: 2 vCPUs mínimo
- **RAM**: 2GB mínimo, 4GB recomendado
- **Almacenamiento**: 20GB SSD mínimo
- **Ancho de banda**: 10 Mbps mínimo

## Configuración de Producción

### 1. Configurar Variables de Entorno

Crear archivo `.env.production` en el servidor:

```env
# Database
# ⚠️ IMPORTANTE: Reemplaza con tus credenciales reales
# Los valores mostrados a continuación son SOLO EJEMPLO
DATABASE_URL=postgresql://usuario:password_ejemplo@localhost:5432/turnosar

# JWT Authentication
# ⚠️ IMPORTANTE: Usa una cadena aleatoria larga y segura
# El valor mostrado a continuación es SOLO EJEMPLO
JWT_SECRET=ejemplo_secreto_jwt_cambiar_en_produccion_usar_cadena_aleatoria_larga
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=production

# AFIP Integration (Opcional)
# ⚠️ IMPORTANTE: Estas credenciales deben obtenerse de AFIP
# Los valores mostrados a continuación son SOLO EJEMPLO
AFIP_CUIT=20123456789
AFIP_CERT_PATH=/path/to/certificado.pfx
AFIP_KEY_PATH=/path/to/llave.key
```

**⚠️ SEGURIDAD**: Nunca versionar archivos `.env.production` con credenciales reales. Usa un gestor de secretos en producción.

### 2. Configurar Base de Datos

```bash
# Crear base de datos de producción
createdb turnosar_prod

# Ejecutar script de estructura
psql -U tu_usuario -d turnosar_prod -f server/database/structure.sql

# Ejecutar seed de datos iniciales (opcional)
cd server
NODE_ENV=production node seed.js
```

### 3. Build del Frontend

```bash
# Navegar al directorio del cliente
cd client

# Instalar dependencias
npm install

# Build para producción
npm run build

# El resultado estará en client/dist/
```

## Deployment con PM2

### 1. Instalar PM2 Globalmente

```bash
npm install -g pm2
```

### 2. Crear Ecosystem File

Crear archivo `ecosystem.config.js` en la raíz del proyecto:

```javascript
module.exports = {
  apps: [{
    name: 'turnosar-server',
    script: './server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 3. Iniciar con PM2

```bash
# Iniciar la aplicación
pm2 start ecosystem.config.js --env production

# Verificar estado
pm2 status

# Ver logs
pm2 logs turnosar-server

# Configurar para inicio automático
pm2 startup
pm2 save
```

## Deployment con Docker (Opcional)

### 1. Crear Dockerfile del Servidor

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

### 2. Crear Dockerfile del Cliente

```dockerfile
# client/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Servir con Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Crear docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: turnosar
      POSTGRES_USER: turnosar_user
      POSTGRES_PASSWORD: example_password  # ⚠️ CAMBIAR EN PRODUCCIÓN
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  server:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://turnosar_user:example_password@postgres:5432/turnosar
      JWT_SECRET: your_jwt_secret_here  # ⚠️ CAMBIAR EN PRODUCCIÓN
      NODE_ENV: production
    depends_on:
      - postgres

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  postgres_data:
```

### 4. Ejecutar con Docker Compose

```bash
# Build y iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## Configuración de Nginx (Opcional)

### 1. Instalar Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 2. Configurar Nginx

Crear archivo `/etc/nginx/sites-available/turnosar`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend (servido como archivos estáticos)
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Habilitar Configuración

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/turnosar /etc/nginx/sites-enabled/

# Test de configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## SSL con Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo certbot renew --dry-run
```

## Monitoreo

### PM2 Monit

```bash
# Instalar PM2 Plus (opcional)
pm2 install pm2-logrotate

# Ver métricas en tiempo real
pm2 monit
```

### Logs

```bash
# Ver logs de PM2
pm2 logs

# Guardar logs en archivo
pm2 install pm2-logrotate
```

## Backup

### Backup de Base de Datos

```bash
# Crear script de backup backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
pg_dump -U tu_usuario turnosar_prod > $BACKUP_DIR/turnosar_$DATE.sql

# Agregar a crontab para backup diario
0 2 * * * /path/to/backup.sh
```

### Backup de Archivos

```bash
# Backup del frontend build
tar -czf backups/client_dist_$(date +%Y%m%d).tar.gz client/dist/

# Backup de archivos de configuración
tar -czf backups/config_$(date +%Y%m%d).tar.gz .env.production
```

## Seguridad en Producción

### ✅ Checklist de Seguridad

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Usar JWT secretos aleatorios y largos
- [ ] Configurar firewall (ufw/iptables)
- [ ] Habilitar HTTPS con SSL válido
- [ ] Configurar rate limiting en Nginx
- [ ] Usar gestor de secretos (AWS Secrets Manager, HashiCorp Vault)
- [ ] Habilitar logs de auditoría
- [ ] Configurar backups automáticos
- [ ] Usar HTTPS para todas las conexiones
- [ ] Mantener sistema actualizado

### Firewall (UFW)

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH
sudo ufw allow 22

# Permitir HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Denegar todo lo demás
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

## Escalado

### Horizontal Scaling

Para escalar horizontalmente:

```bash
# Iniciar múltiples instancias con PM2
pm2 start ecosystem.config.js -i max

# O especificar número de instancias
pm2 start ecosystem.config.js -i 4
```

### Load Balancing

Usar Nginx como load balancer:

```nginx
upstream backend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

## Rollback

### Rollback del Servidor

```bash
# Detener aplicación actual
pm2 stop turnosar-server

# Restaurar backup de base de datos
psql -U tu_usuario -d turnosar_prod < backup_turnosar_20260427.sql

# Revertir a versión anterior
git checkout <commit-hash>
npm install
npm run build

# Iniciar aplicación
pm2 start ecosystem.config.js --env production
```

### Rollback del Frontend

```bash
# Restaurar backup del build
tar -xzf backups/client_dist_20260427.tar.gz -C client/

# O revertir a versión anterior
git checkout <commit-hash>
cd client
npm run build
```

## Verificación Post-Deployment

### Checklist de Verificación

- [ ] Servidor responde en puerto 3000
- [ ] Frontend carga correctamente
- [ ] Login de pacientes funciona
- [ ] Login de profesionales funciona
- [ ] Creación de turnos funciona
- [ ] Dashboard profesional muestra datos
- [ ] Facturación genera comprobantes
- [ ] SSL funciona correctamente
- [ ] Logs no muestran errores
- [ ] Backup automático configurado

## Troubleshooting de Deployment

### Servidor no inicia

```bash
# Ver logs de PM2
pm2 logs turnosar-server

# Verificar que las variables de entorno estén cargadas
pm2 env 0

# Verificar que la base de datos sea accesible
psql -U tu_usuario -d turnosar_prod -c "SELECT 1"
```

### Frontend no carga

```bash
# Verificar que el build exista
ls -la client/dist/

# Verificar que Nginx esté apuntando al directorio correcto
cat /etc/nginx/sites-available/turnosar

# Verificar permisos de archivos
chmod -R 755 client/dist/
```

### Conexión a base de datos falla

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar credenciales en .env.production
cat .env.production | grep DATABASE_URL

# Probar conexión manual
psql -U tu_usuario -d turnosar_prod -h localhost
```

## Soporte

Para problemas de deployment no resueltos:

1. Revisar `docs/TROUBLESHOOTING.md`
2. Verificar logs del servidor y base de datos
3. Consultar documentación de PM2, Nginx, PostgreSQL

**⚠️ IMPORTANTE**: Nunca incluyas credenciales reales (contraseñas, tokens, API keys) al reportar problemas de deployment. Usa ejemplos o datos de prueba.
