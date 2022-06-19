const http = require("http");
const port = process?.env?.PORT ? +process.env.PORT : 3000;

const server = http.createServer(async (req: any, res: any) => {
  console.log(`Server started on port ${port}`);
});
server.listen(port, "localhost", (error: any) => {
  if (error) {
    console.log(error);
  }
});
