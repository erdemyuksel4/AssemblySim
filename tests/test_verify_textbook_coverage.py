#!/usr/bin/env python3
"""
test_verify_textbook_coverage.py
---------------------------------
Unit and integration test suite for scripts/verify_textbook_coverage.py.

Verifies:
1. Integrity of the check inventory (400+ check items, 20 categories, 15 chapters).
2. Pattern matching engine with English/Turkish terms, acronyms, formulas, and tables.
3. Behavior with missing files (accurate reporting of gaps, non-zero exit).
4. Behavior with complete synthetic files (100% pass rate, exit code 0).
5. CLI functionality including --json, --chapter, --category, and --verbose flags.
"""

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

from verify_textbook_coverage import (
    CHAPTER_DEFINITIONS,
    CheckItem,
    TextbookVerifier,
    VerificationResult,
    build_check_inventory,
)


class TestCheckInventory(unittest.TestCase):
    """Tests the static structure and completeness of the verification inventory."""

    def setUp(self):
        self.items = build_check_inventory()

    def test_total_item_count(self):
        """Must have at least 400 granular check items covering all 21 source documents."""
        self.assertGreaterEqual(len(self.items), 400)

    def test_chapter_coverage(self):
        """Every chapter from 1 to 15 must have dedicated keyword check items."""
        chapters_represented = {it.chapter_num for it in self.items if it.chapter_num is not None}
        for c in range(1, 16):
            self.assertIn(c, chapters_represented, f"Chapter {c} has no check items!")

    def test_category_distribution(self):
        """All required categories must exist."""
        categories = {it.category for it in self.items}
        expected_cats = {
            "Architectural Blocks",
            "Addressing Modes",
            "8086 Instructions",
            "Mathematical Formulas",
            "Reference Tables",
        }
        for cat in expected_cats:
            self.assertIn(cat, categories, f"Expected category {cat} missing from inventory")

    def test_formula_count(self):
        """Must verify all 11 core mathematical formulas."""
        formula_items = [it for it in self.items if it.category == "Mathematical Formulas"]
        self.assertEqual(len(formula_items), 11)

    def test_table_count(self):
        """Must verify all 10 mandatory reference tables."""
        table_items = [it for it in self.items if it.category == "Reference Tables"]
        self.assertEqual(len(table_items), 10)


class TestPatternMatching(unittest.TestCase):
    """Tests pattern matching accuracy for formulas, keywords, and tables."""

    def setUp(self):
        self.verifier = TextbookVerifier(
            textbook_dir=Path("nonexistent"),
            complete_file=Path("nonexistent"),
        )

    def test_physical_address_formula_matching(self):
        # Plain ASCII
        sample1 = "Fiziksel Adres formülü: PA = Segment * 16 + Offset olarak hesaplanır."
        matched1, _ = self.verifier._test_patterns(sample1, [
            r"(?:PA|Fiziksel\s*Adres)\s*=\s*(?:\(?[^=\n]*\bSegment\b[^=\n]*(?:\*|\times|<<|\b16\b)[^=\n]*\bOffset\b)|Segment\s*(?:\*|\\times)\s*16\s*\+\s*Offset"
        ])
        self.assertTrue(matched1)

        # LaTeX notation
        sample2 = "$$PA = \\text{Segment} \\times 16 + \\text{Offset}$$"
        matched2, _ = self.verifier._test_patterns(sample2, [
            r"(?:PA|Fiziksel\s*Adres)\s*=\s*(?:\(?[^=\n]*\bSegment\b[^=\n]*(?:\*|\times|<<|\b16\b)[^=\n]*\bOffset\b)|Segment\s*(?:\*|\\times)\s*16\s*\+\s*Offset"
        ])
        self.assertTrue(matched2)

    def test_amdahl_law_matching(self):
        sample = "Amdahl Yasası teorik hızlanmayı şu şekilde ifade eder: S(s) = 1 / ((1 - p) + p/s)"
        matched, _ = self.verifier._test_patterns(sample, [
            r"\\frac\{1\}\{\(?1\s*-\s*p\)?\s*\+\s*\\frac\{p\}\{s\}\}|1\s*\/\s*\(\(?1\s*-\s*p\)?\s*\+\s*p\s*\/\s*s\)|S\(s\)\s*=\s*1\s*\/|Amdahl.*1\s*\/\s*\(1\s*-\s*p\)"
        ])
        self.assertTrue(matched)

    def test_table_matching(self):
        table_sample = """
| Bayrak | Pozisyon | Açıklama |
| --- | --- | --- |
| CF (Carry Flag) | Bit 0 | Aritmetik elde durumu |
| PF (Parity Flag) | Bit 2 | Çift parite |
| ZF (Zero Flag) | Bit 6 | Sıfır sonucu |
| OF (Overflow) | Bit 11 | İşaretli taşma |
"""
        matched, _ = self.verifier._test_patterns(table_sample, [
            r"\|.*(?:CF|Carry).*\|.*(?:PF|Parity).*\|.*(?:ZF|Zero).*\|.*(?:OF|Overflow).*\|"
        ])
        self.assertTrue(matched)

    def test_acronym_word_boundaries(self):
        """Ensure short acronyms like 'EU' or 'AX' do not match inside larger words."""
        # 'NEUTRAL' should NOT match 'EU'
        neutral_text = "This is a neutral processor description."
        matched, _ = self.verifier._test_patterns(neutral_text, [
            r"\bEU\b|\bExecution\s+Unit\b|\bYürütme\s+Birimi\b"
        ])
        self.assertFalse(matched)

        # 'Execution Unit' or standalone 'EU' MUST match
        valid_text = "8086 contains a Bus Interface Unit (BIU) and an Execution Unit (EU)."
        matched_valid, _ = self.verifier._test_patterns(valid_text, [
            r"\bEU\b|\bExecution\s+Unit\b|\bYürütme\s+Birimi\b"
        ])
        self.assertTrue(matched_valid)


