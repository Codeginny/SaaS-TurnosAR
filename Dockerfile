# Usa una imagen base oficial y ligera de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de definición de dependencias principales
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Instala todas las dependencias del proyecto
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copia el código fuente completo al contenedor
COPY . .

# Expone los puertos necesarios para el backend (3001) y frontend (5173)
EXPOSE 3001
EXPOSE 5173

# Comando para iniciar la aplicación de forma completa
CMD ["npm", "run", "dev:full"]
