import * as http from "http";
import { parse } from "url";
import { User } from "./src/types/types.js";
import * as uuid from "uuid";
import "dotenv/config";
import cluster from "cluster";
import { cpus } from "os";
import { addUser, findUser, getUsers, isUser, setUsers } from "./src/db.js";

const mode = process.env.NODE_MODE;
const port = process.env.PORT;

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
            bindSuccessResolver(getUsers());
            break;
          }
          case "DELETE": {
            setUsers([]);
            bindSuccessResolver(getUsers(), 204);
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
                addUser(user);
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
                const newUsersArr = getUsers().map((el) => {
                  if (el.id !== user.id) {
                    return el;
                  } else {
                    return { ...el, ...userData };
                  }
                });
                setUsers(newUsersArr);
                bindSuccessResolver(findUser(userData.id, res));
              }
            });
            break;
          }
          case "DELETE": {
            const user = findUser(query.id ? query.id.toString() : "", res);
            if (user) {
              const newUsersArr = getUsers().filter((el) => el.id !== query.id);
              setUsers(newUsersArr);
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
    const workerObj = cluster.fork();

    workerObj.on("message", (data) => {
      const { users } = data;
      setUsers(users);
      for (const worker of Object.values(cluster.workers)) {
        worker.send({ users: getUsers() });
      }
    });
  });

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.id} is down!`);
  });
} else {
  const { worker: { id: workerID = 0 } = {} } = cluster;

  const serverPort = Number(port) + workerID;
  server.listen(serverPort, () => {
    console.log(`Server started on port ${serverPort}`);
    if (mode === "multi") {
      process.on("message", (data: { users: User[] }) => {
        const { users } = data;
        setUsers(users);
      });
      console.log(`Worker ${workerID} is up!`);
    }
  });
}

// utils

export const successResolver = (res: any, payload: any, statusCode: number) => {
  responseCreator(res, payload, statusCode);
};

export const responseCreator = (res: any, payload: any, statusCode: number) => {
  // Trigger sync database for all workers
  if (mode === "multi") {
    process.send({ users: getUsers() });
  }

  if (!res.writableEnded) {
    res.writeHead(statusCode);
    res.end(JSON.stringify(payload));
  }
};

// response error handlers

export const wrongMethodHandler = (res: any) => {
  responseCreator(
    res,
    { message: "Incorrect route and/or method, please check it" },
    404
  );
};

export const wrongUUIDInstanceHandler = (res: any) => {
  responseCreator(res, { message: "userId is not valid uuid instance" }, 400);
};

export const wrongUserIDErrorHandler = (res: any) => {
  responseCreator(res, { message: "User with this ID doesn't exist" }, 404);
};

export const wrongUserObjErrorHandler = (res: any) => {
  responseCreator(res, { message: "Please check all required fields" }, 400);
};
