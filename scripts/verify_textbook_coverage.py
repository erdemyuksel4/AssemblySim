#!/usr/bin/env python3
"""
verify_textbook_coverage.py
----------------------------
Comprehensive Zero-Loss Coverage Verification Suite for the AssemblySim
Microprocessors Academic Textbook (docs/textbook/).

Verifies that all concepts, architectural blocks, 8086 instructions,
addressing modes, mathematical formulas, and reference tables extracted
from all 21 source documents (5 PPTX presentations, 16 PDF files)
are covered across the 15 individual chapter files and COMPLETE_TEXTBOOK.md.

Usage:
    python scripts/verify_textbook_coverage.py [OPTIONS]

Options:
    --textbook-dir PATH       Path to docs/textbook directory (default: docs/textbook)
    --complete-file PATH      Path to COMPLETE_TEXTBOOK.md (default: docs/textbook/COMPLETE_TEXTBOOK.md)
    --category CAT            Filter verification by category name
    --chapter NUM             Filter verification by chapter number (1-15)
    --verbose, -v             Show all passing items as well as gaps
    --json                    Output results as JSON for CI/CD integration
    --help, -h                Show this help message and exit

Exit Codes:
    0 = All coverage criteria satisfied (100% complete)
    1 = Coverage gaps detected or required files missing
"""

import argparse
import json
import os
import re
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Pattern, Set, Tuple

# Ensure stdout handles UTF-8 on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Terminal ANSI colors (automatically disabled if stdout is not a TTY)
USE_COLOR = sys.stdout.isatty() and os.name != "dumb"


def colorize(text: str, color_code: str) -> str:
    if not USE_COLOR:
        return text
    return f"\033[{color_code}m{text}\033[0m"


def green(text: str) -> str:
    return colorize(text, "32")


def red(text: str) -> str:
    return colorize(text, "31")


def yellow(text: str) -> str:
    return colorize(text, "33")


def blue(text: str) -> str:
    return colorize(text, "34")


def cyan(text: str) -> str:
    return colorize(text, "36")


def bold(text: str) -> str:
    return colorize(text, "1")


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

@dataclass
class CheckItem:
    category: str
    name: str
    description: str
    patterns: List[str]  # Regex patterns (case-insensitive unless specified)
    chapter_num: Optional[int] = None
    required_in_complete: bool = True
    found_in_chapter: bool = False
    found_in_complete: bool = False
    matched_file: Optional[str] = None
    snippet: Optional[str] = None

    @property
    def passed(self) -> bool:
        if self.chapter_num is not None:
            return self.found_in_chapter and (self.found_in_complete if self.required_in_complete else True)
        return self.found_in_complete


@dataclass
class CategorySummary:
    name: str
    total: int = 0
    passed: int = 0
    failed: int = 0

    @property
    def pct(self) -> float:
        return (self.passed / self.total * 100.0) if self.total > 0 else 0.0


@dataclass
class VerificationResult:
    total_checks: int = 0
    total_passed: int = 0
    total_failed: int = 0
    chapters_found: int = 0
    chapters_expected: int = 15
    complete_textbook_found: bool = False
    complete_textbook_size: int = 0
    categories: Dict[str, CategorySummary] = field(default_factory=dict)
    gaps: List[Dict[str, str]] = field(default_factory=list)
    passing_items: List[Dict[str, str]] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Chapter Definitions (15 Chapters)
# ---------------------------------------------------------------------------

CHAPTER_DEFINITIONS = [
    {
        "num": 1,
        "prefix": "ch01",
        "slug": "ch01_giris_ve_sayi_sistemleri.md",
        "title": "Bölüm 1: Giriş, Bilgisayar Mimarisi ve Sayı Sistemleri",
        "sources": ["Week 1 PPTX", "w1.pdf", "BMI3121 Syllabus (Week 1)"],
    },
    {
        "num": 2,
        "prefix": "ch02",
        "slug": "ch02_8086_mimarisi_ve_segmentasyon.md",
        "title": "Bölüm 2: 8086 Donanım Mimarisi, Yazmaçlar ve Segmentasyon",
        "sources": ["Week 2 PPTX", "w2.pdf", "w5.pdf"],
    },
    {
        "num": 3,
        "prefix": "ch03",
        "slug": "ch03_adresleme_modlari.md",
        "title": "Bölüm 3: 8086 Adresleme Modları ve Makine Kodu Formatı",
        "sources": ["Week 3 PPTX", "w3.pdf", "w3extra.pdf", "w4.pdf"],
    },
    {
        "num": 4,
        "prefix": "ch04",
        "slug": "ch04_veri_aktarimi_ve_yigin.md",
        "title": "Bölüm 4: Veri Aktarım Komutları, Yığın Mimarisi ve İşaretçiler",
        "sources": ["Week 4 PPTX", "w4.pdf", "MicroProcessor code examples"],
    },
    {
        "num": 5,
        "prefix": "ch05",
        "slug": "ch05_aritmetik_islemler.md",
        "title": "Bölüm 5: Aritmetik Komutlar, BCD/ASCII Aritmetiği ve Bayraklar",
        "sources": ["Week 5 PPTX", "w10.pdf", "w11.pdf", "code examples"],
    },
    {
        "num": 6,
        "prefix": "ch06",
        "slug": "ch06_mantik_ve_bit_kaydirma.md",
        "title": "Bölüm 6: Mantıksal İşlemler, Maskeleme ve Bit Kaydırma/Döndürme",
        "sources": ["Week 5 PPTX", "w10.pdf", "code examples"],
    },
    {
        "num": 7,
        "prefix": "ch07",
        "slug": "ch07_akis_kontrolu_ve_prosedurler.md",
        "title": "Bölüm 7: Program Akış Kontrolü, Koşullu Sıçramalar ve Prosedürler",
        "sources": ["Week 3 PPTX", "w3.pdf", "w6.pdf", "code examples"],
    },
    {
        "num": 8,
        "prefix": "ch08",
        "slug": "ch08_diziler_ve_tablo_islemleri.md",
        "title": "Bölüm 8: Dizi ve String İşlemleri, Blok Bellek Transferi ve XLAT",
        "sources": ["Week 4 PPTX", "code examples"],
    },
    {
        "num": 9,
        "prefix": "ch09",
        "slug": "ch09_giris_cikis_ve_8255_ppi.md",
        "title": "Bölüm 9: Giriş/Çıkış (G/Ç) Sistemleri, Portlar ve 8255 PPI",
        "sources": ["w6.pdf", "Week 4 PPTX", "Syllabus (Week 7)"],
    },
    {
        "num": 10,
        "prefix": "ch10",
        "slug": "ch10_kesmeler_ve_ivt_mimarisi.md",
        "title": "Bölüm 10: Kesmeler, Kesme Vektör Tablosu (IVT) ve İstisnalar",
        "sources": ["w12a.pdf", "Syllabus (Week 6)", "code examples"],
    },
    {
        "num": 11,
        "prefix": "ch11",
        "slug": "ch11_dma_ve_isletim_sistemi_destegi.md",
        "title": "Bölüm 11: Doğrudan Bellek Erişimi (DMA) ve İşletim Sistemi Desteği",
        "sources": ["w9.pdf", "Syllabus (Week 9)", "code examples"],
    },
    {
        "num": 12,
        "prefix": "ch12",
        "slug": "ch12_komut_boru_hatti_ve_tehlikeler.md",
        "title": "Bölüm 12: Komut Boru Hattı (Pipelining) ve Tehlikeler (Hazards)",
        "sources": ["w13a.pdf", "Syllabus (Week 12, 15)", "code examples"],
    },
    {
        "num": 13,
        "prefix": "ch13",
        "slug": "ch13_bellek_hiyerarsisi_ve_onbellek.md",
        "title": "Bölüm 13: Bellek Hiyerarşisi, Önbellek Mimarisi ve Yerellik İlkesi",
        "sources": ["w14a.pdf", "Syllabus (Week 14)"],
    },
    {
        "num": 14,
        "prefix": "ch14",
        "slug": "ch14_makrolar_ve_8085_karsilastirmasi.md",
        "title": "Bölüm 14: Assembly Makroları ve Intel 8085 vs. 8086 Karşılaştırması",
        "sources": ["Syllabus (Week 13, 14)", "w5.pdf"],
    },
    {
        "num": 15,
        "prefix": "ch15",
        "slug": "ch15_paralel_isleme_ve_risc_cisc.md",
        "title": "Bölüm 15: Paralel İşleme, Çok Çekirdekli Mimariler ve RISC vs. CISC",
        "sources": ["w15a.pdf", "w4.pdf", "w5.pdf", "Syllabus (Week 15)"],
    },
]


# ---------------------------------------------------------------------------
# Verification Specifications Dictionary
# ---------------------------------------------------------------------------

