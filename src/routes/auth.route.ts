import express from "express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";

const router = express.Router();

// Route untuk memeriksa apakah sesi aktif
router.get("/sessioninfo", verifySession(), (req: any, res) => {
  const session = req.session!;
  res.json({
    userId: session.getUserId(),
    sessionData: session.getAccessTokenPayload(),
  });
});

export default router;
