import { ServerResponse } from "node:http";
import { responseCreator } from "./utils";

export const wrongMethodHandler = (res: ServerResponse) => {
  responseCreator(
    res,
    { message: "Incorrect route and/or method, please check it" },
    404
  );
};

export const wrongUUIDInstanceHandler = (res: ServerResponse) => {
  responseCreator(res, { message: "userId is not valid uuid instance" }, 400);
};

export const wrongUserIDErrorHandler = (res: ServerResponse) => {
  responseCreator(res, { message: "User with this ID doesn't exist" }, 404);
};

export const wrongUserObjErrorHandler = (res: ServerResponse) => {
  responseCreator(res, { message: "Please check all required fields" }, 400);
};
