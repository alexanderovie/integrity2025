import { structureTool } from "sanity/structure";
import { defineConfig } from "sanity";
import { postSchema } from "./src/sanity/schema/post";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "";

export default defineConfig({
  name: "default",
  title: "Integrity Clean Solutions Studio",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: [postSchema],
  },
});
