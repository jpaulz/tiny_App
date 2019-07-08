const http = require("http"); //HTTP
// const express = require("express");
// const app = express();
const PORT = 8080;

// HTTP
// a function which handles requests and sends response
const requestHandler = function(request, response) {
//   console.log('In requestHandler'); // NEW LINE
//   response.end(`Requested Path: ${request.url}\nRequest Method: ${request.method}`);
// };
  if (request.url === "/") {
    response.end("Welcome!");
  } else if (request.url === "/urls") {
    response.end("www.lighthouselabs.ca\nwww.google.com");
  } else {
    response.statusCode = 404;
    response.end("404 Page Not Found");
  }
};
const server = http.createServer(requestHandler);
// console.log('Server created'); // NEW LINE


// //Get  home page
// app.get('/', (req, res) => { //Express
//   res.send('Welcome');
// });


server.listen(PORT, () => {  //change to app. for Express
  console.log(`Server listening on: http://localhost:${PORT}`);
});

console.log('Last line (after .listen call)'); // NEW LINE

