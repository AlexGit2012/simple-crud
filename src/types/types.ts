export interface User extends UserPayload {
  id: string;
}

export interface UserPayload {
  username: string;
  age: number;
  hobbies: Array<string>;
}
