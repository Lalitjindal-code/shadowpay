import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      if (!process.env.UPLOADTHING_SECRET || process.env.UPLOADTHING_SECRET === 'FILL_THIS') {
        throw new Error('Uploadthing not configured');
      }
      const wallet = req.headers.get('x-wallet-address');
      if (!wallet) throw new Error('Unauthorized');
      return { walletAddress: wallet };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for user:", metadata.walletAddress);
      console.log("file url", file.url);
      return { uploadedBy: metadata.walletAddress };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
