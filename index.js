import http from "http";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
dotenv.config({ path: path.join(dirname, ".env") }); // Need to specify where .env is placed
const port = process.env.PORT;

// Fake db for now
const users = [
  { id: 1, username: "Alex", age: 25, hobbies: ["boardgames"] },
  { id: 2, username: "Dmitriy", age: 27, hobbies: ["cars"] },
];

const requestListener = (req, res) => {
  const { method, url } = req;

  const responseResolver = (statusCode, data) => {
    res.writeHead(statusCode);
    res.end(data);
  };

  switch (method) {
    case "GET":
      break;

    case "POST":
      break;

    case "UPDATE":
      break;

    case "DELETE":
      break;

    default: {
      res.writeHead(200);
      res.end("Welcome to the server!");
    }
  }
};

const server = http.createServer(requestListener);

server.listen(port, () => {
  console.log(`Server running on port - ${port}`);
});
