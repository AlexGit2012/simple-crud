# Simple-crud app

### available endpoints:

- http://localhost:5000/api/users - Get and post requests (need body for post)
- http://localhost:5000/api/users/{userID} - Endpoint for get/update(put)/delete user(need body for put request)

### Few examples:

- http://localhost:5000/api/users (As post request body: { "username": "alex", "age": 23, "hobbies": ["Dancing"]})
- http://localhost:5000/api/users/73e2397f-2b34-4485-8b52-94829c2b6841 (Get user request example)
- http://localhost:5000/api/users/3f183dc0-73e3-4a9c-bd00-85c7b7e83c6b (We get id from url. User must exists. Body example - { "username": "alex", "age": 25, "hobbies": ["Dancing", "Boardgames"]})

### Scripts:

- start:dev
- start:prod
- start:multi - (it's possible to check current worker instance in console)

PS: Don't forget to "npm i"!

Thanks!
