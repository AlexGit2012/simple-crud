import {
  IncomingMessage,
  ServerResponse,
  createServer,
  request as httpRequest,
} from "http";
import { parse } from "url";
import { User } from "./src/types/types.js";
import "dotenv/config";
import cluster from "cluster";
import { availableParallelism } from "os";
import process from "node:process";
import { responseCreator, successResolver } from "./src/utils/utils";
import { router } from "./src/router";
import { getUsers, setUsers } from "./src/db";

const mode = process.env.NODE_ENV;
let port = process.env.PORT || 5001;
const workers = [];
let workerIndex = 0;

export const server = createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;
      const { method } = req;
      const restUrl = pathname.replace("/api/users", "");
      const userID = restUrl.substring(1);

      const bindSuccessResolver = (
        payload: User | User[],
        statusCode: number = 200
      ) => {
        successResolver(res, payload, statusCode);
      };

      if (mode === "multi" && cluster.isPrimary) {
        const customReq = httpRequest(
          {
            hostname: "localhost",
            port: Number(port) + workerIndex,
            method,
            path: pathname,
            headers: {
              "Content-Type": "application/json",
            },
          },
          (workerResponse: IncomingMessage) => {
            let workerBody = "";
            workerResponse.on("data", (chunk: Buffer | string) => {
              workerBody += chunk.toString();
            });
            workerResponse.on("end", () => {
              res.setHeader("Content-Type", "application/json");
              res.writeHead(workerResponse.statusCode);
              res.end(workerBody);
            });
          }
        );
        workerIndex = (workerIndex + 1) % workers.length;
        let body = "";
        req.on("data", (chunk: Buffer | string) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          customReq.end(body);
        });
      } else {
        if (mode === "multi") {
          console.log(`Worker on port:${port} active!`);
        }
        router(pathname, method, req, res, userID, bindSuccessResolver);
      }
    } catch (error) {
      responseCreator(
        res,
        { message: "Something went wrong due the evaluation" },
        500
      );
    }
  }
);

// Load balancer

if (mode === "multi" && cluster.isPrimary) {
  for (let i = 0; i < availableParallelism() - 1; i++) {
    const workerObj = cluster.fork();

    workerObj.on("message", (data) => {
      const { users } = data;
      setUsers(users);
      for (const worker of Object.values(cluster.workers)) {
        worker.send({ users: getUsers() });
      }
    });

    workers.push(workerObj);
  }

  server.listen(port, () => {
    console.log(`Server(main) started on port ${port}`);
  });

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.id} is down!`);
    cluster.fork();
  });
} else {
  const { worker: { id: workerID = 0 } = {} } = cluster || {};
  port = Number(port) + workerID;
  server.listen(port, () => {
    console.log(`Server started on port ${port}`);
    if (mode === "multi") {
      process.on("message", (data: { users: User[] }) => {
        const { users } = data;
        setUsers(users);
      });
      console.log(`Worker ${workerID} is up!`);
    }
  });
}