def build_check_inventory() -> List[CheckItem]:
    """Constructs the comprehensive list of required items across all categories."""
    items: List[CheckItem] = []

    # =======================================================================
    # Category 1: Chapter Mandatory Keywords (15 Chapters)
    # =======================================================================

    # Ch 01
    ch1_keywords = [
        ("TPA", r"\bTPA\b|\bTransient\s+Program\s+Area\b", "Geçici Program Alanı (TPA)"),
        ("640 KB", r"640\s*(?:KB|kilo\s*bytes?)", "Klasik DOS TPA bellek sınırı (640 KB)"),
        ("Video RAM", r"\bVideo\s+RAM\b|\bVRAM\b", "Video Bellek alanı (A0000h - BFFFFh)"),
        ("System Area", r"\bSystem\s+Area\b|\bSistem\s+Alanı\b|\bSystem\s+ROM\b|\bBIOS\b", "Sistem ROM/BIOS Alanı"),
        ("A0000h", r"\bA0000h\b|\b0xA0000\b", "VRAM Başlangıç Fiziksel Adresi A0000h"),
        ("BFFFFh", r"\bBFFFFh\b|\b0xBFFFF\b", "VRAM Bitiş Fiziksel Adresi BFFFFh"),
        ("C0000h", r"\bC0000h\b|\b0xC0000\b", "Sistem BIOS Başlangıç Adresi C0000h"),
        ("FFFFFh", r"\bFFFFFh\b|\b0xFFFFF\b", "1 MB Real Mode Bitiş Adresi FFFFFh"),
        ("Address Bus", r"\bAddress\s+Bus\b|\bAdres\s+Veriyolu\b", "Adres Veriyolu (20-bit)"),
        ("Data Bus", r"\bData\s+Bus\b|\bVeri\s+Veriyolu\b", "Veri Veriyolu (16-bit)"),
        ("Control Bus", r"\bControl\s+Bus\b|\bKontrol\s+Veriyolu\b", "Kontrol Veriyolu Sinyalleri"),
        ("MEMR", r"\bMEMR\b|\bMEMR#\b|\b\/MEMR\b|\bMemory\s+Read\b", "Bellek Okuma Sinyali (MEMR)"),
        ("MEMW", r"\bMEMW\b|\bMEMW#\b|\b\/MEMW\b|\bMemory\s+Write\b", "Bellek Yazma Sinyali (MEMW)"),
        ("IOR", r"\bIOR\b|\bIOR#\b|\b\/IOR\b|\bI\/O\s+Read\b", "G/Ç Okuma Sinyali (IOR)"),
        ("IOW", r"\bIOW\b|\bIOW#\b|\b\/IOW\b|\bI\/O\s+Write\b", "G/Ç Yazma Sinyali (IOW)"),
        ("Multiply-Radix", r"Multiply-Radix|Çarpma-Taban|Kesirli.*Çarpma", "Kesirli Sayılarda Çarpma-Taban Metodu"),
        ("Bölme-Kalan", r"Bölme-Kalan|Bölme\s+Kalan|Division-Remainder", "Tamsayı Taban Dönüşümünde Bölme-Kalan Metodu"),
        ("Two's Complement", r"Two'?s\s+Complement|2'?s\s+Complement|İkiye\s+Tümleyen|2'ye\s+Tümleyen", "İkiye Tümleyen (Two's Complement) Aritmetiği"),
        ("One's Complement", r"One'?s\s+Complement|1'?s\s+Complement|Bire\s+Tümleyen|1'e\s+Tümleyen", "Bire Tümleyen (One's Complement)"),
        ("BCD", r"\bBCD\b|\bBinary\s+Coded\s+Decimal\b", "BCD (İkili Kodlanmış Onlu) Sayı Temsili"),
        ("ASCII", r"\bASCII\b", "ASCII Karakter Kodlama Standardı"),
        ("Unicode", r"\bUnicode\b|\bUTF-8\b", "Unicode Metin Temsili"),
        ("Positional Notation", r"Positional\s+Notation|Konumsal\s+(?:Ağırlıklı\s+)?Gösterim", "Konumsal Ağırlıklı Sayı Gösterimi"),
        ("Radix", r"\bRadix\b|\bTaban\b", "Sayı Sistemi Tabanı (Radix)"),
    ]
    for name, pat, desc in ch1_keywords:
        items.append(CheckItem("Ch01 Keywords", name, desc, [pat], chapter_num=1))

    # Ch 02
    ch2_keywords = [
        ("BIU", r"\bBIU\b|\bBus\s+Interface\s+Unit\b|\bVeriyolu\s+Arayüz\s+Birimi\b", "Bus Interface Unit (BIU)"),
        ("EU", r"\bEU\b|\bExecution\s+Unit\b|\bYürütme\s+Birimi\b", "Execution Unit (EU)"),
        ("Prefetch Queue", r"Prefetch\s+Queue|Ön\s+Getirme\s+Kuyruğu", "6-Baytlık Komut Ön Getirme Kuyruğu"),
        ("6-byte", r"6-bayt|6\s+bayt|6-byte|6\s+byte", "Kuyruk Boyutu (6 bayt)"),
        ("FIFO", r"\bFIFO\b|\bFirst-In-First-Out\b", "Kuyruk FIFO Yapısı"),
        ("AX", r"\bAX\b|\bAH\b|\bAL\b", "Akümülatör Yazmacı (AX/AH/AL)"),
        ("BX", r"\bBX\b|\bBH\b|\bBL\b", "Taban Yazmacı (BX/BH/BL)"),
        ("CX", r"\bCX\b|\bCH\b|\bCL\b", "Sayaç Yazmacı (CX/CH/CL)"),
        ("DX", r"\bDX\b|\bDH\b|\bDL\b", "Veri Yazmacı (DX/DH/DL)"),
        ("SP", r"\bSP\b|\bStack\s+Pointer\b", "Yığın İşaretçisi (SP)"),
        ("BP", r"\bBP\b|\bBase\s+Pointer\b", "Taban İşaretçisi (BP)"),
        ("SI", r"\bSI\b|\bSource\s+Index\b", "Kaynak İndeks Yazmacı (SI)"),
        ("DI", r"\bDI\b|\bDestination\s+Index\b", "Hedef İndeks Yazmacı (DI)"),
        ("CS", r"\bCS\b|\bCode\s+Segment\b", "Kod Segmenti (CS)"),
        ("DS", r"\bDS\b|\bData\s+Segment\b", "Veri Segmenti (DS)"),
        ("SS", r"\bSS\b|\bStack\s+Segment\b", "Yığın Segmenti (SS)"),
        ("ES", r"\bES\b|\bExtra\s+Segment\b", "Ekstra Segment (ES)"),
        ("IP", r"\bIP\b|\bInstruction\s+Pointer\b", "Komut İşaretçisi (IP)"),
        ("FLAGS", r"\bFLAGS\b|\bBayrak\s+Yazmacı\b", "16-Bit Durum ve Kontrol Bayrakları"),
        ("CF", r"\bCF\b|\bCarry\s+Flag\b|\bElde\s+Bayrağı\b", "Carry Flag (CF)"),
        ("PF", r"\bPF\b|\bParity\s+Flag\b|\bParite\s+Bayrağı\b", "Parity Flag (PF)"),
        ("AF", r"\bAF\b|\bAuxiliary\s+Carry\b|\bYardımcı\s+Elde\b", "Auxiliary Carry Flag (AF)"),
        ("ZF", r"\bZF\b|\bZero\s+Flag\b|\bSıfır\s+Bayrağı\b", "Zero Flag (ZF)"),
        ("SF", r"\bSF\b|\bSign\s+Flag\b|\bİşaret\s+Bayrağı\b", "Sign Flag (SF)"),
        ("TF", r"\bTF\b|\bTrap\s+Flag\b|\bTuzak\s+Bayrağı\b", "Trap Flag (TF)"),
        ("IF", r"\bIF\b|\bInterrupt\s+Flag\b|\bKesme\s+Bayrağı\b", "Interrupt Flag (IF)"),
        ("DF", r"\bDF\b|\bDirection\s+Flag\b|\bYön\s+Bayrağı\b", "Direction Flag (DF)"),
        ("OF", r"\bOF\b|\bOverflow\s+Flag\b|\bTaşma\s+Bayrağı\b", "Overflow Flag (OF)"),
        ("Physical Address", r"Physical\s+Address|Fiziksel\s+Adres", "20-Bit Fiziksel Adres Hesaplaması"),
        ("Segment", r"\bSegment\b|\bKesim\b", "Bellek Segmentasyonu"),
        ("Offset", r"\bOffset\b|\bOfset\b|\bEffective\s+Address\b", "Segment İçi Ofset Adresi"),
        ("Little-Endian", r"Little-Endian|Little\s+Endian|Ters\s+Bayt\s+Sırası", "Little-Endian Bayt Yerleşimi"),
        ("Wrap-around", r"Wrap-around|Dolanma|1\s*MB.*dolanma", "Segment 1 MB Dolanması (Wrap-Around)"),
        ("Even Bank", r"Even\s+Bank|Çift\s+Bank|D0-D7\s+bankı", "Çift Bellek Bankası (Even Bank)"),
        ("Odd Bank", r"Odd\s+Bank|Tek\s+Bank|D8-D15\s+bankı", "Tek Bellek Bankası (Odd Bank)"),
        ("BHE#", r"\bBHE#?\b|\b\/BHE\b|\bBus\s+High\s+Enable\b", "Bus High Enable (BHE#) Sinyali"),
        ("A0", r"\bA0\b|\bA_?0\b", "Adres Biti A0 ile Bayt Seçimi"),
    ]
    for name, pat, desc in ch2_keywords:
        items.append(CheckItem("Ch02 Keywords", name, desc, [pat], chapter_num=2))

    # Ch 03
    ch3_keywords = [
        ("Register Addressing", r"Register\s+Addressing|Yazmaç\s+Adresleme", "Yazmaç Adresleme Modu"),
        ("Immediate Addressing", r"Immediate\s+Addressing|Anlık\s+Adresleme|İvedi\s+Adresleme", "Anlık Adresleme Modu"),
        ("Direct Addressing", r"Direct\s+Addressing|Doğrudan\s+Adresleme", "Doğrudan Adresleme Modu"),
        ("Register Indirect", r"Register\s+Indirect|Yazmaç\s+Dolaylı", "Yazmaç Dolaylı Adresleme Modu"),
        ("Base-Plus-Index", r"Base-Plus-Index|Taban\s+Artı\s+İndeks", "Taban Artı İndeks Adresleme"),
        ("Register Relative", r"Register\s+Relative|Yazmaç\s+Bağıl", "Yazmaç Bağıl Adresleme"),
        ("Base Relative-Plus-Index", r"Base\s+Relative-Plus-Index|Taban\s+Bağıl\s+Artı\s+İndeks", "Taban Bağıl Artı İndeks Adresleme"),
        ("Segment Override Prefix", r"Segment\s+Override|Segment\s+Geçersiz\s+Kılma", "Segment Geçersiz Kılma Önekleri"),
        ("2Eh", r"\b2Eh\b", "CS Segment Öneki 2Eh"),
        ("36h", r"\b36h\b", "SS Segment Öneki 36h"),
        ("3Eh", r"\b3Eh\b", "DS Segment Öneki 3Eh"),
        ("26h", r"\b26h\b", "ES Segment Öneki 26h"),
        ("MOD", r"\bMOD\b", "MOD Alanı (2-bit)"),
        ("REG", r"\bREG\b", "REG Alanı (3-bit)"),
        ("R/M", r"\bR\/M\b", "R/M Alanı (3-bit)"),
        ("Opcode", r"\bOpcode\b|\bİşlem\s+Kodu\b", "Opcode Alanı"),
        ("D-bit", r"D-bit|D\s+biti|D-Biti", "D Biti (Yön: Direction)"),
        ("W-bit", r"W-bit|W\s+biti|W-Biti", "W Biti (Genişlik: Byte/Word)"),
        ("Displacement", r"\bDisplacement\b|\bDeplasman\b", "Konum Değişimi (Displacement)"),
        ("CISC", r"\bCISC\b", "CISC Komut Mimarisi"),
        ("RISC", r"\bRISC\b", "RISC Komut Mimarisi"),
    ]
    for name, pat, desc in ch3_keywords:
        items.append(CheckItem("Ch03 Keywords", name, desc, [pat], chapter_num=3))

    # Ch 04
    ch4_keywords = [
        ("MOV", r"\bMOV\b", "MOV Veri Aktarım Komutu"),
        ("XCHG", r"\bXCHG\b", "XCHG Atomik Veri Takas Komutu"),
        ("PUSH", r"\bPUSH\b", "PUSH Yığına Veri Atma"),
        ("POP", r"\bPOP\b", "POP Yığından Veri Çekme"),
        ("PUSHA", r"\bPUSHA\b", "PUSHA Tüm Genel Yazmaçları Yığına Atma"),
        ("POPA", r"\bPOPA\b", "POPA Yazmaçları Yığından Geri Yükleme"),
        ("PUSHF", r"\bPUSHF\b", "PUSHF Bayrakları Yığına Atma"),
        ("POPF", r"\bPOPF\b", "POPF Bayrakları Yığından Geri Yükleme"),
        ("LEA", r"\bLEA\b|\bLoad\s+Effective\s+Address\b", "LEA (Load Effective Address) Komutu"),
        ("LDS", r"\bLDS\b", "LDS Segment/Offset Yükleme"),
        ("LES", r"\bLES\b", "LES Segment/Offset Yükleme"),
        ("LFS", r"\bLFS\b", "LFS Segment/Offset Yükleme"),
        ("LGS", r"\bLGS\b", "LGS Segment/Offset Yükleme"),
        ("LSS", r"\bLSS\b", "LSS Segment/Offset Yükleme"),
        ("CBW", r"\bCBW\b", "CBW (Convert Byte to Word)"),
        ("CWD", r"\bCWD\b", "CWD (Convert Word to Doubleword)"),
        ("CWDE", r"\bCWDE\b", "CWDE 32-bit Boyut Genişletme"),
        ("CDQ", r"\bCDQ\b", "CDQ 64-bit Boyut Genişletme"),
        ("MOVSX", r"\bMOVSX\b", "MOVSX İşaretli Genişleterek Aktarma"),
        ("MOVZX", r"\bMOVZX\b", "MOVZX Sıfırla Genişleterek Aktarma"),
        ("LAHF", r"\bLAHF\b", "LAHF Bayrakları AH'ye Aktarma"),
        ("SAHF", r"\bSAHF\b", "SAHF AH'yi Bayraklara Aktarma"),
        ("Stack Frame", r"Stack\s+Frame|Yığın\s+Çerçevesi", "Standart Yığın Çerçevesi (Stack Frame)"),
        ("LIFO", r"\bLIFO\b|\bLast-In-First-Out\b", "Son Giren İlk Çıkar (LIFO) Prensibi"),
        ("SS:SP", r"SS:SP", "Yığın Tepesi SS:SP Gösterimi"),
        ("BP", r"\bBP\b|\bBase\s+Pointer\b", "BP Tabanlı Yığın Parametre Erişimi"),
    ]
    for name, pat, desc in ch4_keywords:
        items.append(CheckItem("Ch04 Keywords", name, desc, [pat], chapter_num=4))

    # Ch 05
    ch5_keywords = [
        ("ADD", r"\bADD\b", "ADD Toplama Komutu"),
        ("ADC", r"\bADC\b", "ADC Eldeli Toplama Komutu"),
        ("INC", r"\bINC\b", "INC 1 Artırma Komutu"),
        ("SUB", r"\bSUB\b", "SUB Çıkarma Komutu"),
        ("SBB", r"\bSBB\b", "SBB Borçlu Çıkarma Komutu"),
        ("DEC", r"\bDEC\b", "DEC 1 Azaltma Komutu"),
        ("NEG", r"\bNEG\b", "NEG İkiye Tümleyen Alma"),
        ("CMP", r"\bCMP\b", "CMP Karşılaştırma Komutu"),
        ("MUL", r"\bMUL\b", "MUL İşaretsiz Çarpma"),
        ("IMUL", r"\bIMUL\b", "IMUL İşaretli Çarpma"),
        ("DIV", r"\bDIV\b", "DIV İşaretsiz Bölme"),
        ("IDIV", r"\bIDIV\b", "IDIV İşaretli Bölme"),
        ("DAA", r"\bDAA\b|\bDecimal\s+Adjust\s+(?:for\s+)?Addition\b", "DAA (Decimal Adjust for Addition)"),
        ("DAS", r"\bDAS\b|\bDecimal\s+Adjust\s+(?:for\s+)?Subtraction\b", "DAS (Decimal Adjust for Subtraction)"),
        ("AAA", r"\bAAA\b|\bASCII\s+Adjust\s+(?:for\s+)?Addition\b", "AAA ASCII Toplama Düzeltmesi"),
        ("AAS", r"\bAAS\b|\bASCII\s+Adjust\s+(?:for\s+)?Subtraction\b", "AAS ASCII Çıkarma Düzeltmesi"),
        ("AAM", r"\bAAM\b|\bASCII\s+Adjust\s+(?:for\s+)?Multiplication\b", "AAM ASCII Çarpma Düzeltmesi"),
        ("AAD", r"\bAAD\b|\bASCII\s+Adjust\s+(?:before\s+)?Division\b", "AAD ASCII Bölme Öncesi Düzeltme"),
        ("DX:AX", r"DX:AX", "16-Bit Çarpma/Bölme DX:AX Yazmaç Çifti"),
        ("Divide by Zero", r"Divide\s+(?:by\s+)?Zero|Sıfıra\s+Bölme", "Sıfıra Bölme Hatası (Divide Error)"),
        ("Type 0", r"Type\s+0|Tip\s+0", "Intel Type 0 Sıfıra Bölme Kesmesi"),
        ("Overflow Flag", r"Overflow\s+Flag|Taşma\s+Bayrağı|\bOF\b", "Aritmetik Taşma Bayrağı"),
        ("Carry Flag", r"Carry\s+Flag|Elde\s+Bayrağı|\bCF\b", "Aritmetik Elde Bayrağı"),
        ("Multi-Precision", r"Multi-Precision|Çok\s+Basamaklı|Çok\s+Kelimeli", "Çok Kelimeli (Multi-Precision) Toplama/Çıkarma"),
    ]
    for name, pat, desc in ch5_keywords:
        items.append(CheckItem("Ch05 Keywords", name, desc, [pat], chapter_num=5))

    # Ch 06
    ch6_keywords = [
        ("AND", r"\bAND\b", "AND Boole Mantık Komutu"),
        ("OR", r"\bOR\b", "OR Boole Mantık Komutu"),
        ("XOR", r"\bXOR\b", "XOR Dışlamalı Veya Komutu"),
        ("NOT", r"\bNOT\b", "NOT Bire Tümleyen Komutu"),
        ("TEST", r"\bTEST\b", "TEST Yıkıcı Olmayan Bit Kontrol Komutu"),
        ("SHL", r"\bSHL\b|\bSAL\b", "SHL/SAL Mantıksal Sola Kaydırma"),
        ("SHR", r"\bSHR\b", "SHR Mantıksal Sağa Kaydırma"),
        ("SAR", r"\bSAR\b", "SAR Aritmetik Sağa Kaydırma (İşaret Korumalı)"),
        ("ROL", r"\bROL\b", "ROL Sola Döndürme"),
        ("ROR", r"\bROR\b", "ROR Sağa Döndürme"),
        ("RCL", r"\bRCL\b", "RCL Elde Dahil Sola Döndürme"),
        ("RCR", r"\bRCR\b", "RCR Elde Dahil Sağa Döndürme"),
        ("Masking", r"Masking|Maskeleme", "Bit Maskeleme İlkeleri"),
        ("Truth Table", r"Truth\s+Table|Doğruluk\s+Tablosu", "Boole Mantık Doğruluk Tabloları"),
        ("Sign Extension", r"Sign\s+Extension|İşaret\s+Uzatma", "SAR ile İşaret Uzatma"),
        ("Bitwise", r"Bitwise|Bit\s+Düzeyinde|Bit\s+Seviyesinde", "Bit Düzeyinde İşlemler"),
    ]
    for name, pat, desc in ch6_keywords:
        items.append(CheckItem("Ch06 Keywords", name, desc, [pat], chapter_num=6))

    # Ch 07
    ch7_keywords = [
        ("JMP", r"\bJMP\b", "JMP Koşulsuz Sıçrama"),
        ("Short Jump", r"Short\s+Jump|Kısa\s+Sıçrama", "Short Sıçrama (+127/-128 bayt)"),
        ("Near Jump", r"Near\s+Jump|Yakın\s+Sıçrama", "Near Sıçrama (+32767/-32768 bayt)"),
        ("Far Jump", r"Far\s+Jump|Uzak\s+Sıçrama", "Far Segmentler Arası Sıçrama"),
        ("Jcc", r"\bJcc\b|Koşullu\s+Sıçrama|Conditional\s+Jump", "Koşullu Sıçrama Komutları Ailesi"),
        ("JZ", r"\bJZ\b|\bJE\b", "JZ / JE Sıfırsa/Eşitse Sıçra"),
        ("JNZ", r"\bJNZ\b|\bJNE\b", "JNZ / JNE Sıfır Değilse/Eşit Değilse Sıçra"),
        ("JC", r"\bJC\b|\bJB\b|\bJNAE\b", "JC / JB Elde Varsa Sıçra"),
        ("JNC", r"\bJNC\b|\bJAE\b|\bJNB\b", "JNC Elde Yoksa Sıçra"),
        ("JA", r"\bJA\b|\bJNBE\b", "JA İşaretsiz Büyükse Sıçra"),
        ("JAE", r"\bJAE\b|\bJNB\b", "JAE İşaretsiz Büyük ya da Eşitse Sıçra"),
        ("JB", r"\bJB\b|\bJNAE\b", "JB İşaretsiz Küçükse Sıçra"),
        ("JBE", r"\bJBE\b|\bJNA\b", "JBE İşaretsiz Küçük ya da Eşitse Sıçra"),
        ("JG", r"\bJG\b|\bJNLE\b", "JG İşaretli Büyükse Sıçra"),
        ("JGE", r"\bJGE\b|\bJNL\b", "JGE İşaretli Büyük ya da Eşitse Sıçra"),
        ("JL", r"\bJL\b|\bJNGE\b", "JL İşaretli Küçükse Sıçra"),
        ("JLE", r"\bJLE\b|\bJNG\b", "JLE İşaretli Küçük ya da Eşitse Sıçra"),
        ("LOOP", r"\bLOOP\b", "LOOP Sayaçlı Döngü Komutu"),
        ("LOOPE", r"\bLOOPE\b|\bLOOPZ\b", "LOOPE / LOOPZ Eşitken Döngü"),
        ("LOOPNE", r"\bLOOPNE\b|\bLOOPNZ\b", "LOOPNE / LOOPNZ Eşit Değilken Döngü"),
        ("JCXZ", r"\bJCXZ\b", "JCXZ CX Sıfırsa Atlama"),
        ("CALL", r"\bCALL\b", "CALL Prosedür Çağırma Komutu"),
        ("RET", r"\bRET\b", "RET Prosedürden Dönüş Komutu"),
        ("Subroutine", r"Subroutine|Prosedür|Alt\s+Yordam", "Alt Yordam (Subroutine) Mimarisi"),
        ("Recursion", r"Recursion|Özyineleme", "Özyinelemeli Prosedür Çağrıları"),
    ]
    for name, pat, desc in ch7_keywords:
        items.append(CheckItem("Ch07 Keywords", name, desc, [pat], chapter_num=7))

    # Ch 08
    ch8_keywords = [
        ("MOVSB", r"\bMOVSB\b|\bMOVSW\b", "MOVSB / MOVSW String Bayt/Kelime Kopyalama"),
        ("LODSB", r"\bLODSB\b|\bLODSW\b", "LODSB / LODSW String Bellekten Yükleme"),
        ("STOSB", r"\bSTOSB\b|\bSTOSW\b", "STOSB / STOSW String Belleğe Saklama"),
        ("CMPSB", r"\bCMPSB\b|\bCMPSW\b", "CMPSB / CMPSW String Karşılaştırma"),
        ("SCASB", r"\bSCASB\b|\bSCASW\b", "SCASB / SCASW String Tarama"),
        ("REP", r"\bREP\b", "REP Koşulsuz Tekrar Öneki"),
        ("REPE", r"\bREPE\b|\bREPZ\b", "REPE / REPZ Eşitken Tekrar Öneki"),
        ("REPNE", r"\bREPNE\b|\bREPNZ\b", "REPNE / REPNZ Eşit Değilken Tekrar Öneki"),
        ("Direction Flag", r"Direction\s+Flag|Yön\s+Bayrağı|\bDF\b", "Yön Bayrağı (DF)"),
        ("CLD", r"\bCLD\b", "CLD (Clear Direction Flag: DF=0)"),
        ("STD", r"\bSTD\b", "STD (Set Direction Flag: DF=1)"),
        ("XLAT", r"\bXLAT\b|\bXLATB\b", "XLAT / XLATB Tablo Çeviri Komutu"),
        ("Lookup Table", r"Lookup\s+Table|Arama\s+Tablosu|Çeviri\s+Tablosu", "Lookup Tablosu ile Kod Dönüşümü"),
        ("DS:SI", r"DS:SI", "String Kaynak Göstergesi (DS:SI)"),
        ("ES:DI", r"ES:DI", "String Hedef Göstergesi (ES:DI)"),
    ]
    for name, pat, desc in ch8_keywords:
        items.append(CheckItem("Ch08 Keywords", name, desc, [pat], chapter_num=8))

    # Ch 09
    ch9_keywords = [
        ("Isolated I/O", r"Isolated\s+I\/O|Yalıtılmış\s+G\/Ç|Port\s+I\/O", "Yalıtılmış G/Ç (Isolated / Port I/O)"),
        ("Memory-Mapped I/O", r"Memory-Mapped\s+I\/O|Bellek\s+Haritalı\s+G\/Ç", "Bellek Haritalı G/Ç"),
        ("IN", r"\bIN\b\s+A[LHX]", "IN Port Okuma Komutu"),
        ("OUT", r"\bOUT\b\s+[^,\n]+,\s*A[LHX]", "OUT Porta Yazma Komutu"),
        ("Fixed Port", r"Fixed\s+Port|Sabit\s+Port", "Sabit Port Adresleme (00h-FFh)"),
        ("Variable Port", r"Variable\s+Port|Değişken\s+Port", "Değişken Port Adresleme (DX: 0000h-FFFFh)"),
        ("8255", r"\b8255\b|\bPPI\b|\b8255\s+PPI\b", "Intel 8255 PPI Denetleyicisi"),
        ("Port A", r"Port\s+A|\bPA0\b", "8255 Port A"),
        ("Port B", r"Port\s+B|\bPB0\b", "8255 Port B"),
        ("Port C", r"Port\s+C|\bPC0\b", "8255 Port C (Üst/Alt)"),
        ("Control Word", r"Control\s+Word|Kontrol\s+Kelimesi|Kontrol\s+Yazmacı", "8255 Kontrol Kelimesi Formatı"),
        ("Mode 0", r"Mode\s+0|Mod\s+0", "8255 Mod 0 (Temel G/Ç)"),
        ("Mode 1", r"Mode\s+1|Mod\s+1", "8255 Mod 1 (Strobed El Sıkışmalı G/Ç)"),
        ("Mode 2", r"Mode\s+2|Mod\s+2", "8255 Mod 2 (Çift Yönlü Veriyolu)"),
        ("BSR", r"\bBSR\b|Bit\s+Set\/Reset", "8255 BSR (Bit Set/Reset) Modu"),
        ("Strobe", r"\bStrobe\b|\bSTB#?\b|\b\/STB\b", "Strobe (STB#) El Sıkışma Sinyali"),
        ("IBF", r"\bIBF\b|Input\s+Buffer\s+Full", "Input Buffer Full (IBF) Sinyali"),
        ("ACK#", r"\bACK#?\b|\b\/ACK\b|\bAcknowledge\b", "Acknowledge (ACK#) Sinyali"),
        ("Handshaking", r"Handshaking|El\s+Sıkışma", "Donanımsal El Sıkışma Protokolü"),
        ("Polling", r"Polling|Programlı\s+G\/Ç|Meşgul\s+Bekleme|Busy-Wait", "Programlı G/Ç (Polling / Busy-Waiting)"),
        ("UART", r"\bUART\b|\bRS-232\b|\bSeri\s+Haberleşme\b", "Seri İletişim Arayüzleri"),
    ]
    for name, pat, desc in ch9_keywords:
        items.append(CheckItem("Ch09 Keywords", name, desc, [pat], chapter_num=9))

    # Ch 10
    ch10_keywords = [
        ("Interrupt", r"\bInterrupt\b|\bKesme\b", "Kesme (Interrupt) Kavramı"),
        ("Exception", r"\bException\b|\bİstisna\b", "İşlemci İstisnaları"),
        ("IVT", r"\bIVT\b|Interrupt\s+Vector\s+Table|Kesme\s+Vektör\s+Tablosu", "Kesme Vektör Tablosu (IVT)"),
        ("00000h", r"\b00000h\b|\b0x00000\b", "IVT Başlangıç Adresi 00000h"),
        ("003FFh", r"\b003FFh\b|\b0x003FF\b", "IVT Bitiş Adresi 003FFh (1024 Bayt)"),
        ("256", r"256\s+(?:vektör|vector|kesme)", "256 Adet Kesme Vektörü"),
        ("Type 0", r"Type\s+0|Tip\s+0|Divide\s+Error", "Type 0 Sıfıra Bölme Kesmesi"),
        ("Type 1", r"Type\s+1|Tip\s+1|Single\s+Step", "Type 1 Tek Adım (Single Step / TF) Kesmesi"),
        ("Type 2", r"Type\s+2|Tip\s+2|\bNMI\b", "Type 2 NMI (Non-Maskable Interrupt) Kesmesi"),
        ("Type 3", r"Type\s+3|Tip\s+3|Breakpoint|0xCC", "Type 3 Kesme Noktası (Breakpoint / INT 3)"),
        ("Type 4", r"Type\s+4|Tip\s+4|\bINTO\b|Overflow", "Type 4 Taşma Kesmesi (INTO)"),
        ("INTR", r"\bINTR\b", "Maskelenebilir Harici Kesme Pini (INTR)"),
        ("NMI", r"\bNMI\b|Non-Maskable\s+Interrupt|Maskelenemez", "Maskelenemez Donanım Kesmesi (NMI)"),
        ("CLI", r"\bCLI\b", "CLI (Clear Interrupt Flag: Kesmeleri Kapat)"),
        ("STI", r"\bSTI\b", "STI (Set Interrupt Flag: Kesmeleri Aç)"),
        ("IRET", r"\bIRET\b", "IRET (Interrupt Return) Komutu"),
        ("ISR", r"\bISR\b|Interrupt\s+Service\s+Routine|Kesme\s+Servis\s+Rutini", "Kesme Servis Rutini (ISR) Tasarımı"),
        ("8259A", r"8259A?|\bPIC\b|Programlanabilir\s+Kesme\s+Denetleyicisi", "Intel 8259A PIC Kesme Denetleyicisi"),
        ("INT 10h", r"INT\s+10h|0x10", "BIOS INT 10h Video Hizmetleri"),
        ("INT 16h", r"INT\s+16h|0x16", "BIOS INT 16h Klavye Hizmetleri"),
        ("INT 21h", r"INT\s+21h|0x21", "DOS INT 21h Sistem Çağrıları"),
        ("EOI", r"\bEOI\b|End\s+of\s+Interrupt", "End of Interrupt (EOI) Komutu"),
    ]
    for name, pat, desc in ch10_keywords:
        items.append(CheckItem("Ch10 Keywords", name, desc, [pat], chapter_num=10))

    # Ch 11
    ch11_keywords = [
        ("DMA", r"\bDMA\b|Direct\s+Memory\s+Access|Doğrudan\s+Bellek\s+Erişimi", "Doğrudan Bellek Erişimi (DMA)"),
        ("HOLD", r"\bHOLD\b", "HOLD Veriyolu Talep Pini"),
        ("HLDA", r"\bHLDA\b|Hold\s+Acknowledge", "HLDA (Hold Acknowledge) Onay Pini"),
        ("8237", r"\b8237\b|\b8237\s+DMA\b", "Intel 8237 DMA Denetleyicisi"),
        ("Cycle Stealing", r"Cycle\s+Stealing|Çevrim\s+Çalma", "Çevrim Çalma (Cycle Stealing) Modu"),
        ("Burst Mode", r"Burst\s+Mode|Blok\s+Modu", "Blok Transferi (Burst Mode)"),
        ("Channel 0", r"Channel\s+0|Kanal\s+0", "8237 Kanal 0 (RAM Yenileme)"),
        ("Channel 1", r"Channel\s+1|Kanal\s+1", "8237 Kanal 1"),
        ("Channel 2", r"Channel\s+2|Kanal\s+2", "8237 Kanal 2 (Disket/Disk Denetleyici)"),
        ("Channel 3", r"Channel\s+3|Kanal\s+3", "8237 Kanal 3"),
        ("Terminal Count", r"Terminal\s+Count|\bTC\b", "Terminal Count (TC) Transfer Sonu"),
        ("Cache Coherency", r"Cache\s+Coherency|Önbellek\s+Tutarlılığı", "DMA ve Önbellek Tutarlılığı Problemi"),
        ("PCB", r"\bPCB\b|Process\s+Control\s+Block|Proses\s+Kontrol\s+Bloğu", "Proses Kontrol Bloğu (PCB)"),
        ("Context Switching", r"Context\s+Switch(?:ing)?|Bağlam\s+Değiştirme", "Bağlam Değiştirme (Context Switching)"),
        ("User Mode", r"User\s+Mode|Kullanıcı\s+Modu", "Kullanıcı Modu (User Mode)"),
        ("Kernel Mode", r"Kernel\s+Mode|Supervisor\s+Mode|Çekirdek\s+Modu", "Çekirdek Modu (Kernel / Supervisor Mode)"),
    ]
    for name, pat, desc in ch11_keywords:
        items.append(CheckItem("Ch11 Keywords", name, desc, [pat], chapter_num=11))

    # Ch 12
    ch12_keywords = [
        ("Pipelining", r"Pipelining|Boru\s+Hattı|Instruction\s+Pipelining", "Komut Boru Hattı (Instruction Pipelining)"),
        ("IF", r"\bIF\b|Instruction\s+Fetch|Komut\s+Getir", "Boru Hattı IF (Instruction Fetch) Aşaması"),
        ("ID", r"\bID\b|Instruction\s+Decode|Komut\s+Çöz", "Boru Hattı ID (Instruction Decode) Aşaması"),
        ("EX", r"\bEX\b|Execute|Yürüt", "Boru Hattı EX (Execute) Aşaması"),
        ("MEM", r"\bMEM\b|Memory\s+Access|Bellek\s+Erişimi", "Boru Hattı MEM (Memory Access) Aşaması"),
        ("WB", r"\bWB\b|Write\s*Back|Yazmaç\s+Yazma", "Boru Hattı WB (Write-Back) Aşaması"),
        ("Speedup", r"Speedup|Hızlanma", "Boru Hattı Hızlanma (Speedup) Modeli"),
        ("Throughput", r"Throughput|İşlem\s+Hacmi|Bant\s+Genişliği", "Boru Hattı Verimliliği ve Throughput"),
        ("Structural Hazard", r"Structural\s+Hazard|Yapısal\s+Tehlike", "Yapısal Tehlikeler (Structural Hazards)"),
        ("Data Hazard", r"Data\s+Hazard|Veri\s+Tehlikesi", "Veri Tehlikeleri (Data Hazards)"),
        ("RAW", r"\bRAW\b|Read\s+After\s+Write|Gerçek\s+Bağımlılık", "RAW (Read After Write / True Dependency)"),
        ("WAR", r"\bWAR\b|Write\s+After\s+Read|Karşıt\s+Bağımlılık", "WAR (Write After Read / Anti-Dependency)"),
        ("WAW", r"\bWAW\b|Write\s+After\s+Write|Çıkış\s+Bağımlılığı", "WAW (Write After Write / Output Dependency)"),
        ("Forwarding", r"Forwarding|Bypassing|İletme|Baypas", "Veri İletme (Data Forwarding / Bypassing)"),
        ("Pipeline Stall", r"Pipeline\s+Stall|Duraklatma|Stall", "Boru Hattı Duraklatma (Stall)"),
        ("Bubble", r"\bBubble\b|Kabarcık", "Boru Hattı Kabarcığı (Bubble / NOP)"),
        ("Control Hazard", r"Control\s+Hazard|Kontrol\s+Tehlikesi|Dallanma\s+Tehlikesi", "Kontrol Tehlikeleri (Control Hazards)"),
        ("Branch Penalty", r"Branch\s+Penalty|Dallanma\s+Cezası", "Dallanma Cezası (Branch Penalty)"),
        ("Branch Prediction", r"Branch\s+Prediction|Dallanma\s+Tahmini", "Statik ve Dinamik Dallanma Tahmini"),
        ("BTB", r"\bBTB\b|Branch\s+Target\s+Buffer", "Dallanma Hedef Tamponu (BTB)"),
        ("Delayed Branching", r"Delayed\s+Branch(?:ing)?|Gecikmeli\s+Dallanma", "Gecikmeli Dallanma (Delayed Branching)"),
    ]
    for name, pat, desc in ch12_keywords:
        items.append(CheckItem("Ch12 Keywords", name, desc, [pat], chapter_num=12))

    # Ch 13
    ch13_keywords = [
        ("Memory Hierarchy", r"Memory\s+Hierarchy|Bellek\s+Hiyerarşisi", "Bellek Hiyerarşisi Piramidi"),
        ("Temporal Locality", r"Temporal\s+Locality|Zamansal\s+Yerellik", "Zamansal Yerellik (Temporal Locality)"),
        ("Spatial Locality", r"Spatial\s+Locality|Mekansal\s+Yerellik", "Mekansal Yerellik (Spatial Locality)"),
        ("Cache", r"\bCache\b|Önbellek", "Önbellek (Cache) Mimarisi"),
        ("L1", r"\bL1\b|Level\s+1", "L1 Birinci Seviye Önbellek"),
        ("L2", r"\bL2\b|Level\s+2", "L2 İkinci Seviye Önbellek"),
        ("L3", r"\bL3\b|Level\s+3", "L3 Üçüncü Seviye Paylaşılan Önbellek"),
        ("Direct-Mapped", r"Direct-Mapped|Doğrudan\s+Eşlemeli", "Doğrudan Eşlemeli (Direct-Mapped) Önbellek"),
        ("Set-Associative", r"Set-Associative|Kümeli\s+İlişkili", "Kümeli İlişkili (Set-Associative) Önbellek"),
        ("Fully Associative", r"Fully\s+Associative|Tam\s+İlişkili", "Tam İlişkili (Fully Associative) Önbellek"),
        ("Tag", r"\bTag\b|Etiket", "Önbellek Etiket (Tag) Alanı"),
        ("Index", r"\bIndex\b|İndeks", "Önbellek Hat/Küme İndeksi"),
        ("Offset", r"\bOffset\b|Ofset|Blok\s+Ofseti", "Önbellek Blok İçi Ofset"),
        ("Compulsory Miss", r"Compulsory\s+Miss|Cold\s+Miss|Zorunlu\s+Iska|Soğuk\s+Iska", "Zorunlu Iska (Compulsory / Cold Miss)"),
        ("Capacity Miss", r"Capacity\s+Miss|Kapasite\s+Iska", "Kapasite Iskası (Capacity Miss)"),
        ("Conflict Miss", r"Conflict\s+Miss|Çakışma\s+Iska", "Çakışma Iskası (Conflict Miss)"),
        ("Write-Through", r"Write-Through|Doğrudan\s+Yazma", "Doğrudan Yazma (Write-Through) Politikası"),
        ("Write-Back", r"Write-Back|Geriye\s+Yazma", "Geriye Yazma (Write-Back) Politikası"),
        ("Dirty Bit", r"Dirty\s+Bit|Kirli\s+Bit", "Kirli Bit (Dirty Bit) Göstergesi"),
        ("LRU", r"\bLRU\b|Least\s+Recently\s+Used", "LRU (Least Recently Used) Blok Değiştirme"),
        ("AMAT", r"\bAMAT\b|Average\s+Memory\s+Access\s+Time|Ortalama\s+Bellek\s+Erişim\s+Süresi", "Ortalama Bellek Erişim Süresi (AMAT)"),
    ]
    for name, pat, desc in ch13_keywords:
        items.append(CheckItem("Ch13 Keywords", name, desc, [pat], chapter_num=13))

    # Ch 14
    ch14_keywords = [
        ("MACRO", r"\bMACRO\b", "MACRO Makro Tanımlama Direktifi"),
        ("ENDM", r"\bENDM\b", "ENDM Makro Bitiş Direktifi"),
        ("Macro Expansion", r"Macro\s+Expansion|Makro\s+Genişlemesi|Satır\s+İçi\s+Genişleme", "Makrolarda Satır İçi (In-Line) Kod Genişlemesi"),
        ("Conditional Macro", r"Conditional\s+Macro|Koşullu\s+Makro", "Koşullu Makro Yapıları"),
        ("IFDEF", r"\bIFDEF\b|\bIFNDEF\b|\bIF\b", "IFDEF / IF Koşullu Derleme Direktifleri"),
        ("8085", r"\b8085\b|Intel\s+8085", "Intel 8085 8-Bit Mikroişlemcisi"),
        ("Accumulator", r"Accumulator|Akümülatör|\bA\s+yazmacı\b", "8085 A (Akümülatör) Yazmacı"),
        ("BC", r"\bBC\b|B-C\s+yazmaç\s+çifti", "8085 BC Yazmaç Çifti"),
        ("DE", r"\bDE\b|D-E\s+yazmaç\s+çifti", "8085 DE Yazmaç Çifti"),
        ("HL", r"\bHL\b|H-L\s+yazmaç\s+çifti", "8085 HL Bellek İşaretçi Çifti (M)"),
        ("Program Counter", r"Program\s+Counter|\bPC\b", "8085 16-Bit Program Counter"),
        ("RST 7.5", r"RST\s+7\.5", "8085 Donanım Kesmesi RST 7.5"),
        ("RST 6.5", r"RST\s+6\.5", "8085 Donanım Kesmesi RST 6.5"),
        ("RST 5.5", r"RST\s+5\.5", "8085 Donanım Kesmesi RST 5.5"),
        ("TRAP", r"\bTRAP\b", "8085 En Yüksek Öncelikli Kesme (TRAP / NMI)"),
        ("DAD", r"\bDAD\b", "8085 DAD 16-Bit Toplama Komutu"),
        ("LXI", r"\bLXI\b", "8085 LXI Çifte Doğrudan Yükleme"),
        ("MVI", r"\bMVI\b", "8085 MVI Anlık Veri Yükleme"),
        ("LDA", r"\bLDA\b", "8085 LDA Akümülatöre Yükleme"),
        ("STA", r"\bSTA\b", "8085 STA Akümülatörden Saklama"),
        ("8085 vs 8086", r"8085\s+vs\.?\s*8086|8085\s+ve\s+8086\s+Karşılaştırma", "8085 ve 8086 Karşılaştırmalı Analizi"),
    ]
    for name, pat, desc in ch14_keywords:
        items.append(CheckItem("Ch14 Keywords", name, desc, [pat], chapter_num=14))

    # Ch 15
    ch15_keywords = [
        ("Flynn", r"Flynn|Flynn\s+Taksonomisi", "Flynn Paralel Bilgisayar Taksonomisi"),
        ("SISD", r"\bSISD\b|Single\s+Instruction\s+Single\s+Data", "SISD (Tek Komut Tek Veri)"),
        ("SIMD", r"\bSIMD\b|Single\s+Instruction\s+Multiple\s+Data", "SIMD (Tek Komut Çoklu Veri)"),
        ("MISD", r"\bMISD\b|Multiple\s+Instruction\s+Single\s+Data", "MISD (Çoklu Komut Tek Veri)"),
        ("MIMD", r"\bMIMD\b|Multiple\s+Instruction\s+Multiple\s+Data", "MIMD (Çoklu Komut Çoklu Veri)"),
        ("ILP", r"\bILP\b|Instruction-Level\s+Parallelism|Komut\s+Düzeyi\s+Paralellik", "Komut Düzeyinde Paralellik (ILP)"),
        ("TLP", r"\bTLP\b|Thread-Level\s+Parallelism|İş\s+Parçacığı\s+Düzeyi\s+Paralellik", "İş Parçacığı Düzeyinde Paralellik (TLP)"),
        ("Superscalar", r"Superscalar|Süperskalar", "Superscalar İşlemci Mimarisi"),
        ("SMT", r"\bSMT\b|Simultaneous\s+Multithreading", "Eşzamanlı Çoklu İş Parçacığı (SMT)"),
        ("Hyper-Threading", r"Hyper-Threading|HyperThreading", "Intel Hyper-Threading Teknolojisi"),
        ("Multi-Core", r"Multi-Core|Çok\s+Çekirdek", "Çok Çekirdekli İşlemci Mimarisi"),
        ("Amdahl's Law", r"Amdahl'?s\s+Law|Amdahl\s+Yasası", "Amdahl Yasası (Seri Darboğaz Sınırı)"),
        ("Gustafson's Law", r"Gustafson'?s\s+Law|Gustafson\s+Yasası", "Gustafson Yasası (Ölçeklenmiş Hızlanma)"),
        ("Speedup Ceiling", r"Speedup\s+Ceiling|Teorik\s+(?:Azami\s+)?Hızlanma\s+Sınırı|1\s*\/\s*\(1\s*-\s*p\)", "Amdahl Teorik Hızlanma Tavanı"),
        ("RISC", r"\bRISC\b|Reduced\s+Instruction\s+Set", "RISC Mimarisi"),
        ("CISC", r"\bCISC\b|Complex\s+Instruction\s+Set", "CISC Mimarisi"),
        ("Micro-operations", r"Micro-operations|Micro-ops|\buops\b|µops|Mikro-operasyon", "CISC Komutlarının Dahili Mikro-Operasyonlara Çözülmesi"),
    ]
    for name, pat, desc in ch15_keywords:
        items.append(CheckItem("Ch15 Keywords", name, desc, [pat], chapter_num=15))

    # =======================================================================
    # Category 2: Architectural Blocks (Global & System Verification)
    # =======================================================================
    arch_blocks = [
        ("BIU & EU Separation", r"BIU.*EU|Bus\s+Interface\s+Unit.*Execution\s+Unit|Veriyolu\s+Arayüz.*Yürütme\s+Birimi", "BIU ve EU Fonksiyonel İşbölümü", 2),
        ("Prefetch Queue & FIFO", r"(?:Prefetch\s+Queue|Ön\s+Getirme\s+Kuyruğu).*(?:6\s*bayt|6-byte|FIFO)", "6-Baytlık FIFO Komut Ön Getirme Kuyruğu", 2),
        ("8255 PPI Architecture", r"(?:8255|PPI).*(?:Port\s+A|Control\s+Word|Kontrol\s+Yazmacı).*(?:Mode\s+0|Mod\s+0|BSR)", "Intel 8255 Programlanabilir Port Denetleyicisi Mimarisi", 9),
        ("IVT 256 Vectors (00000h-003FFh)", r"(?:IVT|Kesme\s+Vektör\s+Tablosu).*(?:00000h|003FFh|256).*(?:CS:IP|far\s+pointer|Type\s+0)", "256 Vektörlük Kesme Vektör Tablosu Mimarisi", 10),
        ("8237 DMA Controller & HOLD/HLDA", r"(?:8237|DMA).*(?:HOLD|HLDA).*(?:Cycle\s+Stealing|Burst|Çevrim\s+Çalma)", "8237 DMA Denetleyicisi ve HOLD/HLDA Veriyolu Tahsisi", 11),
        ("Pipelining 5 Stages & Hazards", r"(?:Pipelining|Boru\s+Hattı).*(?:IF.*ID.*EX.*MEM.*WB|Hazard|Tehlike|RAW|WAR|WAW)", "5-Aşamalı Boru Hattı ve Yapısal/Veri/Kontrol Tehlikeleri", 12),
        ("Cache Hierarchy & Hit/Miss/AMAT", r"(?:Cache|Önbellek).*(?:Hit|Miss|Iska|AMAT|Direct-Mapped|Set-Associative)", "Önbellek Hiyerarşisi, Eşleme ve AMAT Başarımı", 13),
        ("Intel 8085 vs 8086 Comparison", r"(?:8085.*8086|8086.*8085).*(?:8-bit|16-bit|64\s*KB|1\s*MB|segment)", "8085 ve 8086 Mimarilerinin Karşılaştırmalı Analizi", 14),
        ("RISC vs CISC Architecture", r"(?:RISC.*CISC|CISC.*RISC).*(?:Load\/Store|Addressing|Yazmaç|Register)", "RISC ve CISC Felsefelerinin Derinlemesine Karşılaştırması", 15),
        ("Flynn's Taxonomy (SISD/SIMD/MISD/MIMD)", r"Flynn.*(?:SISD.*SIMD.*MISD.*MIMD|Single\s+Instruction|Multiple\s+Instruction)", "Flynn Taksonomisi ve Çok İşlemcili Mimariler", 15),
        ("Amdahl's Law Speedup Limit", r"Amdahl.*(?:1\s*\/\s*\(1\s*-\s*p\)|Speedup|Hızlanma|Darboğaz)", "Amdahl Yasası ve Paralel Başarım Tavanı", 15),
    ]
    for name, pat, desc, ch in arch_blocks:
        items.append(CheckItem("Architectural Blocks", name, desc, [pat], chapter_num=ch))

    # =======================================================================
    # Category 3: 8086 Addressing Modes
    # =======================================================================
    addr_modes = [
        ("Register Addressing Mode", r"Register\s+Addressing|Yazmaç\s+Adresleme", "Yazmaç Adresleme Modu (Örn: MOV AX, BX)", 3),
        ("Immediate Addressing Mode", r"Immediate\s+Addressing|Anlık\s+Adresleme|İvedi\s+Adresleme", "Anlık Adresleme Modu (Örn: MOV AX, 1234h)", 3),
        ("Direct Addressing Mode", r"Direct\s+Addressing|Doğrudan\s+Adresleme", "Doğrudan Adresleme Modu (Örn: MOV AX, [1000h])", 3),
        ("Register Indirect Addressing Mode", r"Register\s+Indirect|Yazmaç\s+Dolaylı", "Yazmaç Dolaylı Adresleme (Örn: MOV AX, [BX])", 3),
        ("Base-Plus-Index Addressing Mode", r"Base-Plus-Index|Taban\s+Artı\s+İndeks", "Taban Artı İndeks Adresleme (Örn: MOV AX, [BX+SI])", 3),
        ("Register Relative Addressing Mode", r"Register\s+Relative|Yazmaç\s+Bağıl", "Yazmaç Bağıl Adresleme (Örn: MOV AX, [BX+4])", 3),
        ("Base Relative-Plus-Index Addressing Mode", r"Base\s+Relative-Plus-Index|Taban\s+Bağıl\s+Artı\s+İndeks", "Taban Bağıl Artı İndeks (Örn: MOV AX, [BX+DI+10h])", 3),
        ("Program Memory Addressing Modes", r"Program\s+Memory\s+Addressing|Direct\s+Far|Relative\s+Near|Relative\s+Short", "Program Bellek Adresleme Modları (Direct Far, Relative Near/Short)", 3),
        ("Stack Memory Addressing", r"Stack\s+(?:Memory\s+)?Addressing|SS:SP|PUSH|POP", "Yığın Bellek Adresleme Mekanizması", 3),
    ]
    for name, pat, desc, ch in addr_modes:
        items.append(CheckItem("Addressing Modes", name, desc, [pat], chapter_num=ch))

    # =======================================================================
    # Category 4: 8086 Instructions
    # =======================================================================
    instructions = [
        # Data Movement
        ("MOV", r"\bMOV\b\s+[^,\n]+,\s*[^,\n]+", "MOV Veri Kopyalama", 4),
        ("XCHG", r"\bXCHG\b\s+[^,\n]+,\s*[^,\n]+", "XCHG Yazmaç/Bellek Takası", 4),
        ("PUSH / POP", r"\bPUSH\b.*\bPOP\b|\bPOP\b.*\bPUSH\b", "PUSH ve POP Yığın Komutları", 4),
        ("PUSHA / POPA", r"\bPUSHA\b|\bPOPA\b", "PUSHA ve POPA Toplu Yığın Komutları", 4),
        ("PUSHF / POPF", r"\bPUSHF\b|\bPOPF\b", "PUSHF ve POPF Bayrak Yığın Komutları", 4),
        ("LEA", r"\bLEA\b\s+[^,\n]+,\s*\[?[^,\n]+\]?", "LEA Efektif Adres Yükleme", 4),
        ("LDS / LES", r"\bLDS\b|\bLES\b", "LDS ve LES Segment Pointer Yükleme", 4),
        ("XLAT / XLATB", r"\bXLATB?\b", "XLAT / XLATB Tablo Çeviri", 8),
        ("IN / OUT", r"\bIN\b.*\bOUT\b|\bOUT\b.*\bIN\b", "IN ve OUT G/Ç Port Komutları", 9),
        # Conversion
        ("CBW / CWD", r"\bCBW\b|\bCWD\b", "CBW ve CWD Boyut Genişletme", 4),
        ("LAHF / SAHF", r"\bLAHF\b|\bSAHF\b", "LAHF ve SAHF Bayrak Aktarımları", 4),
        # Arithmetic
        ("ADD / ADC", r"\bADD\b.*\bADC\b|\bADC\b", "ADD ve ADC Toplama Komutları", 5),
        ("SUB / SBB", r"\bSUB\b.*\bSBB\b|\bSBB\b", "SUB ve SBB Çıkarma Komutları", 5),
        ("INC / DEC", r"\bINC\b.*\bDEC\b|\bDEC\b", "INC ve DEC Artırma/Azaltma", 5),
        ("NEG", r"\bNEG\b\s+[A-Za-z0-9_\[\]]+", "NEG İkiye Tümleyen Alma", 5),
        ("CMP", r"\bCMP\b\s+[^,\n]+,\s*[^,\n]+", "CMP Karşılaştırma", 5),
        ("MUL / IMUL", r"\bMUL\b|\bIMUL\b", "MUL ve IMUL Çarpma Komutları", 5),
        ("DIV / IDIV", r"\bDIV\b|\bIDIV\b", "DIV ve IDIV Bölme Komutları", 5),
        ("DAA / DAS", r"\bDAA\b|\bDAS\b", "DAA ve DAS Paketlenmiş BCD Düzeltme", 5),
        ("AAA / AAS / AAM / AAD", r"\bAAA\b|\bAAS\b|\bAAM\b|\bAAD\b", "ASCII Aritmetik Düzeltme Komutları", 5),
        # Logic & Shift
        ("AND / OR / XOR", r"\bAND\b.*\bOR\b.*\bXOR\b|\bXOR\b.*\bAND\b", "AND, OR, XOR Mantıksal Komutlar", 6),
        ("NOT / TEST", r"\bNOT\b.*\bTEST\b|\bTEST\b.*\bNOT\b", "NOT ve TEST Komutları", 6),
        ("SHL / SAL / SHR / SAR", r"\bSHL\b|\bSAL\b|\bSHR\b|\bSAR\b", "Mantıksal ve Aritmetik Bit Kaydırma", 6),
        ("ROL / ROR / RCL / RCR", r"\bROL\b|\bROR\b|\bRCL\b|\bRCR\b", "Döngüsel ve Eldeli Bit Döndürme", 6),
        # String
        ("MOVSB / MOVSW", r"\bMOVSB\b|\bMOVSW\b", "MOVS String Taşıma", 8),
        ("LODSB / STOSB", r"\bLODSB\b|\bSTOSB\b", "LODSB ve STOSB String Yükleme/Saklama", 8),
        ("CMPSB / SCASB", r"\bCMPSB\b|\bSCASB\b", "CMPSB ve SCASB String Karşılaştırma/Arama", 8),
        ("REP / REPE / REPNE", r"\bREP\b|\bREPE\b|\bREPNE\b|\bREPZ\b|\bREPNZ\b", "String Tekrar Önekleri", 8),
        # Flow Control
        ("JMP (Short/Near/Far)", r"\bJMP\b.*(?:Short|Near|Far|Kısa|Yakın|Uzak)", "JMP Koşulsuz Sıçrama Çeşitleri", 7),
        ("Jcc Conditional Jumps", r"\b(?:JZ|JE|JNZ|JNE|JC|JNC|JA|JB|JG|JL|JAE|JBE|JGE|JLE|JO|JNO|JS|JNS)\b", "Jcc Koşullu Sıçrama Komutları", 7),
        ("LOOP / LOOPE / LOOPNE", r"\bLOOP\b|\bLOOPE\b|\bLOOPNE\b|\bLOOPZ\b|\bLOOPNZ\b", "Sayaçlı Döngü Komutları", 7),
        ("JCXZ", r"\bJCXZ\b", "JCXZ CX Sıfırsa Sıçrama", 7),
        ("CALL / RET", r"\bCALL\b.*\bRET\b|\bRET\b.*\bCALL\b", "CALL ve RET Prosedür Komutları", 7),
        # Processor Control & Interrupts
        ("CLD / STD", r"\bCLD\b|\bSTD\b", "CLD ve STD Yön Bayrağı Yönetimi", 8),
        ("CLI / STI", r"\bCLI\b|\bSTI\b", "CLI ve STI Kesme Bayrağı Yönetimi", 10),
        ("INT / INTO / IRET", r"\bINT\b|\bINTO\b|\bIRET\b", "INT, INTO ve IRET Kesme Komutları", 10),
        ("HLT / NOP", r"\bHLT\b|\bNOP\b", "HLT ve NOP İşlemci Kontrol Komutları", 2),
    ]
    for name, pat, desc, ch in instructions:
        items.append(CheckItem("8086 Instructions", name, desc, [pat], chapter_num=ch))

    # =======================================================================
    # Category 5: Mandatory Mathematical Formulas
    # =======================================================================
    formulas = [
        ("Physical Address Formula",
         r"(?:PA|Fiziksel\s*Adres)\s*=\s*(?:\(?[^=\n]*\bSegment\b[^=\n]*(?:\*|\times|<<|\b16\b)[^=\n]*\bOffset\b)|Segment\s*(?:\*|\\times)\s*16\s*\+\s*Offset",
         "PA = Segment * 16 + Offset (Fiziksel Adres Hesaplama Formülü)", 2),
        ("Address Space Formula",
         r"2\^\{?(?:20|32|n|A|16)\}?\s*(?:bytes?|bayt|MB|GB|KB)?|2\^A|2\^n",
         "2^n Adreslenebilir Bellek Uzayı Formülü (2^20 = 1 MB)", 1),
        ("Multiply-Radix Fraction Formula",
         r"F\s*(?:\*|\\times)\s*r\s*=\s*I|Multiply-Radix|Çarpma-Taban",
         "F * r = I1 + F1 Kesirli Sayı Dönüşüm Formülü", 1),
        ("Two's Complement Formula",
         r"2\^k\s*-\s*N|\\overline\{N\}\s*\+\s*1|\bNOT\b\s*N\s*\+\s*1|tümleyen(?:\s*aritmetiği)?|N\^\*\s*=\s*2\^k",
         "N* = 2^k - N = (NOT N) + 1 İkiye Tümleyen Formülü", 1),
        ("Signed Overflow Detection Formula",
         r"OF\s*=\s*C_?(?:\{?in\}?|\bin\b)\s*(?:\^|\\oplus|\+)\s*C_?(?:\{?out\}?|\bout\b)|Cin\s*(?:\^|\\oplus)\s*Cout|Carry\s*into\s*MSB",
         "OF = Cin XOR Cout Aritmetik Taşma Kuralı", 5),
        ("IVT Vector Address Formula",
         r"(?:(?:IVT|Vector|Vektör|Adres)\s*=\s*)?(?:Type|Tip)\s*(?:\*|\\times)\s*4|Type\s*\*\s*4",
         "IVT Adresi = Tip * 4 Vektör Başlangıç Adresi Formülü", 10),
        ("Pipelined Speedup Formula",
         r"S_?k?\s*=\s*(?:\\frac\{n\s*\\cdot\s*k\}\{k\s*\+\s*n\s*-\s*1\}|\(?n\s*\*\s*k\)?\s*\/\s*\(?k\s*\+\s*n\s*-\s*1\)?)|Speedup\s*=\s*n\s*\*\s*k",
         "Sk = (n * k) / (k + n - 1) Boru Hattı Hızlanma Modeli", 12),
        ("Average Memory Access Time (AMAT)",
         r"(?:AMAT\s*=\s*)?Hit\s*Time\s*\+\s*\(?Miss\s*Rate\s*(?:\*|\\times)\s*Miss\s*Penalty\)?|AMAT.*Hit\s+Time",
         "AMAT = Hit Time + (Miss Rate * Miss Penalty) Formülü", 13),
        ("Cache Address Bit Partitioning",
         r"Tag\s*\+\s*Index\s*\+\s*Offset|Etiket\s*\+\s*İndeks\s*\+\s*Ofset|A\s*=\s*t\s*\+\s*s\s*\+\s*b",
         "A = Tag + Index + Offset Önbellek Adres Bölümleme Formülü", 13),
        ("Amdahl's Law Formula",
         r"\\frac\{1\}\{\(?1\s*-\s*p\)?\s*\+\s*\\frac\{p\}\{s\}\}|1\s*\/\s*\(\(?1\s*-\s*p\)?\s*\+\s*p\s*\/\s*s\)|S\(s\)\s*=\s*1\s*\/|Amdahl.*1\s*\/\s*\(1\s*-\s*p\)",
         "S(s) = 1 / ((1 - p) + p/s) Amdahl Hızlanma Formülü", 15),
        ("Gustafson's Law Formula",
         r"\(?1\s*-\s*p\)?\s*\+\s*s\s*(?:\*|\\cdot)\s*p|S\(s\)\s*=\s*\(1\s*-\s*p\)\s*\+\s*s|Gustafson.*\(1\s*-\s*p\)",
         "S(s) = (1 - p) + s * p Gustafson Ölçeklenmiş Hızlanma Formülü", 15),
    ]
    for name, pat, desc, ch in formulas:
        items.append(CheckItem("Mathematical Formulas", name, desc, [pat], chapter_num=ch))

    # =======================================================================
    # Category 6: Mandatory Hardware & Reference Tables
    # =======================================================================
    tables = [
        ("8086 FLAGS Register Anatomy Table",
         r"\|.*(?:CF|Carry).*\|.*(?:PF|Parity).*\|.*(?:ZF|Zero).*\|.*(?:OF|Overflow).*\|",
         "16-Bit FLAGS Yazmacı Bit Pozisyonları ve Görevleri Tablosu", 2),
        ("Default Segment:Offset Register Pairs Table",
         r"\|.*(?:CS.*IP|Code\s+Segment).*\|.*(?:SS.*SP|Stack\s+Segment).*\|.*(?:DS.*BX|Data\s+Segment).*\|",
         "Varsayılan Segment-Offset Yazmaç Eşleşmeleri Tablosu", 2),
        ("MOD-REG-R/M Machine Code Decoding Table",
         r"\|.*MOD.*\|.*REG.*\|.*R\/M.*\|",
         "8086 Makine Kodu MOD-REG-R/M Kod Çözümleme Tablosu", 3),
        ("Jcc Conditional Jump Flags Table",
         r"\|.*(?:JZ|JE).*\|.*(?:JNZ|JNE).*\|.*(?:JA|JB|JG|JL).*\|",
         "Koşullu Sıçrama (Jcc) Komutları ve Bayrak Şartları Tablosu", 7),
        ("8255 PPI Mode Definition Control Word Table",
         r"\|.*(?:Port\s+A|Grup\s+A).*\|.*(?:Port\s+B|Grup\s+B).*\|.*(?:Mode\s+0|Mod\s+0|D7).*\|",
         "8255 PPI Kontrol Kelimesi Bit Formatı Tablosu", 9),
        ("IVT Dedicated Interrupt Types (0 to 4) Table",
         r"\|.*(?:Type\s+0|Tip\s+0).*\|.*(?:Type\s+1|Tip\s+1).*\|.*(?:Type\s+2|Tip\s+2|NMI).*\|",
         "Intel Rezerve Özel Kesmeler (Tip 0 - Tip 4) Tablosu", 10),
        ("8237 DMA Controller Internal Registers Table",
         r"\|.*(?:Command|Komut).*\|.*(?:Mode|Mod).*\|.*(?:Mask|Maske).*\|.*(?:Address|Count).*\|",
         "8237 DMA Denetleyicisi Dahili Yazmaç Haritası Tablosu", 11),
        ("Memory Hierarchy Speed/Capacity/Cost Comparison Table",
         r"\|.*(?:Register|Yazmaç).*\|.*(?:L1|L2|L3).*\|.*(?:DRAM|RAM|Ana\s+Bellek).*\|.*(?:SSD|Disk).*\|",
         "Bellek Hiyerarşisi Piramidi Hız, Kapasite ve Maliyet Tablosu", 13),
        ("Intel 8085 vs 8086 Architectural Comparison Table",
         r"\|.*(?:8085).*\|.*(?:8086).*\|.*(?:8-bit|16-bit|64\s*KB|1\s*MB).*\|",
         "Intel 8085 ve 8086 Mimari Karşılaştırma Tablosu", 14),
        ("RISC vs CISC Architectural Comparison Table",
         r"\|.*(?:RISC).*\|.*(?:CISC).*\|.*(?:Instruction|Komut|Register|Yazmaç).*\|",
         "RISC ve CISC Felsefeleri Kapsamlı Karşılaştırma Tablosu", 15),
    ]
    for name, pat, desc, ch in tables:
        items.append(CheckItem("Reference Tables", name, desc, [pat], chapter_num=ch))

    return items


