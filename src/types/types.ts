interface User extends UserPayload{
    id: string,
}

interface UserPayload {
    username: string,
    age: number,
    hobbies: Array<string>
}