"use client";

import { Cloudinary } from "next-cloudinary";

export const cloudinary = new Cloudinary({
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
});