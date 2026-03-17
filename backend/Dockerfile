# Arquivo: ControleDocenteFaltosos/backend/Dockerfile
# Função: Define como construir a imagem do Node.js

FROM node:18-alpine

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia o resto do código
COPY . .

# Cria pasta para dados SQLite
RUN mkdir -p /app/data && chown -R node:node /app

# Muda para usuário não-root (segurança)
USER node

EXPOSE 3000

CMD ["node", "src/server.js"]