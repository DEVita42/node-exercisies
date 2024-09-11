var figlet = require("figlet");

figlet("ciao", function (data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
});