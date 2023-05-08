import express, { NextFunction, Request, Response } from "express";

const router = express.Router();

router.get("/signin", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hi from login" });
});
router.post("/signup", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    res.json({ message: "Hi " + name, alert: email + " old" });
  } catch (e) {
    console.log(e);
  }
});

export default router;
