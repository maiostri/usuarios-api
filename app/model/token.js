import mongoose from "mongoose";

const Token = mongoose.model(
  "Token",
  new mongoose.Schema({
    access_token: String
  })
);

export default Token;
