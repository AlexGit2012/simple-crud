import * as uuid from "uuid";
import { User } from "./types/types.js";
import { wrongUUIDInstanceHandler, wrongUserIDErrorHandler } from "../index.js";

let users = [];

export const getUsers = () => users;

export const setUsers = (usersArr: User[]) => {
  users = usersArr;
};

export const addUser = (user: User) => {
  users.push(user);
};

export const findUser = (userID: string, res: any) => {
  if (!uuid.validate(userID)) {
    wrongUUIDInstanceHandler(res);
  }
  const currentUser = users.find((user) => user.id === userID);

  if (!currentUser) {
    wrongUserIDErrorHandler(res);
  }
  return currentUser;
};

export const isUser = (user: User) => {
  return user.username && user.age && user.hobbies;
};