# ---------------------------------------------------------------------------
# Verification Engine
# ---------------------------------------------------------------------------

class TextbookVerifier:
    def __init__(self, textbook_dir: Path, complete_file: Path, verbose: bool = False):
        self.textbook_dir = textbook_dir
        self.complete_file = complete_file
        self.verbose = verbose
        self.chapter_files: Dict[int, Path] = {}
        self.chapter_texts: Dict[int, str] = {}
        self.complete_text: str = ""
        self.items: List[CheckItem] = build_check_inventory()
        self.compiled_patterns: Dict[str, Pattern] = {}

    def discover_files(self) -> Tuple[int, bool]:
        """Discovers existing chapter files and COMPLETE_TEXTBOOK.md."""
        found_chapters = 0
        if self.textbook_dir.exists():
            for ch_def in CHAPTER_DEFINITIONS:
                c_num = ch_def["num"]
                prefix = ch_def["prefix"]
                # Match ch01_*.md or ch01.md or exact slug
                matches = list(self.textbook_dir.glob(f"{prefix}*.md"))
                if matches:
                    self.chapter_files[c_num] = matches[0]
                    found_chapters += 1

        complete_found = self.complete_file.exists()
        return found_chapters, complete_found

    def load_content(self):
        """Loads UTF-8 text from discovered files."""
        for c_num, path in self.chapter_files.items():
            try:
                self.chapter_texts[c_num] = path.read_text(encoding="utf-8", errors="replace")
            except Exception as e:
                self.chapter_texts[c_num] = ""
                print(red(f"Error reading {path}: {e}"), file=sys.stderr)

        if self.complete_file.exists():
            try:
                self.complete_text = self.complete_file.read_text(encoding="utf-8", errors="replace")
            except Exception as e:
                self.complete_text = ""
                print(red(f"Error reading {self.complete_file}: {e}"), file=sys.stderr)

    def _get_compiled(self, pat_str: str) -> Pattern:
        if pat_str not in self.compiled_patterns:
            self.compiled_patterns[pat_str] = re.compile(pat_str, re.IGNORECASE | re.DOTALL)
        return self.compiled_patterns[pat_str]

    def _test_patterns(self, text: str, patterns: List[str]) -> Tuple[bool, Optional[str]]:
        """Tests if any pattern matches the given text, returning (matched, snippet)."""
        if not text:
            return False, None
        for pat_str in patterns:
            try:
                regex = self._get_compiled(pat_str)
                m = regex.search(text)
                if m:
                    # Extract surrounding snippet
                    start = max(0, m.start() - 30)
                    end = min(len(text), m.end() + 30)
                    snippet = text[start:end].replace("\n", " ").strip()
                    return True, snippet
            except re.error as err:
                print(red(f"Invalid regex '{pat_str}': {err}"), file=sys.stderr)
        return False, None

    def run(self, category_filter: Optional[str] = None, chapter_filter: Optional[int] = None) -> VerificationResult:
        found_chapters, complete_found = self.discover_files()
        self.load_content()

        result = VerificationResult()
        result.chapters_found = found_chapters
        result.complete_textbook_found = complete_found
        result.complete_textbook_size = len(self.complete_text)

        # Filter items if requested
        active_items = self.items
        if category_filter:
            active_items = [it for it in active_items if category_filter.lower() in it.category.lower()]
        if chapter_filter is not None:
            active_items = [it for it in active_items if it.chapter_num == chapter_filter]

        result.total_checks = len(active_items)

        # Initialize category summaries
        for it in active_items:
            if it.category not in result.categories:
                result.categories[it.category] = CategorySummary(it.category)
            result.categories[it.category].total += 1

        for it in active_items:
            c_num = it.chapter_num

            # Check individual chapter file
            if c_num is not None:
                ch_text = self.chapter_texts.get(c_num, "")
                matched, snippet = self._test_patterns(ch_text, it.patterns)
                it.found_in_chapter = matched
                if matched:
                    it.matched_file = str(self.chapter_files[c_num].name) if c_num in self.chapter_files else f"ch{c_num:02d}"
                    it.snippet = snippet

            # Check COMPLETE_TEXTBOOK.md
            if complete_found and self.complete_text:
                matched_c, snippet_c = self._test_patterns(self.complete_text, it.patterns)
                it.found_in_complete = matched_c
                if matched_c and not it.snippet:
                    it.matched_file = self.complete_file.name
                    it.snippet = snippet_c
            else:
                it.found_in_complete = False

            # Evaluation
            cat_sum = result.categories[it.category]
            if it.passed:
                result.total_passed += 1
                cat_sum.passed += 1
                result.passing_items.append({
                    "category": it.category,
                    "name": it.name,
                    "description": it.description,
                    "chapter": f"ch{it.chapter_num:02d}" if it.chapter_num else "Global",
                    "matched_file": it.matched_file or "",
                    "snippet": it.snippet or "",
                })
            else:
                result.total_failed += 1
                cat_sum.failed += 1

                # Diagnose exact gap reason
                reasons = []
                if c_num is not None and c_num not in self.chapter_files:
                    reasons.append(f"Chapter file ch{c_num:02d} is missing")
                elif c_num is not None and not it.found_in_chapter:
                    reasons.append(f"Missing in {self.chapter_files[c_num].name}")

                if it.required_in_complete and not complete_found:
                    reasons.append("COMPLETE_TEXTBOOK.md is missing")
                elif it.required_in_complete and not it.found_in_complete:
                    reasons.append("Missing in COMPLETE_TEXTBOOK.md")

                result.gaps.append({
                    "category": it.category,
                    "name": it.name,
                    "description": it.description,
                    "chapter": f"ch{it.chapter_num:02d}" if it.chapter_num else "Global",
                    "reason": "; ".join(reasons) if reasons else "Pattern did not match",
                })

        return result


