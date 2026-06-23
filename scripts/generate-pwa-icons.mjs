import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "icons");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL before running this script.");
  process.exit(1);
}

const sourceUrl = `${supabaseUrl}/storage/v1/object/public/RestaurantAI/misc/ai_icon.png`;

async function resize(input, size, outputName) {
  const buffer = await sharp(input).resize(size, size, { fit: "contain", background: "#ffffff" }).png().toBuffer();
  await writeFile(path.join(outDir, outputName), buffer);
  console.log(`  ${outputName}`);
}

async function maskable(input, size, outputName) {
  const padding = Math.round(size * 0.1);
  const inner = size - padding * 2;
  const buffer = await sharp(input)
    .resize(inner, inner, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();
  await writeFile(path.join(outDir, outputName), buffer);
  console.log(`  ${outputName}`);
}

console.log(`Downloading ${sourceUrl}`);
const res = await fetch(sourceUrl);
if (!res.ok) {
  console.error(`Failed to download icon: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const source = Buffer.from(await res.arrayBuffer());

await mkdir(outDir, { recursive: true });
console.log("Generating icons:");
await resize(source, 192, "icon-192x192.png");
await resize(source, 512, "icon-512x512.png");
await resize(source, 180, "apple-touch-icon.png");
await maskable(source, 512, "maskable-icon-512x512.png");
console.log("Done.");
