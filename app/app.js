import express from "express";
import init from "./database/init.js";
import cors from "cors";
import { signup, login, valida } from "./middleware/auth.js";
import mongoose from "mongoose";

mongoose.Promise = global.Promise;

// Inicializando o framework responsável por expor rotas e métodos HTTP.
const app = express();

// Porta da aplicação que vamos utilizar
const PORT = 5000;

// Vamos inicializar o banco!!
init();

const corsOptions = {
  origin: "http://localhost:4200",
};

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// Configurando para que a app permita requests do frontend
app.use(cors(corsOptions));

// Aqui estamos falando que vamos aceitar json
app.use(express.json());

// Aqui estamos falando que vamos aceitar o url-encoded
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => console.log("subiuuuu!"));

// Aqui estamos cadastrando a rota para cadastrar usuário!!!
// Middleware -> (req, res) => faz as manipulações dentro
// É permitido ter uma lista de middleware
app.post("/signup", signup);


// Vamos criar o método de login!!!
app.post("/login", login);

app.post("/valida", valida);
