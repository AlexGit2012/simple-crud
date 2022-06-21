# Simple-crud app
### available endpoints:
- http://localhost:3000/api/users - get and post request(need body for post)
- http://localhost:3000/api/users?id=userID - get/put/delete user(need body for put and query for get and delete)

### Few examples:
- http://localhost:3000/api/users  (as post request body: { "username": "alex", "age": 23, "hobbies": []})
- http://localhost:3000/api/users/?id=73e2397f-2b34-4485-8b52-94829c2b6841 (get user example)
- http://localhost:3000/api/users/ (Usually we use body for put, not query. Example - {"id": "3f183dc0-73e3-4a9c-bd00-85c7b7e83c6b", "username": "anton", "age": 25, "hobbies": ["DANCING"]})

### Scripts:
- start:dev
- start:prod
- start:multi

Thanks!
