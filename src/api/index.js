import express from "express";
import { router as auth } from "./auth/auth.routes.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", (req,res)=>{
  console.log('🌎 test api log ')
  res.send('Hello world 🌎 ' )
});

app.use("/auth", auth);

app.use("/test", (req,res)=>{
  console.log('🌎 test api log ')
  res.status(200).json({message :'🌎 test api response ' })
});


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 listening on port ${PORT}`);
});
