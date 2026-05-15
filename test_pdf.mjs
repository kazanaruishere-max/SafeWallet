import fs from 'fs';

async function test() {
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    console.log("PDFJS loaded successfully");
  } catch (e) {
    console.error("Failed to load PDFJS:", e.message);
  }
}

test();
