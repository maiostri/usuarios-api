import bcrypt from "bcryptjs";
import User from "../model/user.js";
import jwt from "jsonwebtoken";
import config from "../config/index.js";

// REQ -> Request
// RES -> Response
export const signup = (req, res) => {
  // Pegamos os dados do request e criamos o modelo.
  console.log(req.body.email);
  console.log(req.body.nome);
  console.log(req.body.senha);
  const user = new User({
    email: req.body.email,
    nome: req.body.nome,
    senha: bcrypt.hashSync(req.body.senha),
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(201).send({ message: "Criado com sucesso!" });
    return;
  });
};

export const login = (req, res) => {
  User.findOne({
    email: req.body.email,
  }).exec((err, user) => {
    let passwordIsValid = bcrypt.compareSync(req.body.senha, user.senha);

    if (!passwordIsValid) {
      res.status(401).send({
        message: "Você não me engana não. Errou.",
      });
    }

    let token = jwt.sign({ id: user.id }, config.SECRET, {
      expiresIn: 86400, // 24 horas em segundos.
    });

    res.status(200).send({
      email: user.email,
      accessToken: token,
    });
  });
};

export const valida = (req, res) => {
  let token = req.body.token;

  if (!token) {
    return res.status(403).send({ message: "Você nao me engana de novo." });
  }

  jwt.verify(token, config.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Você não me engana" });
    }

    res.status(200).send({
      user_id: decoded.id,
    });
  });
};