# ---------------------------------------------------------------------------
# CLI & Presentation
# ---------------------------------------------------------------------------

def print_banner():
    banner = """
================================================================================
     AssemblySim - Academic Textbook Zero-Loss Coverage Verifier
================================================================================
"""
    print(bold(cyan(banner.strip())))


def print_report(res: VerificationResult, verbose: bool = False):
    print("\n" + bold("--- File Discovery Status ---"))
    ch_color = green if res.chapters_found == res.chapters_expected else red
    print(f"Chapter Files (15 expected):  {ch_color(f'{res.chapters_found} / {res.chapters_expected} found')}")

    ct_color = green if res.complete_textbook_found else red
    ct_status = f"FOUND ({res.complete_textbook_size:,} chars)" if res.complete_textbook_found else "NOT FOUND"
    print(f"COMPLETE_TEXTBOOK.md:        {ct_color(ct_status)}")

    print("\n" + bold("--- Category Breakdown ---"))
    print(f"{'Category':<28} {'Total':<8} {'Passed':<8} {'Failed':<8} {'Coverage'}")
    print("-" * 72)
    for cat_name, cat in sorted(res.categories.items()):
        pct_str = f"{cat.pct:6.1f}%"
        pct_color = green if cat.failed == 0 else (yellow if cat.pct >= 80.0 else red)
        print(f"{cat.name:<28} {cat.total:<8} {cat.passed:<8} {cat.failed:<8} {pct_color(pct_str)}")

    print("-" * 72)
    total_pct = (res.total_passed / res.total_checks * 100.0) if res.total_checks > 0 else 0.0
    tot_color = green if res.total_failed == 0 else red
    print(bold(f"{'TOTAL SCORECARD':<28} {res.total_checks:<8} {res.total_passed:<8} {res.total_failed:<8} {tot_color(f'{total_pct:6.1f}%')}"))

    # Verbose passing list
    if verbose and res.passing_items:
        print("\n" + bold(green("--- Passing Items (Verbose Mode) ---")))
        for item in res.passing_items:
            print(f"  {green('✓')} [{item['category']}] ({item['chapter']}) {bold(item['name'])}: {item['description']}")
            if item["snippet"]:
                print(f"      Matched: \"...{item['snippet']}...\" in {item['matched_file']}")

    # Actionable Gap Report
    if res.gaps:
        print("\n" + bold(red("================================================================================")))
        print(bold(red(f"                    ACTIONABLE GAP REPORT ({len(res.gaps)} ITEMS MISSING)")))
        print(bold(red("================================================================================")))
        current_cat = None
        for gap in res.gaps:
            if gap["category"] != current_cat:
                current_cat = gap["category"]
                print(f"\n{bold(yellow(f'[{current_cat}]'))}")
            print(f"  {red('✗')} ({gap['chapter']}) {bold(gap['name'])}")
            print(f"      Description: {gap['description']}")
            print(f"      Diagnosis:   {cyan(gap['reason'])}")
        print("\n" + red(f"VERIFICATION STATUS: FAILED ({len(res.gaps)} gaps detected across textbook)."))
    else:
        print("\n" + bold(green("================================================================================")))
        print(bold(green("             VERIFICATION PASSED: 100% ZERO-LOSS COVERAGE SATISFIED")))
        print(bold(green("================================================================================")))
        print(green(f"All {res.total_checks} required concepts, architectures, formulas, and tables are present!"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Verify comprehensive coverage of course materials in the AssemblySim Microprocessors textbook."
    )
    parser.add_argument(
        "--textbook-dir",
        type=Path,
        default=Path("docs/textbook"),
        help="Directory containing ch01 to ch15 markdown files (default: docs/textbook)",
    )
    parser.add_argument(
        "--complete-file",
        type=Path,
        default=Path("docs/textbook/COMPLETE_TEXTBOOK.md"),
        help="Path to COMPLETE_TEXTBOOK.md (default: docs/textbook/COMPLETE_TEXTBOOK.md)",
    )
    parser.add_argument(
        "--category",
        type=str,
        default=None,
        help="Filter checks by category (e.g. Keywords, Architecture, Formulas, Addressing, Instructions, Tables)",
    )
    parser.add_argument(
        "--chapter",
        type=int,
        default=None,
        choices=range(1, 16),
        help="Filter checks by chapter number (1 to 15)",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Display all passing check items along with gaps",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output raw JSON results for CI integration",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    verifier = TextbookVerifier(
        textbook_dir=args.textbook_dir,
        complete_file=args.complete_file,
        verbose=args.verbose,
    )

    result = verifier.run(
        category_filter=args.category,
        chapter_filter=args.chapter,
    )

    if args.json:
        # Machine-readable output
        out_dict = {
            "total_checks": result.total_checks,
            "total_passed": result.total_passed,
            "total_failed": result.total_failed,
            "coverage_percentage": (result.total_passed / result.total_checks * 100.0) if result.total_checks > 0 else 0.0,
            "chapters_found": result.chapters_found,
            "chapters_expected": result.chapters_expected,
            "complete_textbook_found": result.complete_textbook_found,
            "complete_textbook_size": result.complete_textbook_size,
            "categories": {k: asdict(v) for k, v in result.categories.items()},
            "gaps": result.gaps,
        }
        print(json.dumps(out_dict, indent=2, ensure_ascii=False))
    else:
        print_banner()
        print_report(result, verbose=args.verbose)

    # Exit code: 0 if 100% passed, 1 if any failure
    if result.total_failed > 0 or result.chapters_found < result.chapters_expected or not result.complete_textbook_found:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
