/* eslint-disable @typescript-eslint/no-explicit-any */
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "32MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      console.log("[UploadThing] middleware hit for productImage");
      try {
        const session = await auth(req as any);
        console.log("[UploadThing] session:", session ? "found" : "null");
        if (!session) throw new Error("Unauthorized");
        return {};
      } catch (err) {
        console.error("[UploadThing] middleware error:", err);
        throw err;
      }
    })
    .onUploadComplete(async ({ file }) => {
      console.log("[UploadThing] upload complete on server:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),

  productModel: f({ blob: { maxFileSize: "1GB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      console.log("[UploadThing] middleware hit for productModel");
      try {
        const session = await auth(req as any);
        console.log("[UploadThing] session:", session ? "found" : "null");
        if (!session) throw new Error("Unauthorized");
        return {};
      } catch (err) {
        console.error("[UploadThing] middleware error:", err);
        throw err;
      }
    })
    .onUploadComplete(async ({ file }) => {
      console.log("[UploadThing] upload complete on server:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),

  receiptUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    // No auth middleware required because unauthenticated users need to upload receipts upon checkout
    .onUploadComplete(async ({ file }) => {
      console.log("[UploadThing] receipt upload complete:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
