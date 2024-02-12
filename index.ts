import { IncomingMessage, ServerResponse, createServer } from "http";
import { parse } from "url";
import { User } from "./src/types/types.js";
import "dotenv/config";
import cluster from "cluster";
import { cpus } from "os";
import { getUsers, setUsers } from "./src/db";
import process from "node:process";
import { responseCreator, successResolver } from "./src/utils/utils";
import { router } from "./src/router";

const mode = process.env.NODE_ENV;
const port = process.env.PORT || 5001;

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

      router(pathname, method, req, res, userID, bindSuccessResolver);
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
  const { worker: { id: workerID = 0 } = {} } = cluster || {};

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
