import { Router } from "express";
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    res.status(200).json({
      statusCode: 1150690,
      advice: "You are far away from home.",
      MEWO: "Meow? (Waiting for something to happen?)",
      KEL: "Curses! We've been bamboozled!",
      AUBREY:
        "Just because you did something bad, doesn't make you a bad person.",
      MARI: "It all makes the vast emptiness of space a little more bearable, don't you think?",
      HERO: "Alright everyone... It's time to go on an adventure!",
      BASIL: "I'll protect you no matter what. You can count on me!",
      OMORI: "Omori did not succumb.",
    });
  } catch {
    next(error);
  }
});

export default router;
