import { Router, Request, Response } from "express";
import { authMiddleware } from "./middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "../db";

const router = Router();

router.post("/", authMiddleware, async (req: Request, res: Response) => {
    const id = req.id;
  const body = req.body;
  const parsedData = ZapCreateSchema.safeParse(body);
  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect Inputs"
    });
    return;
  }
  const zapId = await prismaClient.$transaction(async tx => {
    const zap = await prismaClient.zap.create({
      data: {
        userId: Number(id),
        triggerId: "",
        actions: {
            create: parsedData.data.actions.map((x,ind) => ({
                actionId: x.availableActionId,
                sortingOrder: ind
            }))
        }
      }
    });
    const trigger = await tx.trigger.create({
        data: {
            triggerId: parsedData.data.availableTriggerId,
            zapId: zap.id,
        }
    });
    await tx.zap.update({
        where: {
            id: zap.id
        },
        data: {
            triggerId: trigger.id
        }
    });
    return zap.id;
  });
  res.json({
    zapId
  })
});

router.get("/", authMiddleware, async (req: Request, res: Response) => {
    const id = req.id;
    const zaps = await prismaClient.zap.findMany({
        where: {
            userId: Number(id)
        },
        include: {
            actions: {
                include: {
                    type: true
                }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    });

    res.json({
        zaps
    });
    return;
})

router.get("/:zapId", authMiddleware, async (req: Request, res: Response) => {
    const id = req.id;
    const zapId = req.params.zapId
    const zap = await prismaClient.zap.findFirst({
        where: {
            id: zapId,
            userId: Number(id)
        },
        include: {
            actions: {
                include: {
                    type: true
                }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    });

    res.json({
        zap
    });
    return;
})

export const zapRouter = router;