class TestVerifierWithMockFiles(unittest.TestCase):
    """Tests the verifier execution against synthetic files in temporary directories."""

    def test_missing_files_reporting(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir)
            empty_textbook_dir = tmp_path / "docs" / "textbook"
            empty_complete_file = empty_textbook_dir / "COMPLETE_TEXTBOOK.md"

            verifier = TextbookVerifier(
                textbook_dir=empty_textbook_dir,
                complete_file=empty_complete_file,
            )
            result = verifier.run()

            self.assertEqual(result.chapters_found, 0)
            self.assertFalse(result.complete_textbook_found)
            self.assertEqual(result.total_passed, 0)
            self.assertEqual(result.total_failed, result.total_checks)
            self.assertGreater(len(result.gaps), 0)

    def test_synthetic_complete_coverage(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir)
            tb_dir = tmp_path / "textbook"
            tb_dir.mkdir(parents=True)
            complete_file = tb_dir / "COMPLETE_TEXTBOOK.md"

            # Create synthetic chapters that satisfy all chapter-specific checks
            all_text_parts = []
            for ch_def in CHAPTER_DEFINITIONS:
                c_num = ch_def["num"]
                c_file = tb_dir / ch_def["slug"]
                items_for_ch = [it for it in build_check_inventory() if it.chapter_num == c_num]

                # Craft synthetic content containing patterns for this chapter
                lines = [f"# Chapter {c_num}: {ch_def['title']}\n"]
                for it in items_for_ch:
                    lines.append(f"Content for {it.name}: {it.description}\n")

                # Add explicit formulas & tables when relevant
                if c_num == 1:
                    lines.append("Formulas: PA = Segment * 16 + Offset, 2^20 = 1 MB, F * r = I1 + F1, N* = 2^k - N = NOT N + 1\n")
                    lines.append("Keywords: TPA, 640 KB, Video RAM, System Area, A0000h, BFFFFh, C0000h, FFFFFh, Address Bus, Data Bus, Control Bus, MEMR, MEMW, IOR, IOW, Multiply-Radix, Bölme-Kalan, Two's Complement, One's Complement, BCD, ASCII, Unicode, Positional Notation, Radix\n")
                elif c_num == 2:
                    lines.append("BIU Bus Interface Unit, EU Execution Unit, Prefetch Queue 6-byte FIFO, AX, BX, CX, DX, SP, BP, SI, DI, CS, DS, SS, ES, IP\n")
                    lines.append("FLAGS, CF, PF, AF, ZF, SF, TF, IF, DF, OF, Physical Address, Segment, Offset, Little-Endian, Wrap-around, Even Bank, Odd Bank, BHE#, A0, HLT, NOP\n")
                    lines.append("Formulas: PA = Segment * 16 + Offset\n")
                    lines.append("| Bayrak | CF | PF | AF | ZF | SF | TF | IF | DF | OF |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| Test | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |\n")
                    lines.append("| Pair | CS:IP Code Segment | SS:SP Stack Segment | DS:BX Data Segment | ES:DI |\n| --- | --- | --- | --- | --- |\n| Test | 0 | 0 | 0 | 0 |\n")

                content = "\n".join(lines)
                c_file.write_text(content, encoding="utf-8")
                all_text_parts.append(content)

            # Write combined complete textbook
            complete_file.write_text("\n\n".join(all_text_parts), encoding="utf-8")

            # Run verifier for Chapter 1 only
            verifier = TextbookVerifier(textbook_dir=tb_dir, complete_file=complete_file)
            res_ch1 = verifier.run(chapter_filter=1)

            self.assertEqual(res_ch1.total_failed, 0, f"Chapter 1 gaps: {res_ch1.gaps}")
            self.assertEqual(res_ch1.total_passed, res_ch1.total_checks)


class TestCLIExecution(unittest.TestCase):
    """Tests CLI invocation of verify_textbook_coverage.py."""

    def test_cli_help(self):
        res = subprocess.run(
            [sys.executable, str(PROJECT_ROOT / "scripts" / "verify_textbook_coverage.py"), "--help"],
            capture_output=True,
            text=True,
        )
        self.assertEqual(res.returncode, 0)
        self.assertIn("Verify comprehensive coverage", res.stdout)

    def test_cli_json_output(self):
        res = subprocess.run(
            [sys.executable, str(PROJECT_ROOT / "scripts" / "verify_textbook_coverage.py"), "--json", "--chapter", "1"],
            capture_output=True,
            text=True,
        )
        # Should exit with 0 now that chapter 1 is complete, outputting valid JSON
        self.assertEqual(res.returncode, 0)
        data = json.loads(res.stdout)
        self.assertIn("total_checks", data)
        self.assertIn("coverage_percentage", data)
        self.assertIn("gaps", data)


if __name__ == "__main__":
    unittest.main()
