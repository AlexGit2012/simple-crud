import * as uuid from "uuid";
import { User } from "./types/types";
import { ServerResponse } from "http";
import {
  wrongUUIDInstanceHandler,
  wrongUserIDErrorHandler,
} from "./utils/responseErrorHandlers";

let users: User[] = [];

export const getUsers = (): User[] => users;

export const setUsers = (usersArr: User[]) => {
  users = usersArr;
};

export const addUser = (user: User) => {
  users.push(user);
};

export const findUser = (userID: string, res: ServerResponse): User | null => {
  if (!uuid.validate(userID)) {
    wrongUUIDInstanceHandler(res);
  }
  const currentUser = users.find((user) => user.id === userID);

  if (!currentUser) {
    wrongUserIDErrorHandler(res);
  }
  return currentUser;
};

export const isUser = (user: User): boolean => {
  return Boolean(
    user.username &&
      typeof user.username === "string" &&
      user.age &&
      typeof user.age === "number" &&
      user.hobbies &&
      Array.isArray(user.hobbies) &&
      user.hobbies.every((hobby) => typeof hobby === "string")
  );
};
