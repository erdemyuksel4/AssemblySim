#!/usr/bin/env python3
"""
extract_course_materials.py
----------------------------
Zero-loss extraction pipeline for the 21 Microprocessor course documents
(5 PPTX files, 16 PDF files).

Extracts text, slide titles, shapes, native tables (as Markdown), speaker notes,
and PDF text blocks into clean UTF-8 Markdown files in docs/extracted_raw/.

Dependencies:
  - python-pptx (pptx)
  - pymupdf (fitz) or pypdf as fallback
"""

import os
import sys
from pathlib import Path

# Ensure stdout handles UTF-8 even on Windows console
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    from pptx import Presentation
except ImportError:
    Presentation = None

try:
    import pymupdf
except ImportError:
    pymupdf = None

try:
    import pypdf
except ImportError:
    pypdf = None


def normalize_text(text: str) -> str:
    """Normalize typographic ligatures and control characters."""
    if not text:
        return ""
    replacements = {
        "\ufb00": "ff",
        "\ufb01": "fi",
        "\ufb02": "fl",
        "\ufb03": "ffi",
        "\ufb04": "ffl",
        "\u2013": "–",
        "\u2014": "—",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\xa0": " ",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def clean_cell_text(text: str) -> str:
    """Sanitize cell text for markdown table inclusion."""
    normalized = normalize_text(text)
    # Escape pipe characters and flatten newlines
    escaped = normalized.replace("|", "\\|").replace("\r\n", " ").replace("\n", " ").strip()
    return escaped if escaped else " "


def extract_shape_recursive(shape, output_lines):
    """Recursively extract text, tables, and grouped shapes from a PPTX shape."""
    # Table extraction
    if shape.has_table:
        table = shape.table
        col_count = len(table.columns)
        if len(table.rows) > 0 and col_count > 0:
            header_cells = [
                clean_cell_text(cell.text)
                for cell in table.rows[0].cells
            ]
            output_lines.append("\n| " + " | ".join(header_cells) + " |")
            output_lines.append("| " + " | ".join(["---"] * col_count) + " |")
            for r_idx in range(1, len(table.rows)):
                row_cells = [
                    clean_cell_text(cell.text)
                    for cell in table.rows[r_idx].cells
                ]
                output_lines.append("| " + " | ".join(row_cells) + " |")
            output_lines.append("")
        return

    # Group shapes (shape_type == 6)
    if shape.shape_type == 6 and hasattr(shape, "shapes"):
        for sub_shape in shape.shapes:
            extract_shape_recursive(sub_shape, output_lines)
        return

    # Text frame
    if shape.has_text_frame:
        text = shape.text_frame.text.strip()
        if text:
            output_lines.append(normalize_text(text) + "\n")


def extract_pptx_to_markdown(pptx_path: Path) -> str:
    """Extract all slides, shapes, tables, and speaker notes from a PPTX file."""
    if Presentation is None:
        raise RuntimeError("python-pptx is not installed.")

    prs = Presentation(str(pptx_path))
    lines = []
    lines.append(f"# {pptx_path.stem}\n")
    lines.append(f"**Source File**: `{pptx_path.name}`\n")
    lines.append(f"**Total Slides**: {len(prs.slides)}\n")
    lines.append("---\n")

    for idx, slide in enumerate(prs.slides, start=1):
        lines.append(f"## Slide {idx}\n")

        for shape in slide.shapes:
            extract_shape_recursive(shape, lines)

        # Slide Speaker Notes
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            notes = slide.notes_slide.notes_text_frame.text.strip()
            if notes:
                lines.append(f"\n> **Speaker Notes (Slide {idx})**:\n> " + notes.replace("\n", "\n> ") + "\n")

        lines.append("\n---\n")

    return "\n".join(lines)


def extract_pdf_to_markdown(pdf_path: Path) -> str:
    """Extract text from PDF pages using PyMuPDF (or pypdf fallback)."""
    lines = []
    lines.append(f"# {pdf_path.stem}\n")
    lines.append(f"**Source File**: `{pdf_path.name}`\n")

    if pymupdf is not None:
        doc = pymupdf.open(str(pdf_path))
        lines.append(f"**Total Pages**: {len(doc)}\n")
        lines.append("---\n")
        for idx, page in enumerate(doc, start=1):
            lines.append(f"## Page {idx}\n")
            text = page.get_text("text")
            if text and text.strip():
                lines.append(normalize_text(text.strip()) + "\n")
            else:
                # Page might be an image
                img_list = page.get_images()
                if img_list:
                    lines.append(f"*[Page {idx} contains {len(img_list)} diagram/image(s) without embedded text]*\n")
                else:
                    lines.append(f"*[Page {idx} empty]*\n")
            lines.append("\n---\n")
    elif pypdf is not None:
        reader = pypdf.PdfReader(str(pdf_path))
        lines.append(f"**Total Pages**: {len(reader.pages)}\n")
        lines.append("---\n")
        for idx, page in enumerate(reader.pages, start=1):
            lines.append(f"## Page {idx}\n")
            text = page.extract_text()
            if text and text.strip():
                lines.append(normalize_text(text.strip()) + "\n")
            else:
                lines.append(f"*[Page {idx} contains diagram/image without embedded text]*\n")
            lines.append("\n---\n")
    else:
        raise RuntimeError("Neither pymupdf nor pypdf is installed.")

    return "\n".join(lines)


def run_pipeline(source_root: Path, output_root: Path):
    """Run full extraction for all 21 course files."""
    pptx_out = output_root / "pptx"
    pdf_out = output_root / "pdf"
    pptx_out.mkdir(parents=True, exist_ok=True)
    pdf_out.mkdir(parents=True, exist_ok=True)

    manifest = []

    print(f"Scanning source directory: {source_root}")
    # PPTX files
    pptx_files = sorted(list(source_root.glob("**/*.pptx")))
    print(f"Found {len(pptx_files)} PPTX files.")
    for p in pptx_files:
        safe_stem = p.stem.replace(" ", "_")
        out_file = pptx_out / f"{safe_stem}.md"
        print(f"Extracting PPTX: {p.name} -> {out_file.name} ...")
        md_content = extract_pptx_to_markdown(p)
        out_file.write_text(md_content, encoding="utf-8")
        manifest.append({
            "type": "PPTX",
            "name": p.name,
            "out": str(out_file.relative_to(output_root)).replace("\\", "/"),
            "chars": len(md_content)
        })

    # PDF files (search all subdirectories)
    pdf_files = sorted(list(source_root.glob("**/*.pdf")))
    print(f"Found {len(pdf_files)} PDF files.")
    for p in pdf_files:
        safe_stem = p.stem.replace(" ", "_")
        out_file = pdf_out / f"{safe_stem}.md"
        print(f"Extracting PDF: {p.name} -> {out_file.name} ...")
        md_content = extract_pdf_to_markdown(p)
        out_file.write_text(md_content, encoding="utf-8")
        manifest.append({
            "type": "PDF",
            "name": p.name,
            "out": str(out_file.relative_to(output_root)).replace("\\", "/"),
            "chars": len(md_content)
        })

    total_chars = sum(item["chars"] for item in manifest)

    # Write INDEX.md
    index_lines = [
        "# Raw Extracted Documents Index\n",
        f"Total extracted documents: {len(manifest)} (5 PPTX, 16 PDF)\n",
        f"**Total Extracted Characters**: {total_chars:,}\n\n",
        "| Type | Source File | Extracted Markdown | Character Count |",
        "| --- | --- | --- | --- |"
    ]
    for item in manifest:
        index_lines.append(f"| {item['type']} | {item['name']} | [{item['out']}]({item['out']}) | {item['chars']:,} |")

    index_lines.append(f"\n**Grand Total**: {len(manifest)} files, {total_chars:,} characters.\n")

    index_path = output_root / "INDEX.md"
    index_path.write_text("\n".join(index_lines), encoding="utf-8")
    print(f"\nExtraction complete! Total {len(manifest)} files, {total_chars:,} chars.")
    print(f"Index written to: {index_path}")


if __name__ == "__main__":
    src = Path(r"c:\Users\erdem\Desktop\Dersler\Microprocessor")
    dst = Path(r"c:\Users\erdem\Desktop\AktifProjeler\AssemblySim\docs\extracted_raw")
    if len(sys.argv) > 1:
        src = Path(sys.argv[1])
    if len(sys.argv) > 2:
        dst = Path(sys.argv[2])
    run_pipeline(src, dst)
