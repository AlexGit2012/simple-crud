import { IncomingMessage, ServerResponse } from "node:http";
import { getUsers, setUsers, isUser, addUser, findUser } from "./db";
import { User } from "./types/types";
import {
  wrongUserObjErrorHandler,
  wrongMethodHandler,
} from "./utils/responseErrorHandlers";
import { isJsonString, responseCreator } from "./utils/utils";
import * as uuid from "uuid";

export const router = (
  pathname: string,
  method: string,
  req: IncomingMessage,
  res: ServerResponse,
  userID: string,
  bindSuccessResolver: (payload: User | User[], statusCode?: number) => void
) => {
  if (pathname === "/api/users" || pathname === "/api/users/") {
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
        req.on("data", (chunk: Buffer | string) => {
          data += chunk.toString();
        });
        req.on("end", () => {
          const payload = JSON.parse(isJsonString(data) ? data : "{}");
          const user: User = {
            id: uuid.v4(),
            ...payload,
          };
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
  } else if (userID) {
    switch (method) {
      case "GET": {
        const user = findUser(userID || "", res);
        if (user) {
          bindSuccessResolver(user);
        }
        break;
      }
      case "PUT": {
        let data: string = "";
        req.on("data", (chunk: Buffer | string) => {
          data += chunk.toString();
        });
        req.on("end", () => {
          const userData = JSON.parse(isJsonString(data) ? data : "{}");
          if (isUser(userData)) {
            const user = findUser(userID, res);
            if (user) {
              const newUsersArr = getUsers().map((el) => {
                if (el.id !== user.id) {
                  return el;
                } else {
                  return { ...el, ...userData };
                }
              });
              setUsers(newUsersArr);
              bindSuccessResolver(findUser(userID, res));
            }
          } else {
            wrongUserObjErrorHandler(res);
          }
        });
        break;
      }
      case "DELETE": {
        const user = findUser(userID || "", res);
        if (user) {
          const newUsersArr = getUsers().filter((el) => el.id !== userID);
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
  } else {
    wrongMethodHandler(res);
  }
};
