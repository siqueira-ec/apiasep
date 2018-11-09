# apiasep
API para consulta de cotas de exames do IASEP. Basicamente um webcrawler. Powered by NodeJS.

## Rodando sem Docker
### Instale as dependências
`yarn install` ou `npm install`

### Inicie o servidor
`yarn start` ou `npm start`

## Rodando com Docker
### Construa a imagem
```
docker build -t apiasep:1.0.0 .
```

### Inicie um container
```
docker run -it --rm -p 3000:3000 apiasep
```

# Documentação
Após iniciar o servidor, a documentação estará disponível em http://localhost:3000/api-docs
