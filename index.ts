import * as http from "http";
import { parse } from "url";
import { User } from "./src/types/types.ts";
import * as uuid from "uuid";
import "dotenv/config";
import cluster from "cluster";
import { cpus } from "os";

const port = process.env.PORT;
const mode = process.env.NODE_MODE;

let users = [];

export const server = http.createServer((req: any, res: any) => {
  try {
    const parsedUrl = parse(req.url, true);
    const { query, pathname } = parsedUrl;
    const { method } = req;

    const bindSuccessResolver = (payload: any, statusCode: number = 200) => {
      successResolver(res, payload, statusCode);
    };

    switch (pathname) {
      case "/api/users": {
        switch (method) {
          case "GET": {
            bindSuccessResolver(users);
            break;
          }
          case "DELETE": {
            users = [];
            bindSuccessResolver(users, 204);
            break;
          }
          case "POST": {
            let data: string = "";
            req.on("data", (chunk: any) => {
              data += chunk.toString();
            });
            req.on("end", () => {
              const payload = JSON.parse(data);
              const user: User = {
                id: uuid.v4(),
                ...payload,
              };
              console.log(user);
              if (isUser(user)) {
                users.push(user);
                bindSuccessResolver(user, 201);
              } else {
                wrongUserObjErrorHandler(res);
              }
            });
            break;
          }
          default: {
            wrongMethodHandler(res);
            break;
          }
        }

        break;
      }

      case "/api/users/": {
        switch (req.method) {
          case "GET": {
            const user = findUser(query.id ? query.id.toString() : "", res);
            if (user) {
              bindSuccessResolver(user);
            }
            break;
          }
          case "PUT": {
            let data: string = "";
            req.on("data", (chunk: any) => {
              data += chunk.toString();
            });
            req.on("end", () => {
              const userData = JSON.parse(data);
              const user = findUser(userData.id, res);
              if (user) {
                users = users.map((el) => {
                  if (el.id !== user.id) {
                    return el;
                  } else {
                    return { ...el, ...userData };
                  }
                });
                bindSuccessResolver(findUser(userData.id, res));
              }
            });
            break;
          }
          case "DELETE": {
            const user = findUser(query.id ? query.id.toString() : "", res);
            if (user) {
              users = users.filter((el) => el.id !== query.id);
              responseCreator(res, { message: "User deleted" }, 204);
            }
            break;
          }
          default: {
            wrongMethodHandler(res);
            break;
          }
        }

        break;
      }

      default: {
        wrongMethodHandler(res);
        break;
      }
    }
  } catch (error) {
    responseCreator(
      res,
      { message: "Something went wrong due the evaluation" },
      500
    );
  }
});

// Load balancer

if (mode === "multi" && cluster.isPrimary) {
  cpus().forEach(() => {
    cluster.fork();
  });

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.id} is down!`);
    cluster.fork();
  });
} else {
  server.listen(port, () => console.log(`Server started on port ${port}`));
  if (mode === "multi") {
    const {
      worker: { id: workerID },
    } = cluster;
    console.log(`Worker ${workerID} is up!`);
  }
}

// utils

const findUser = (userID: string, res: any) => {
  if (!uuid.validate(userID)) {
    wrongUUIDInstanceHandler(res);
  }
  const currentUser = users.find((user) => user.id === userID);

  if (!currentUser) {
    wrongUserIDErrorHandler(res);
  }
  return currentUser;
};

const isUser = (user: User) => {
  return user.username && user.age && user.hobbies;
};

const successResolver = (res: any, payload: any, statusCode: number) => {
  responseCreator(res, payload, statusCode);
};

const responseCreator = (res: any, payload: any, statusCode: number) => {
  if (!res.writableEnded) {
    res.writeHead(statusCode);
    res.end(JSON.stringify(payload));
  }
};

// response error handlers

const wrongMethodHandler = (res: any) => {
  responseCreator(
    res,
    { message: "Incorrect route and/or method, please check it" },
    404
  );
};

const wrongUUIDInstanceHandler = (res: any) => {
  responseCreator(res, { message: "userId is not valid uuid instance" }, 400);
};

const wrongUserIDErrorHandler = (res: any) => {
  responseCreator(res, { message: "User with this ID doesn't exist" }, 404);
};

const wrongUserObjErrorHandler = (res: any) => {
  responseCreator(res, { message: "Please check all required fields" }, 400);
};
