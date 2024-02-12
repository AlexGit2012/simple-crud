import { ServerResponse } from "http";
import { User } from "../types/types";
import { getUsers } from "../db";
import process from "node:process";

const mode = process.env.NODE_ENV;

export const successResolver = (
  res: ServerResponse,
  payload: User | User[],
  statusCode: number
) => {
  responseCreator(res, payload, statusCode);
};

export const responseCreator = (
  res: ServerResponse,
  payload: User | User[] | { message: string },
  statusCode: number
) => {
  // Trigger sync database for all workers
  if (mode === "multi") {
    process.send({ users: getUsers() });
  }

  if (!res.writableEnded) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(statusCode);
    res.end(JSON.stringify(payload));
  }
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
