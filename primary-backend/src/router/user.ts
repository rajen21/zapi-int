import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
import { SIgninSchema, SIgnupSchema } from "../types";
import { prismaClient } from "../db";
import { JWT_PASSWORD } from "../config";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  
  const body = req.body;
  const parsedData = SIgnupSchema.safeParse(body);
  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect Inputs"
    });
    return;
  }
  const userExist = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username
    }
  });

  if (userExist) {
    res.status(403).json({
      message: "User already exists"
    });
    return;
  }
  await prismaClient.user.create({
    data: {
      email: parsedData.data.username,
      password: parsedData.data.password,
      name: parsedData.data.name
    }
  });

  // await sendemain();
  res.json({
    message: "Please verify your account by checking your email"
  });
})
router.post("/signin", async (req: Request, res: Response) => {
  const body = req.body;
  const parsedData = SIgninSchema.safeParse(body);
  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect Inputs"
    });
    return;
  }
  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
      password: parsedData.data.password
    }
  });

  if (!user) {
    res.status(403).json({
      message: "Sorry credentials are incorrect"
    });
    return;
  }

  const token = jwt.sign({
    id: user.id
  }, JWT_PASSWORD)
  res.json({
    token: token
  });
})

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  const id = req.id;
  const user = await prismaClient.user.findFirst({
    where: {
      id
    },
    select: {
      name: true,
      email: true
    }
  });
  res.json({
    user
  });
})

export const userRouter = router;