import bcrypt from "bcryptjs";
import User from "../model/user.js";
import Token from "../model/token.js";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { ObjectId } from "bson";

// REQ -> Request
// RES -> Response
export const signup = (req, res) => {
  // Pegamos os dados do request e criamos o modelo.
  
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
    
    if (!user) {
      res.status(401).send({
        message: "Conta não cadastrada com esse email"
      });
      return;
    }
    
    let passwordIsValid = bcrypt.compareSync(req.body.senha, user.senha);

    if (!passwordIsValid) {
      res.status(401).send({
        message: "Você não me engana não. Errou.",
      });
      return;
    }

    let token = jwt.sign({ id: user.id }, config.SECRET, {
      expiresIn: 86400, // 24 horas em segundos.
    });

    res.status(200).send({
      email: user.email,
      permissao: user.permissao,
      accessToken: token,
    });
  });
};


export const validaHeader = (req, res, next) => {
  let token = req.get('X-token');

  if (!token) {
    return res.status(403).send({ message: "Você nao me engana de novo." });
  }

  // Token.findOne({ acess_token: token }).exec(
  //   (err, token) => {
  //     console.log(token);
  //     if (token && token.acess_token && token.acess_token == token) {
  //       console.log("token invalidado já cadastrado na blacklist!!");
  //       return res.status(401).send({ message: "Você não me engana" });
  //     }

      jwt.verify(token, config.SECRET, (err, decoded) => {
        console.log(decoded);

        if (err) {
          console.log("erro ao validar token!!", err);
          return res.status(401).send({ message: "Você não me engana" });
        }

        User.findById({ _id: ObjectId(decoded.id)}).exec((err, user) => {
          console.log(req.url);
          
          if (req.url.includes("usuarios") && user.permissao != 'admin') {
            return res.status(403).send({ message: "Você nao me engana de novo." });
          }
          
          res.header("x-roles", user.permissao);
          next();
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
      console.log("erro ao validar token");
      return res.status(401).send({ message: "Você não me engana" });
    }

    User.findById({ _id: ObjectId(decoded.id)}).exec((err, user) => {
      
      return res.status(200).send({
        user_id: decoded.id,
        permissao: user.permissao
      });
    });
  });
};


export const logout = (req, res) => {
  let token = req.body.token;

  const tokenDb = new Token({
    access_token: token
  });

  tokenDb.save((err, token) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({ message: "Logout realizado com sucesso!" });
    return;
  });
}