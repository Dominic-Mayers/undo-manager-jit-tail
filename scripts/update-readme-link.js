#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const README_PATH = path.join(process.cwd(), "README.md");
const PACKAGE_PATH = path.join(process.cwd(), "package.json");

const PLACEHOLDER = "__VERSION__";

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function main() {
  // Vérifications de base
  if (!fs.existsSync(README_PATH)) {
    fail("README.md not found");
  }

  if (!fs.existsSync(PACKAGE_PATH)) {
    fail("package.json not found");
  }

  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf8"));
  const version = pkg.version;

  if (!version) {
    fail("package.json has no version field");
  }

  let readme = fs.readFileSync(README_PATH, "utf8");

  const occurrences = (readme.match(new RegExp(PLACEHOLDER, "g")) || []).length;

  if (occurrences === 0) {
    fail(`No placeholder "${PLACEHOLDER}" found in README.md`);
  }

  if (occurrences > 1) {
    fail(`Multiple placeholders "${PLACEHOLDER}" found in README.md`);
  }

  const updated = readme.replace(PLACEHOLDER, version);

  fs.writeFileSync(README_PATH, updated);

  console.log(`✅ README updated with version ${version}`);
}

main();
