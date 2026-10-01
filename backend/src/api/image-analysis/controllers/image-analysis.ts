import { Context } from "koa";
import { analyzeImage } from "../services/gemini";

export default {
  async analyze(ctx: Context) {
    try {
      const files = ctx.request.files as any;
      const file = files?.image;

      if (!file) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: "No image file provided",
        };
        return;
      }

      const filePath = file.filepath || file.path;

      if (!filePath) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: "Image file path not found",
        };
        return;
      }

      const result = await analyzeImage(
        filePath,
        file.mimetype || "image/jpeg"
      );

      ctx.status = 200;
      ctx.body = result;
    } catch (error: any) {
      const message = error?.message || "Unknown error";
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: "Image analysis failed",
        details: message,
      };
    }
  },
};