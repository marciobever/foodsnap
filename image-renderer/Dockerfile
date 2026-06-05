# Usa a imagem oficial do Node.js baseada em Alpine (Leve mas precisa de libs do browser)
# Trocando pra Debian/Ubuntu leve por causa das dependencias complexas do Chrome
FROM node:18-slim

# Instalar dependências necessárias para rodar o Puppeteer (Chromium) no Linux
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Definir a variável de ambiente para forçar o Puppeteer a usar o Chrome instalado ao invés de baixar um próprio
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Criar o diretório de trabalho da aplicação
WORKDIR /usr/src/app

# Copiar os arquivos de dependência
COPY package*.json ./

# Instalar as dependências do Node
RUN npm install

# Copiar o resto do código do servidor
COPY . .

# Expor a porta que a aplicação Express escuta
EXPOSE 3001

# Comando para iniciar o servidor
CMD [ "npm", "start" ]
