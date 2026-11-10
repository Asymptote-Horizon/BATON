from pathlib import Path
from datetime import datetime

# Place this script in the Baton-main project root and run:
#     python script.py
#
# It creates "context v1.0.txt" beside this script.
# Actual .env files and dependency lockfiles are intentionally excluded.
# Only example environment files are included.

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "context v1.0.txt"

ROOT_FILES = [
    ".gitignore",
    "docker-compose.yml",
    "README.md",
    "run_locally.bat",
    "run_locally.ps1",
    "run_locally - Copy.txt",
]

INCLUDE_SUFFIXES = {
    ".py", ".txt", ".md", ".toml", ".ini", ".cfg",
    ".json", ".yml", ".yaml", ".tsx", ".ts", ".js",
    ".mjs", ".css", ".html", ".sql", ".sh", ".bat",
    ".ps1", ".example",
}

EXCLUDED_DIRS = {
    ".git", "node_modules", ".next", "venv", ".venv",
    "__pycache__", "dist", "build", ".pytest_cache",
}

EXCLUDED_NAMES = {
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock",
}

def should_include(path: Path) -> bool:
    if any(part in EXCLUDED_DIRS for part in path.parts):
        return False
    if path.name in EXCLUDED_NAMES:
        return False
    # Never include real environment files or likely secret-bearing files.
    if path.name == ".env":
        return False
    if path.name.startswith(".env.") and path.name != ".env.example":
        return False
    return path.suffix.lower() in INCLUDE_SUFFIXES or path.name == ".env.example"

def collect_files():
    selected = set()

    for relative in ROOT_FILES:
        path = ROOT / relative
        if path.is_file():
            selected.add(path)

    for folder_name in ("backend", "frontend"):
        folder = ROOT / folder_name
        if folder.exists():
            for path in folder.rglob("*"):
                if path.is_file() and should_include(path.relative_to(ROOT)):
                    selected.add(path)

    return sorted(selected, key=lambda p: p.relative_to(ROOT).as_posix().lower())

def main():
    files = collect_files()
    sections = [
        "BATON PROJECT CONTEXT — VERSION 1.0",
        f"Project root: {ROOT}",
        f"Generated: {datetime.now().astimezone().isoformat(timespec='seconds')}",
        f"Files included: {len(files)}",
        "",
        "NOTE: Real .env files and dependency lockfiles are excluded intentionally.",
        "Review this file for secrets before sharing it.",
        "",
        "=" * 100,
        "PROJECT FILE CONTENTS",
        "=" * 100,
        "",
    ]

    for index, path in enumerate(files, start=1):
        relative = path.relative_to(ROOT).as_posix()
        sections.extend([
            "",
            "#" * 100,
            f"FILE {index}: {relative}",
            f"ABSOLUTE PATH: {path}",
            "#" * 100,
            "",
        ])

        try:
            content = path.read_text(encoding="utf-8-sig", errors="replace")
            sections.append(content)
        except Exception as exc:
            sections.append(f"[Could not read this file: {exc}]")

        sections.append("\n")

    OUTPUT.write_text("\n".join(sections), encoding="utf-8")
    print(f"Done. Included {len(files)} files.")
    print(f"Context file created at:\n{OUTPUT}")

if __name__ == "__main__":
    main()
