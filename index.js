import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";


const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
let userIsAuthorised = false;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));


function passwordCheck(req, res, next) {
  const password = req.body["procode20"];
  const name = req.body["Sameen"];

  req.userIsAuthorised = false; // Initialize to false for each request

  if (password === "procode20" && name === "Sameen") {
    req.userIsAuthorised = true;
  }
  console.log("User Is Authorised:", req.userIsAuthorised);
  next();
}

app.use(passwordCheck);


app.get("/", (req, res) => {
  res.render("index.ejs");
});


app.get("/login", (req, res) => {
  res.render(__dirname + "/views/login.ejs");
});


app.post("/submit", (req, res) => {
  if (req.userIsAuthorised) {
     res.render(__dirname + "/views/blog.ejs");
  } else {
    res.render(__dirname + "/views/index.ejs" ,
    { message: "Unauthorized access!" }
    );
  }
})



app.get("/write", (req, res) => {
  res.render(__dirname + "/views/write.ejs");
});


let submittedTitles = [];
let submittedContents = [];

app.post("/post", (req, res) => {
  let title = req.body["title"];
  let content = req.body["content"];

  if (!submittedTitles.includes(title)) {
      submittedTitles.push(title);
      submittedContents.push(content);
  }

  res.redirect("/submit");
});


app.get("/submit",(req,res)=>{
  res.render(__dirname + "/views/blog.ejs", {
    t: submittedTitles,
  });
});


app.get("/:title",(req,res)=>{
  const title = req.params.title;
  const index = submittedTitles.indexOf(title);
  if (index !== -1) {
    res.render(__dirname + "/views/blogs.ejs", {
      t: submittedTitles[index],
      c: submittedContents[index]
    });
  } else {
    res.sendFile(__dirname+"/public/error.html");
  }
});


app.delete("/:title", (req, res) => {
  const title = req.params.title;
  const index = submittedTitles.indexOf(title);
  if (index !== -1) {
    submittedTitles.splice(index, 1);
    submittedContents.splice(index, 1);
    res.redirect("/submit");
  } else {
    res.sendFile(__dirname+"/public/error.html");
  }
});

app.get("/update/:title", (req, res) => {
  const title = req.params.title;
  const index = submittedTitles.indexOf(title);
  if (index !== -1) {
    const currentTitle = submittedTitles[index];
    const currentContent = submittedContents[index];
    res.render(__dirname + "/views/edit.ejs", { title: currentTitle, content: currentContent });
  } else {
    res.sendFile(__dirname+"/public/error.html");
  }
});

app.post("/update/:title", (req, res) => {
  const originalTitle = req.params.title;
  const updatedTitle = req.body.title;
  const updatedContent = req.body.content;

  const index = submittedTitles.indexOf(originalTitle);
  if (index !== -1) {
    submittedTitles[index] = updatedTitle;
    submittedContents[index] = updatedContent;
    res.redirect("/submit");
  } else {
    res.sendFile(__dirname+"/public/error.html");
  }
});

app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + "/public/error.html");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});