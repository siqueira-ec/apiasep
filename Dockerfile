# máquina nodejs
FROM node:11

# criando diretório onde o app ficará armazenado na máquina
RUN mkdir -p /usr/src/apiasep

# usando diretório recém criado
WORKDIR /usr/src/apiasep

# copiando arquivo de gerenciamento de depêndencias
COPY package*.json /usr/src/apiasep/

# instalando depêndencias
RUN npm install --production

# copia conteúdo do projeto para pasta na máquina
COPY . /usr/src/apiasep

# expõe porta :3000, padrão do node
EXPOSE 3000

# inicia aplicação
CMD [ "npm", "start" ]
