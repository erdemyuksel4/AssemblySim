/**
 * clozeData.ts
 * Comprehensive Question Bank for the AssemblySim Cloze (Fill-in-the-Blank) Testing Notebook.
 * Contains 168 authentic English cloze questions (24 per week for Weeks 1 through 7),
 * directly derived from official Microprocessor course slides (Barry B. Brey & William Stallings).
 */

import { ClozeQuestion } from './clozeTypes.js';

export const CLOZE_QUESTIONS: ClozeQuestion[] = [
  {
    "id": "cloze_w1_001",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "The Microprocessor-Based Computer System",
    "slideNumber": 5,
    "sourceSentence": "The microprocessor (MP) is the controlling element of a computer system.",
    "template": "The {{b1}} is the controlling element of a computer system.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "microprocessor",
        "acceptedAnswers": [
          "microprocessor",
          "mp",
          "cpu",
          "central processing unit"
        ],
        "hint": "The single integrated circuit controlling the system (or 2-letter abbreviation)"
      }
    ],
    "explanation": "Barry B. Brey, Week 1, Slide 5: The microprocessor (MP) or Central Processing Unit (CPU) controls memory and I/O through bus connections."
  },
  {
    "id": "cloze_w1_002",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Buses & System Interconnect",
    "slideNumber": 6,
    "sourceSentence": "A bus is a set of common connections that carry the same type of information between blocks.",
    "template": "A {{b1}} is a set of common connections that carry the same type of information between blocks.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "bus",
        "acceptedAnswers": [
          "bus",
          "system bus",
          "buses"
        ],
        "hint": "Shared signal pathways linking functional blocks"
      }
    ],
    "explanation": "Week 1, Slide 6: A bus provides the shared physical electrical lines linking the CPU to memory and peripherals."
  },
  {
    "id": "cloze_w1_003",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Buses & System Interconnect",
    "slideNumber": 6,
    "sourceSentence": "Three named buses link the microprocessor to memory and to the I/O system.",
    "template": "{{b1}} named buses link the microprocessor to memory and to the I/O system.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "Three",
        "acceptedAnswers": [
          "three",
          "3"
        ],
        "hint": "Number of fundamental system buses"
      }
    ],
    "explanation": "Week 1, Slide 6: The system bus consists of three buses: address bus, data bus, and control bus."
  },
  {
    "id": "cloze_w1_004",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Address Bus Architecture",
    "slideNumber": 7,
    "sourceSentence": "The address bus carries the memory or I/O address the MP wants to access.",
    "template": "The {{b1}} carries the memory or I/O address the MP wants to access.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "address bus",
        "acceptedAnswers": [
          "address bus",
          "address"
        ],
        "hint": "Bus designating which memory location or port is selected"
      }
    ],
    "explanation": "Week 1, Slide 7: The address bus carries binary addresses from the processor to memory and I/O devices."
  },
  {
    "id": "cloze_w1_005",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Address Bus Architecture",
    "slideNumber": 7,
    "sourceSentence": "The address bus is one-directional: only the MP places addresses on it.",
    "template": "The address bus is {{b1}}: only the MP places addresses on it.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "one-directional",
        "acceptedAnswers": [
          "one-directional",
          "unidirectional",
          "one directional",
          "single-directional"
        ],
        "hint": "Signals travel in only one direction from CPU to memory/IO"
      }
    ],
    "explanation": "Week 1, Slide 7: In normal operations, only the microprocessor asserts memory and I/O addresses on the address bus."
  },
  {
    "id": "cloze_w1_006",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Data Bus Architecture",
    "slideNumber": 7,
    "sourceSentence": "The data bus carries the actual value being transferred and is bidirectional.",
    "template": "The {{b1}} carries the actual value being transferred and is bidirectional.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "data bus",
        "acceptedAnswers": [
          "data bus",
          "data"
        ],
        "hint": "Bus that carries the content bytes/words between devices"
      }
    ],
    "explanation": "Week 1, Slide 7: The data bus is bidirectional because the CPU can both read from and write to memory/IO."
  },
  {
    "id": "cloze_w1_007",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Control Bus Architecture",
    "slideNumber": 7,
    "sourceSentence": "The control bus carries timing and read/write signals that keep the transfer synchronized.",
    "template": "The {{b1}} carries timing and read/write signals that keep the transfer synchronized.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "control bus",
        "acceptedAnswers": [
          "control bus",
          "control"
        ],
        "hint": "Bus carrying synchronization, timing, and read/write strobes"
      }
    ],
    "explanation": "Week 1, Slide 7: The control bus synchronizes data movement across the address and data lines."
  },
  {
    "id": "cloze_w1_008",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Address Space Calculation",
    "slideNumber": 8,
    "sourceSentence": "An n-bit address bus can address 2^n unique memory locations.",
    "template": "An n-bit address bus can address {{b1}} unique memory locations.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "2^n",
        "acceptedAnswers": [
          "2^n",
          "2 to the power of n",
          "2^n locations",
          "two to the n"
        ],
        "hint": "Formula expressing maximum addressable locations with n lines"
      }
    ],
    "explanation": "Week 1, Slide 8: The binary addressing capacity formula is 2^n unique addressable locations for an n-bit address bus."
  },
  {
    "id": "cloze_w1_009",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Address Space Calculation",
    "slideNumber": 8,
    "sourceSentence": "The 8086 has a 20-bit address bus, which can address 1MB of memory.",
    "template": "The 8086 has a 20-bit address bus, which can address {{b1}} of memory.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "1MB",
        "acceptedAnswers": [
          "1mb",
          "1 mb",
          "1 megabyte",
          "1,048,576 bytes",
          "1048576 bytes"
        ],
        "hint": "Total memory capacity with 20 address lines (2^20 bytes)"
      }
    ],
    "explanation": "Week 1, Slide 8: 2^20 = 1,048,576 bytes = 1 Megabyte (1MB) of physical memory space."
  },
  {
    "id": "cloze_w1_010",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Data Bus Width",
    "slideNumber": 9,
    "sourceSentence": "The 8086 microprocessor has a 16-bit wide data bus.",
    "template": "The 8086 microprocessor has a {{b1}} wide data bus.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "16-bit",
        "acceptedAnswers": [
          "16-bit",
          "16 bit",
          "16 bits",
          "16"
        ],
        "hint": "Number of parallel data lines on the 8086 chip"
      }
    ],
    "explanation": "Week 1, Slide 9: The 8086 transfers 16 bits (one word) of data per memory transfer cycle."
  },
  {
    "id": "cloze_w1_011",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "PC Memory Map",
    "slideNumber": 11,
    "sourceSentence": "The first 1MB of memory in the classic PC is divided into the Transient Program Area and the System Area.",
    "template": "The first 1MB of memory in the classic PC is divided into the {{b1}} and the System Area.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "Transient Program Area",
        "acceptedAnswers": [
          "transient program area",
          "tpa",
          "transient program area (tpa)"
        ],
        "hint": "640KB DOS application area (or 3-letter acronym)"
      }
    ],
    "explanation": "Week 1, Slide 11: The lower 640KB of memory is the Transient Program Area (TPA) where DOS and user applications run."
  },
  {
    "id": "cloze_w1_012",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "PC Memory Map",
    "slideNumber": 11,
    "sourceSentence": "The Transient Program Area (TPA) spans from address 00000H to 9FFFFH, totaling 640KB.",
    "template": "The Transient Program Area (TPA) spans from address 00000H to 9FFFFH, totaling {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "640KB",
        "acceptedAnswers": [
          "640kb",
          "640 kb",
          "640 kilobytes",
          "640k"
        ],
        "hint": "Famous conventional memory size limit in classic PCs"
      }
    ],
    "explanation": "Week 1, Slide 11: 00000H to 9FFFFH contains exactly 640 Kilobytes of conventional user RAM."
  },
  {
    "id": "cloze_w1_013",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "PC Memory Map",
    "slideNumber": 11,
    "sourceSentence": "The System Area occupies 384KB of memory, extending from address A0000H to FFFFFH.",
    "template": "The System Area occupies {{b1}} of memory, extending from address A0000H to FFFFFH.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "384KB",
        "acceptedAnswers": [
          "384kb",
          "384 kb",
          "384 kilobytes",
          "384k"
        ],
        "hint": "Reserved memory size: 1024KB - 640KB"
      }
    ],
    "explanation": "Week 1, Slide 11: The Upper Memory Area (System Area) spans 384KB for video RAM, controller ROMs, and BIOS."
  },
  {
    "id": "cloze_w1_014",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "PC Memory Map",
    "slideNumber": 14,
    "sourceSentence": "Video display adapter RAM is located in the System Area starting at address A0000H.",
    "template": "Video display adapter RAM is located in the System Area starting at address {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "A0000H",
        "acceptedAnswers": [
          "a0000h",
          "a0000",
          "0xa0000"
        ],
        "hint": "Base hexadecimal 20-bit address for video memory"
      }
    ],
    "explanation": "Week 1, Slide 14: Video RAM occupies A0000H to C7FFFH in the system memory map."
  },
  {
    "id": "cloze_w1_015",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "PC Memory Map",
    "slideNumber": 15,
    "sourceSentence": "System ROM BIOS is permanently located at the top of the System Area starting at address F0000H.",
    "template": "System ROM BIOS is permanently located at the top of the System Area starting at address {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "F0000H",
        "acceptedAnswers": [
          "f0000h",
          "f0000",
          "0xf0000"
        ],
        "hint": "Hex address where the 64KB motherboard BIOS ROM resides"
      }
    ],
    "explanation": "Week 1, Slide 15: F0000H to FFFFFH houses the system BIOS ROM containing reset startup code."
  },
  {
    "id": "cloze_w1_016",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "I/O Address Space",
    "slideNumber": 17,
    "sourceSentence": "The classic PC supports an I/O space of 64K addresses, ranging from 0000H to FFFFH.",
    "template": "The classic PC supports an I/O space of {{b1}} addresses, ranging from 0000H to FFFFH.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "64K",
        "acceptedAnswers": [
          "64k",
          "64 k",
          "64kb",
          "65536",
          "64k ports"
        ],
        "hint": "Number of I/O port addresses available with 16-bit port addressing"
      }
    ],
    "explanation": "Week 1, Slide 17: The 8086 I/O space contains 65,536 (64K) individual 8-bit ports accessed via IN/OUT."
  },
  {
    "id": "cloze_w1_017",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Instruction Execution Cycle",
    "slideNumber": 19,
    "sourceSentence": "The basic operation of the microprocessor consists of the fetch, decode, and execute cycle.",
    "template": "The basic operation of the microprocessor consists of the {{b1}} cycle.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "fetch, decode, and execute",
        "acceptedAnswers": [
          "fetch, decode, and execute",
          "fetch decode execute",
          "fetch-decode-execute",
          "instruction"
        ],
        "hint": "Three-step cycle the CPU continuously repeats"
      }
    ],
    "explanation": "Week 1, Slide 19: The microprocessor continuously fetches instructions from memory, decodes opcodes, and executes them."
  },
  {
    "id": "cloze_w1_018",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Data Widths",
    "slideNumber": 22,
    "sourceSentence": "In modern computer systems, a byte consists of 8 bits.",
    "template": "In modern computer systems, a byte consists of {{b1}} bits.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "8",
        "acceptedAnswers": [
          "8",
          "eight"
        ],
        "hint": "Fundamental atomic data width in x86"
      }
    ],
    "explanation": "Week 1, Slide 22: A byte is the smallest directly addressable unit in x86 memory, composed of 8 bits."
  },
  {
    "id": "cloze_w1_019",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Data Widths",
    "slideNumber": 22,
    "sourceSentence": "A word consists of 16 bits or two consecutive bytes.",
    "template": "A word consists of {{b1}} bits or two consecutive bytes.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "16",
        "acceptedAnswers": [
          "16",
          "sixteen"
        ],
        "hint": "Bit length of an x86 word"
      }
    ],
    "explanation": "Week 1, Slide 22: In x86 terminology, a WORD is strictly 16 bits (2 bytes)."
  },
  {
    "id": "cloze_w1_020",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Data Widths",
    "slideNumber": 22,
    "sourceSentence": "A doubleword (dword) consists of 32 bits or four bytes.",
    "template": "A doubleword (dword) consists of {{b1}} bits or four bytes.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "32",
        "acceptedAnswers": [
          "32",
          "thirty-two",
          "thirty two"
        ],
        "hint": "Bit width of a DWORD"
      }
    ],
    "explanation": "Week 1, Slide 22: A doubleword (DWORD) is 32 bits, equivalent to two 16-bit words or four 8-bit bytes."
  },
  {
    "id": "cloze_w1_021",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Data Widths",
    "slideNumber": 22,
    "sourceSentence": "A quadword (qword) consists of 64 bits or eight bytes.",
    "template": "A quadword (qword) consists of {{b1}} bits or eight bytes.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "64",
        "acceptedAnswers": [
          "64",
          "sixty-four",
          "sixty four"
        ],
        "hint": "Bit width of a QWORD"
      }
    ],
    "explanation": "Week 1, Slide 22: A quadword (QWORD) is 64 bits (8 bytes), introduced in 64-bit architectures."
  },
  {
    "id": "cloze_w1_022",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Complements & Representation",
    "slideNumber": 37,
    "sourceSentence": "In two's complement notation, the negative of a number is formed by inverting all bits and adding 1.",
    "template": "In two's complement notation, the negative of a number is formed by inverting all bits and {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "adding 1",
        "acceptedAnswers": [
          "adding 1",
          "add 1",
          "+ 1",
          "+1",
          "adding one"
        ],
        "hint": "Final mathematical operation after bitwise NOT"
      }
    ],
    "explanation": "Week 1, Slide 37: Two's complement = one's complement (inverting all bits) + 1."
  },
  {
    "id": "cloze_w1_023",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "Character Encoding",
    "slideNumber": 38,
    "sourceSentence": "Standard ASCII encodes characters using 7 bits, representing 128 unique codes.",
    "template": "Standard ASCII encodes characters using {{b1}} bits, representing 128 unique codes.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "7",
        "acceptedAnswers": [
          "7",
          "7 bits",
          "seven"
        ],
        "hint": "Number of bits in standard ASCII"
      }
    ],
    "explanation": "Week 1, Slide 38: Standard ASCII uses 7 bits (00H to 7FH, 128 codes); extended ASCII uses the 8th bit for 256 characters."
  },
  {
    "id": "cloze_w1_024",
    "week": 1,
    "weekTitle": "Week 1 - Microprocessors and the Computer",
    "topic": "BCD Representation",
    "slideNumber": 40,
    "sourceSentence": "Packed BCD stores two decimal digits per byte, whereas unpacked BCD stores one digit per byte.",
    "template": "{{b1}} stores two decimal digits per byte, whereas unpacked BCD stores one digit per byte.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "Packed BCD",
        "acceptedAnswers": [
          "packed bcd",
          "packed"
        ],
        "hint": "BCD format packing two nibble digits into one byte"
      }
    ],
    "explanation": "Week 1, Slide 40: Packed BCD stores two decimal digits (0-9) per 8-bit byte using upper and lower nibbles."
  },
  {
    "id": "cloze_w2_001",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Programming Model",
    "slideNumber": 6,
    "sourceSentence": "Registers are classified as program-visible or program-invisible.",
    "template": "Registers are classified as {{b1}} or program-invisible.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "program-visible",
        "acceptedAnswers": [
          "program-visible",
          "program visible",
          "visible"
        ],
        "hint": "Registers directly accessible by assembly instructions"
      }
    ],
    "explanation": "Week 2, Slide 6: Program-visible registers can be directly read or written by software; program-invisible registers are used internally by the CPU."
  },
  {
    "id": "cloze_w2_002",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Register Hierarchy",
    "slideNumber": 8,
    "sourceSentence": "The 64-bit register RAX contains the 32-bit register EAX, which contains the 16-bit register AX.",
    "template": "The 64-bit register {{b1}} contains the 32-bit register EAX, which contains the 16-bit register AX.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "RAX",
        "acceptedAnswers": [
          "rax",
          "rax register"
        ],
        "hint": "64-bit accumulator register name"
      }
    ],
    "explanation": "Week 2, Slide 8: The nested register hierarchy embeds 16-bit AX inside 32-bit EAX inside 64-bit RAX."
  },
  {
    "id": "cloze_w2_003",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Register Hierarchy",
    "slideNumber": 8,
    "sourceSentence": "The 16-bit register AX is split into two 8-bit registers: AH for the high byte and AL for the low byte.",
    "template": "The 16-bit register AX is split into two 8-bit registers: {{b1}} for the high byte and AL for the low byte.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "AH",
        "acceptedAnswers": [
          "ah",
          "ah (high byte)",
          "ah register"
        ],
        "hint": "Upper 8-bit register of AX (bits 8..15)"
      }
    ],
    "explanation": "Week 2, Slide 8: AX is subdivided into AH (bits 8-15) and AL (bits 0-7)."
  },
  {
    "id": "cloze_w2_004",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Register Hierarchy",
    "slideNumber": 9,
    "sourceSentence": "The 64-bit architecture added eight extended registers named R8 through R15.",
    "template": "The 64-bit architecture added eight extended registers named {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "R8 through R15",
        "acceptedAnswers": [
          "r8 through r15",
          "r8-r15",
          "r8 to r15",
          "r8..r15"
        ],
        "hint": "Numbering range of the 8 additional general registers"
      }
    ],
    "explanation": "Week 2, Slide 9: 64-bit mode doubled the general-purpose register count by adding R8 through R15."
  },
  {
    "id": "cloze_w2_005",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Multipurpose Registers",
    "slideNumber": 11,
    "sourceSentence": "The AX register is referred to as the accumulator and is used for arithmetic, logic, and I/O operations.",
    "template": "The AX register is referred to as the {{b1}} and is used for arithmetic, logic, and I/O operations.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "accumulator",
        "acceptedAnswers": [
          "accumulator",
          "primary accumulator",
          "acc"
        ],
        "hint": "Primary register for multiplication, division, and IN/OUT"
      }
    ],
    "explanation": "Week 2, Slide 11: AX (Accumulator) is optimized for arithmetic, logic, and external I/O transfers."
  },
  {
    "id": "cloze_w2_006",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Multipurpose Registers",
    "slideNumber": 12,
    "sourceSentence": "The BX register is called the base register because it can hold the base offset address of data in memory.",
    "template": "The BX register is called the {{b1}} because it can hold the base offset address of data in memory.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "base register",
        "acceptedAnswers": [
          "base register",
          "base",
          "base-register"
        ],
        "hint": "Register whose name stands for 'Base'"
      }
    ],
    "explanation": "Week 2, Slide 12: BX (Base) holds base offset addresses in indirect, based, and table lookup addressing."
  },
  {
    "id": "cloze_w2_007",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Multipurpose Registers",
    "slideNumber": 13,
    "sourceSentence": "The CX register is known as the count register and is used as a counter for loop instructions and shifts.",
    "template": "The CX register is known as the {{b1}} and is used as a counter for loop instructions and shifts.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "count register",
        "acceptedAnswers": [
          "count register",
          "count",
          "counter"
        ],
        "hint": "Register dedicated to iteration and string repetition counting"
      }
    ],
    "explanation": "Week 2, Slide 13: CX acts as the loop iteration counter and shift/rotate bit-count register (CL)."
  },
  {
    "id": "cloze_w2_008",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Multipurpose Registers",
    "slideNumber": 14,
    "sourceSentence": "The DX register is called the data register and holds the most significant half of wide products and variable I/O port addresses.",
    "template": "The DX register is called the {{b1}} and holds the most significant half of wide products and variable I/O port addresses.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "data register",
        "acceptedAnswers": [
          "data register",
          "data"
        ],
        "hint": "General register holding DX:AX products and port numbers"
      }
    ],
    "explanation": "Week 2, Slide 14: DX holds the high word in 32-bit arithmetic and holds 16-bit I/O port numbers for IN/OUT."
  },
  {
    "id": "cloze_w2_009",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Multipurpose Registers",
    "slideNumber": 15,
    "sourceSentence": "The BP register is the base pointer, primarily used to access parameters and local variables on the stack.",
    "template": "The BP register is the {{b1}}, primarily used to access parameters and local variables on the stack.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "base pointer",
        "acceptedAnswers": [
          "base pointer",
          "bp"
        ],
        "hint": "Pointer register referencing stack frame locations"
      }
    ],
    "explanation": "Week 2, Slide 15: BP defaults to the stack segment (SS), making it ideal for stack frame activation records."
  },
  {
    "id": "cloze_w2_010",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Multipurpose Registers",
    "slideNumber": 16,
    "sourceSentence": "The SI and DI registers are the source index and destination index, used for index addressing and string operations.",
    "template": "The SI and DI registers are the source index and {{b1}}, used for index addressing and string operations.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "destination index",
        "acceptedAnswers": [
          "destination index",
          "di",
          "destination"
        ],
        "hint": "Register paired with ES for string destinations"
      }
    ],
    "explanation": "Week 2, Slide 16: DI (Destination Index) pairs with ES:DI to address string destinations in memory."
  },
  {
    "id": "cloze_w2_011",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Special Registers & Flags",
    "slideNumber": 18,
    "sourceSentence": "The IP register is the instruction pointer, pointing to the offset of the next instruction to be fetched.",
    "template": "The IP register is the {{b1}}, pointing to the offset of the next instruction to be fetched.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "instruction pointer",
        "acceptedAnswers": [
          "instruction pointer",
          "ip",
          "program counter",
          "pc"
        ],
        "hint": "Register holding the offset of the next instruction byte"
      }
    ],
    "explanation": "Week 2, Slide 18: IP always holds the offset address in CS of the next instruction to execute."
  },
  {
    "id": "cloze_w2_012",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Special Registers & Flags",
    "slideNumber": 19,
    "sourceSentence": "The SP register is the stack pointer, pointing to the current top of the stack in memory.",
    "template": "The SP register is the {{b1}}, pointing to the current top of the stack in memory.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "stack pointer",
        "acceptedAnswers": [
          "stack pointer",
          "sp"
        ],
        "hint": "Register pointing to the last word pushed onto the stack"
      }
    ],
    "explanation": "Week 2, Slide 19: SP maintains the offset address of the current top of the stack in SS."
  },
  {
    "id": "cloze_w2_013",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Status Flags",
    "slideNumber": 20,
    "sourceSentence": "The carry flag (CF) indicates a carry out of the most significant bit or a borrow in subtraction.",
    "template": "The {{b1}} indicates a carry out of the most significant bit or a borrow in subtraction.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "carry flag",
        "acceptedAnswers": [
          "carry flag",
          "cf",
          "carry"
        ],
        "hint": "Flag signaling unsigned overflow or borrow"
      }
    ],
    "explanation": "Week 2, Slide 20: CF is set when an addition generates a carry out of MSB or subtraction requires a borrow."
  },
  {
    "id": "cloze_w2_014",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Status Flags",
    "slideNumber": 21,
    "sourceSentence": "The zero flag (ZF) is set to 1 if the result of an arithmetic or logic operation is zero.",
    "template": "The {{b1}} is set to 1 if the result of an arithmetic or logic operation is zero.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "zero flag",
        "acceptedAnswers": [
          "zero flag",
          "zf",
          "zero"
        ],
        "hint": "Flag set when an ALU result equals zero"
      }
    ],
    "explanation": "Week 2, Slide 21: ZF=1 indicates the ALU result is zero; ZF=0 indicates a non-zero result."
  },
  {
    "id": "cloze_w2_015",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Status Flags",
    "slideNumber": 22,
    "sourceSentence": "The sign flag (SF) indicates the sign of the result, set equal to the most significant bit.",
    "template": "The {{b1}} indicates the sign of the result, set equal to the most significant bit.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "sign flag",
        "acceptedAnswers": [
          "sign flag",
          "sf",
          "sign"
        ],
        "hint": "Flag that directly copies MSB (1 for negative, 0 for positive)"
      }
    ],
    "explanation": "Week 2, Slide 22: SF directly copies the most significant bit of the result."
  },
  {
    "id": "cloze_w2_016",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Status Flags",
    "slideNumber": 23,
    "sourceSentence": "The overflow flag (OF) is set when a signed arithmetic operation yields a result too large for the destination.",
    "template": "The {{b1}} is set when a signed arithmetic operation yields a result too large for the destination.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "overflow flag",
        "acceptedAnswers": [
          "overflow flag",
          "of",
          "overflow"
        ],
        "hint": "Flag detecting signed out-of-range arithmetic results"
      }
    ],
    "explanation": "Week 2, Slide 23: OF indicates signed arithmetic overflow (e.g. adding two positives yields a negative)."
  },
  {
    "id": "cloze_w2_017",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Control Flags",
    "slideNumber": 24,
    "sourceSentence": "The direction flag (DF) controls whether string instructions increment or decrement index registers.",
    "template": "The {{b1}} controls whether string instructions increment or decrement index registers.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "direction flag",
        "acceptedAnswers": [
          "direction flag",
          "df",
          "direction"
        ],
        "hint": "Flag manipulated by CLD (clear) and STD (set)"
      }
    ],
    "explanation": "Week 2, Slide 24: DF=0 (CLD) auto-increments SI and DI; DF=1 (STD) auto-decrements them."
  },
  {
    "id": "cloze_w2_018",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Control Flags",
    "slideNumber": 25,
    "sourceSentence": "The interrupt flag (IF) controls whether external maskable hardware interrupts are recognized by the CPU.",
    "template": "The {{b1}} controls whether external maskable hardware interrupts are recognized by the CPU.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "interrupt flag",
        "acceptedAnswers": [
          "interrupt flag",
          "if",
          "interrupt"
        ],
        "hint": "Flag enabled by STI and disabled by CLI"
      }
    ],
    "explanation": "Week 2, Slide 25: When IF=1 (STI), maskable INTR interrupts are accepted; when IF=0 (CLI), they are ignored."
  },
  {
    "id": "cloze_w2_019",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Segment Registers",
    "slideNumber": 28,
    "sourceSentence": "The CS register is the code segment register, which stores the base segment address of the executable instructions.",
    "template": "The CS register is the {{b1}} register, which stores the base segment address of the executable instructions.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "code segment",
        "acceptedAnswers": [
          "code segment",
          "code segment (cs)",
          "code"
        ],
        "hint": "Segment register holding machine code base address"
      }
    ],
    "explanation": "Week 2, Slide 28: CS holds the base segment address for the code section containing executing instructions."
  },
  {
    "id": "cloze_w2_020",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Segment Registers",
    "slideNumber": 29,
    "sourceSentence": "The DS register is the data segment register, storing the base address of variables and data in memory.",
    "template": "The DS register is the {{b1}} register, storing the base address of variables and data in memory.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "data segment",
        "acceptedAnswers": [
          "data segment",
          "data segment (ds)",
          "data"
        ],
        "hint": "Segment register holding program variables and global data"
      }
    ],
    "explanation": "Week 2, Slide 29: DS holds the starting segment address for program data and variables."
  },
  {
    "id": "cloze_w2_021",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Segment Registers",
    "slideNumber": 30,
    "sourceSentence": "The SS register is the stack segment register, defining the memory area assigned to the stack.",
    "template": "The SS register is the {{b1}} register, defining the memory area assigned to the stack.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "stack segment",
        "acceptedAnswers": [
          "stack segment",
          "stack segment (ss)",
          "stack"
        ],
        "hint": "Segment register defining stack storage boundaries"
      }
    ],
    "explanation": "Week 2, Slide 30: SS defines the base of the stack region accessed by SP and BP."
  },
  {
    "id": "cloze_w2_022",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Segment Registers",
    "slideNumber": 31,
    "sourceSentence": "The ES register is the extra segment register, commonly used for destination strings.",
    "template": "The ES register is the {{b1}} register, commonly used for destination strings.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "extra segment",
        "acceptedAnswers": [
          "extra segment",
          "extra segment (es)",
          "extra"
        ],
        "hint": "Supplemental segment register paired with DI for string destinations"
      }
    ],
    "explanation": "Week 2, Slide 31: ES provides additional data storage and is the required destination segment for string ops."
  },
  {
    "id": "cloze_w2_023",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Real-Mode Address Generation",
    "slideNumber": 34,
    "sourceSentence": "In real mode, the 20-bit physical address is computed using the formula: Segment * 10H + Offset.",
    "template": "In real mode, the 20-bit physical address is computed using the formula: {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "Segment * 10H + Offset",
        "acceptedAnswers": [
          "segment * 10h + offset",
          "segment * 16 + offset",
          "segment*10h + offset",
          "segment*16 + offset",
          "segment * 10h + offset",
          "segment * 16h + offset"
        ],
        "hint": "Arithmetic formula multiplying segment by 16 (10H) and adding offset"
      }
    ],
    "explanation": "Week 2, Slide 34: Physical Address = (Segment * 10H) + Offset = (Segment << 4) + Offset."
  },
  {
    "id": "cloze_w2_024",
    "week": 2,
    "weekTitle": "Week 2 - The Microprocessor and Its Architecture",
    "topic": "Real-Mode Address Generation",
    "slideNumber": 36,
    "sourceSentence": "The maximum size of a segment in real mode is 64KB, corresponding to the 16-bit offset range.",
    "template": "The maximum size of a segment in real mode is {{b1}}, corresponding to the 16-bit offset range.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "64KB",
        "acceptedAnswers": [
          "64kb",
          "64 kb",
          "64 kilobytes",
          "65536 bytes",
          "64k"
        ],
        "hint": "Span of memory reachable with a 16-bit offset (2^16 bytes)"
      }
    ],
    "explanation": "Week 2, Slide 36: A 16-bit offset spans from 0000H to FFFFH, allowing exactly 64KB per logical segment."
  },
  {
    "id": "cloze_w3_001",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Data Flow Syntax",
    "slideNumber": 6,
    "sourceSentence": "In Intel syntax, data flows from the source operand to the destination operand: MOV destination, source.",
    "template": "In Intel syntax, data flows from the {{b1}} to the destination operand: MOV destination, source.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "source operand",
        "acceptedAnswers": [
          "source operand",
          "source",
          "src"
        ],
        "hint": "Right-hand operand in Intel syntax"
      }
    ],
    "explanation": "Week 3, Slide 6: In Intel assembly syntax, data moves right-to-left: MOV dest, src."
  },
  {
    "id": "cloze_w3_002",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Data Flow Rules",
    "slideNumber": 7,
    "sourceSentence": "The cardinal rule of the MOV instruction is that it copies data, it never moves or deletes the source.",
    "template": "The cardinal rule of the MOV instruction is that it {{b1}} data, it never moves or deletes the source.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "copies",
        "acceptedAnswers": [
          "copies",
          "copy",
          "duplicates"
        ],
        "hint": "What MOV actually does to source data"
      }
    ],
    "explanation": "Week 3, Slide 7: MOV is a copy operation; the source operand remains completely unchanged."
  },
  {
    "id": "cloze_w3_003",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Data Flow Rules",
    "slideNumber": 7,
    "sourceSentence": "The MOV instruction never affects the condition flags in the flags register.",
    "template": "The MOV instruction never affects the condition {{b1}} in the flags register.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "flags",
        "acceptedAnswers": [
          "flags",
          "flag",
          "status flags"
        ],
        "hint": "Status bits that remain untouched by data moves"
      }
    ],
    "explanation": "Week 3, Slide 7: MOV leaves all CPU condition flags (CF, ZF, SF, OF, AF, PF) strictly unaltered."
  },
  {
    "id": "cloze_w3_004",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Addressing Modes Overview",
    "slideNumber": 8,
    "sourceSentence": "The 8086 microprocessor supports seven distinct data-addressing modes.",
    "template": "The 8086 microprocessor supports {{b1}} distinct data-addressing modes.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "seven",
        "acceptedAnswers": [
          "seven",
          "7"
        ],
        "hint": "Total count of fundamental data-addressing modes in the 8086"
      }
    ],
    "explanation": "Week 3, Slide 8: The 8086 defines 7 data addressing modes from register and immediate to base relative-plus-index."
  },
  {
    "id": "cloze_w3_005",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Data-Addressing Modes",
    "slideNumber": 9,
    "sourceSentence": "In register addressing, the operand is located inside one of the internal CPU registers.",
    "template": "In {{b1}}, the operand is located inside one of the internal CPU registers.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "register addressing",
        "acceptedAnswers": [
          "register addressing",
          "register",
          "register mode"
        ],
        "hint": "Fastest addressing mode using CPU internal storage"
      }
    ],
    "explanation": "Week 3, Slide 9: Register addressing transfers data between internal registers without memory bus cycles (e.g. MOV AX, BX)."
  },
  {
    "id": "cloze_w3_006",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Data-Addressing Modes",
    "slideNumber": 10,
    "sourceSentence": "In immediate addressing, the data is specified directly as a constant value inside the instruction itself.",
    "template": "In {{b1}}, the data is specified directly as a constant value inside the instruction itself.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "immediate addressing",
        "acceptedAnswers": [
          "immediate addressing",
          "immediate",
          "immediate mode"
        ],
        "hint": "Addressing mode encoding constants directly in opcode stream"
      }
    ],
    "explanation": "Week 3, Slide 10: Immediate addressing embeds numeric literals directly in code (e.g. MOV AX, 1234H)."
  },
  {
    "id": "cloze_w3_007",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Data-Addressing Modes",
    "slideNumber": 11,
    "sourceSentence": "In direct addressing, the instruction specifies the exact 16-bit offset address of memory enclosed in brackets.",
    "template": "In {{b1}}, the instruction specifies the exact 16-bit offset address of memory enclosed in brackets.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "direct addressing",
        "acceptedAnswers": [
          "direct addressing",
          "direct",
          "direct mode"
        ],
        "hint": "Addressing mode referencing memory via fixed numerical offset [1234H]"
      }
    ],
    "explanation": "Week 3, Slide 11: Direct addressing encodes the exact 16-bit displacement offset inside brackets: MOV AL, [1000H]."
  },
  {
    "id": "cloze_w3_008",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Data-Addressing Modes",
    "slideNumber": 12,
    "sourceSentence": "In register indirect addressing, the offset address of data in memory is held in a register such as BX, BP, SI, or DI.",
    "template": "In {{b1}}, the offset address of data in memory is held in a register such as BX, BP, SI, or DI.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "register indirect addressing",
        "acceptedAnswers": [
          "register indirect addressing",
          "register indirect",
          "indirect addressing",
          "indirect"
        ],
        "hint": "Mode using a pointer register enclosed in brackets: [BX]"
      }
    ],
    "explanation": "Week 3, Slide 12: Register indirect uses a pointer register (BX, BP, SI, DI) inside brackets to specify the effective address."
  },
  {
    "id": "cloze_w3_009",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Data-Addressing Modes",
    "slideNumber": 13,
    "sourceSentence": "In base-plus-index addressing, the offset address is calculated by adding a base register to an index register.",
    "template": "In {{b1}} addressing, the offset address is calculated by adding a base register to an index register.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "base-plus-index",
        "acceptedAnswers": [
          "base-plus-index",
          "base plus index",
          "based-index",
          "based index"
        ],
        "hint": "Mode combining a base (BX/BP) with an index (SI/DI)"
      }
    ],
    "explanation": "Week 3, Slide 13: Base-plus-index addressing sums base (BX/BP) and index (SI/DI) registers: MOV [BX+SI], AL."
  },
  {
    "id": "cloze_w3_010",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Data-Addressing Modes",
    "slideNumber": 14,
    "sourceSentence": "In register relative addressing, a displacement constant is added to a base or index register.",
    "template": "In {{b1}} addressing, a displacement constant is added to a base or index register.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "register relative",
        "acceptedAnswers": [
          "register relative",
          "relative",
          "register-relative"
        ],
        "hint": "Mode adding a constant offset to a pointer: [BX + 4] or ARRAY[SI]"
      }
    ],
    "explanation": "Week 3, Slide 14: Register relative addressing adds a displacement (8 or 16 bits) to a base or index register."
  },
  {
    "id": "cloze_w3_011",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Data-Addressing Modes",
    "slideNumber": 15,
    "sourceSentence": "In base relative-plus-index addressing, the offset is the sum of a base register, an index register, and a displacement.",
    "template": "In {{b1}} addressing, the offset is the sum of a base register, an index register, and a displacement.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "base relative-plus-index",
        "acceptedAnswers": [
          "base relative-plus-index",
          "base relative plus index",
          "based relative-plus-index"
        ],
        "hint": "Most complex addressing mode combining base, index, and constant displacement"
      }
    ],
    "explanation": "Week 3, Slide 15: Base relative-plus-index adds base (BX/BP), index (SI/DI), and displacement: ARRAY[BX+SI]."
  },
  {
    "id": "cloze_w3_012",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Segment Defaults",
    "slideNumber": 16,
    "sourceSentence": "By default, any memory reference utilizing the BP register uses the stack segment (SS).",
    "template": "By default, any memory reference utilizing the BP register uses the {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "stack segment",
        "acceptedAnswers": [
          "stack segment",
          "ss",
          "stack segment (ss)",
          "stack"
        ],
        "hint": "Segment automatically associated with BP references"
      }
    ],
    "explanation": "Week 3, Slide 16: While BX, SI, and DI default to DS, BP automatically references SS for stack frame parameter access."
  },
  {
    "id": "cloze_w3_013",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Program Memory Addressing",
    "slideNumber": 18,
    "sourceSentence": "A direct far jump modifies both the code segment (CS) and the instruction pointer (IP).",
    "template": "A direct far jump modifies both the {{b1}} and the instruction pointer (IP).",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "code segment",
        "acceptedAnswers": [
          "code segment",
          "cs",
          "code segment (cs)",
          "code"
        ],
        "hint": "Segment register changed during intersegment far jumps"
      }
    ],
    "explanation": "Week 3, Slide 18: An intersegment far jump (JMP FAR PTR) reloads both CS and IP with new targets."
  },
  {
    "id": "cloze_w3_014",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Program Memory Addressing",
    "slideNumber": 19,
    "sourceSentence": "In relative program memory addressing, the target address is calculated by adding a displacement to the instruction pointer (IP).",
    "template": "In relative program memory addressing, the target address is calculated by adding a {{b1}} to the instruction pointer (IP).",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "displacement",
        "acceptedAnswers": [
          "displacement",
          "offset",
          "signed displacement",
          "relative displacement"
        ],
        "hint": "Signed distance added to the next instruction pointer"
      }
    ],
    "explanation": "Week 3, Slide 19: Relative jumps calculate Target = IP_next + displacement, making code position-independent."
  },
  {
    "id": "cloze_w3_015",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Program Memory Addressing",
    "slideNumber": 20,
    "sourceSentence": "A short jump uses an 8-bit signed displacement, allowing branching from -128 to +127 bytes.",
    "template": "A {{b1}} uses an 8-bit signed displacement, allowing branching from -128 to +127 bytes.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "short jump",
        "acceptedAnswers": [
          "short jump",
          "short",
          "short jmp"
        ],
        "hint": "Jump restricted to an 8-bit signed offset range"
      }
    ],
    "explanation": "Week 3, Slide 20: Short jumps use a 1-byte relative displacement (-128 to +127 bytes from the next instruction)."
  },
  {
    "id": "cloze_w3_016",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Program Memory Addressing",
    "slideNumber": 21,
    "sourceSentence": "A near jump uses a 16-bit signed displacement, allowing branching anywhere within the current 64KB code segment.",
    "template": "A {{b1}} uses a 16-bit signed displacement, allowing branching anywhere within the current 64KB code segment.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "near jump",
        "acceptedAnswers": [
          "near jump",
          "near",
          "near jmp"
        ],
        "hint": "Intrasegment jump spanning the full 64KB segment"
      }
    ],
    "explanation": "Week 3, Slide 21: Near jumps use a 2-byte displacement to reach anywhere within the current 64KB code segment."
  },
  {
    "id": "cloze_w3_017",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Program Memory Addressing",
    "slideNumber": 23,
    "sourceSentence": "In indirect program memory addressing, the target address is held in a register or memory location.",
    "template": "In {{b1}} program memory addressing, the target address is held in a register or memory location.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "indirect",
        "acceptedAnswers": [
          "indirect",
          "indirect program memory",
          "register indirect"
        ],
        "hint": "Jump mode like JMP AX or JMP [BX]"
      }
    ],
    "explanation": "Week 3, Slide 23: Indirect jumps transfer control to an address fetched from a register or memory pointer."
  },
  {
    "id": "cloze_w3_018",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Stack Memory Architecture",
    "slideNumber": 28,
    "sourceSentence": "The stack operates on a last-in, first-out (LIFO) storage discipline.",
    "template": "The stack operates on a {{b1}} storage discipline.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "last-in, first-out",
        "acceptedAnswers": [
          "last-in, first-out",
          "lifo",
          "last in first out",
          "last in, first out"
        ],
        "hint": "Data structure acronym where most recent item is removed first"
      }
    ],
    "explanation": "Week 3, Slide 28: LIFO (Last-In, First-Out): the most recently pushed item is always the first item popped."
  },
  {
    "id": "cloze_w3_019",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Stack Memory Architecture",
    "slideNumber": 29,
    "sourceSentence": "The stack grows downward in memory toward lower memory addresses.",
    "template": "The stack grows {{b1}} in memory toward lower memory addresses.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "downward",
        "acceptedAnswers": [
          "downward",
          "down",
          "downwards",
          "toward lower addresses"
        ],
        "hint": "Direction of stack pointer movement when pushing data"
      }
    ],
    "explanation": "Week 3, Slide 29: In x86 architecture, pushing onto the stack decrements the stack pointer toward lower addresses."
  },
  {
    "id": "cloze_w3_020",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Stack Memory Operations",
    "slideNumber": 30,
    "sourceSentence": "When a PUSH instruction executes, the stack pointer (SP) is decremented by 2, and the word is stored.",
    "template": "When a PUSH instruction executes, the stack pointer (SP) is {{b1}}, and the word is stored.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "decremented by 2",
        "acceptedAnswers": [
          "decremented by 2",
          "decremented",
          "decreased by 2",
          "-2",
          "subtracted by 2",
          "decremented by two"
        ],
        "hint": "What happens to SP when pushing a 16-bit word"
      }
    ],
    "explanation": "Week 3, Slide 30: PUSH micro-steps: SP <- SP - 2; SS:[SP] <- SourceWord."
  },
  {
    "id": "cloze_w3_021",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Stack Memory Operations",
    "slideNumber": 31,
    "sourceSentence": "When a POP instruction executes, the word is retrieved from the stack, and SP is incremented by 2.",
    "template": "When a POP instruction executes, the word is retrieved from the stack, and SP is {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "incremented by 2",
        "acceptedAnswers": [
          "incremented by 2",
          "incremented",
          "increased by 2",
          "+2",
          "added by 2",
          "incremented by two"
        ],
        "hint": "What happens to SP when popping a 16-bit word"
      }
    ],
    "explanation": "Week 3, Slide 31: POP micro-steps: DestWord <- SS:[SP]; SP <- SP + 2."
  },
  {
    "id": "cloze_w3_022",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Stack Memory Prohibitions",
    "slideNumber": 33,
    "sourceSentence": "The instruction POP CS is strictly illegal because it would disrupt the instruction execution stream.",
    "template": "The instruction {{b1}} is strictly illegal because it would disrupt the instruction execution stream.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "POP CS",
        "acceptedAnswers": [
          "pop cs",
          "pop cs instruction"
        ],
        "hint": "Prohibited pop into code segment register"
      }
    ],
    "explanation": "Week 3, Slide 33: POP CS is prohibited because modifying CS without modifying IP leads to undefined instruction execution."
  },
  {
    "id": "cloze_w3_023",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Procedures & Subroutines",
    "slideNumber": 34,
    "sourceSentence": "The CALL instruction pushes the return address onto the stack before transferring control to a procedure.",
    "template": "The CALL instruction pushes the {{b1}} onto the stack before transferring control to a procedure.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "return address",
        "acceptedAnswers": [
          "return address",
          "return offset",
          "ip",
          "next instruction address"
        ],
        "hint": "Address saved so the subroutine knows where to resume"
      }
    ],
    "explanation": "Week 3, Slide 34: CALL saves the address of the next sequential instruction onto the stack."
  },
  {
    "id": "cloze_w3_024",
    "week": 3,
    "weekTitle": "Week 3 - Addressing Modes",
    "topic": "Procedures & Subroutines",
    "slideNumber": 35,
    "sourceSentence": "The RET instruction pops the return address from the stack back into IP to resume caller execution.",
    "template": "The {{b1}} instruction pops the return address from the stack back into IP to resume caller execution.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "RET",
        "acceptedAnswers": [
          "ret",
          "return",
          "ret instruction"
        ],
        "hint": "Instruction returning from a procedure"
      }
    ],
    "explanation": "Week 3, Slide 35: RET pops the return address off the stack and reloads IP (and CS if FAR)."
  },
  {
    "id": "cloze_w4_001",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Data Transfer Categories",
    "slideNumber": 5,
    "sourceSentence": "Data movement instructions are organized into five kinds: register/memory transfer, stack, I/O, string, and conversion.",
    "template": "Data movement instructions are organized into {{b1}} kinds: register/memory transfer, stack, I/O, string, and conversion.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "five",
        "acceptedAnswers": [
          "five",
          "5"
        ],
        "hint": "Number of core categories of data movement instructions"
      }
    ],
    "explanation": "Week 4, Slide 5: The x86 data movement family spans five categories: reg/mem, stack, I/O, string, and conversion."
  },
  {
    "id": "cloze_w4_002",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Segment Override",
    "slideNumber": 7,
    "sourceSentence": "A segment override prefix allows an instruction to access a segment other than its default segment.",
    "template": "A {{b1}} allows an instruction to access a segment other than its default segment.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "segment override prefix",
        "acceptedAnswers": [
          "segment override prefix",
          "segment override",
          "override prefix"
        ],
        "hint": "Prefix byte (e.g. ES:) modifying default segment association"
      }
    ],
    "explanation": "Week 4, Slide 7: Segment overrides (e.g. MOV AX, ES:[BX]) instruct the CPU to use an alternate segment register."
  },
  {
    "id": "cloze_w4_003",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Illegal MOV Operations",
    "slideNumber": 9,
    "sourceSentence": "Memory-to-memory transfers are strictly prohibited in a single MOV instruction.",
    "template": "{{b1}} transfers are strictly prohibited in a single MOV instruction.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "Memory-to-memory",
        "acceptedAnswers": [
          "memory-to-memory",
          "memory to memory",
          "mem to mem",
          "mem-to-mem"
        ],
        "hint": "Transfer type requiring an intermediate register (e.g. MOV [dest], [src] is illegal)"
      }
    ],
    "explanation": "Week 4, Slide 9: The x86 CISC architecture does not allow two memory operands in a single MOV instruction."
  },
  {
    "id": "cloze_w4_004",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Illegal MOV Operations",
    "slideNumber": 9,
    "sourceSentence": "Moving an immediate value directly into a segment register like MOV DS, 1000H is illegal.",
    "template": "Moving an immediate value directly into a {{b1}} like MOV DS, 1000H is illegal.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "segment register",
        "acceptedAnswers": [
          "segment register",
          "segment",
          "seg reg"
        ],
        "hint": "Category of registers (CS, DS, SS, ES) that cannot receive immediate constants"
      }
    ],
    "explanation": "Week 4, Slide 9: No opcode exists for moving an immediate directly into a segment register."
  },
  {
    "id": "cloze_w4_005",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Illegal MOV Operations",
    "slideNumber": 10,
    "sourceSentence": "To load a segment register with an immediate value, the value must first be loaded into a general register.",
    "template": "To load a segment register with an immediate value, the value must first be loaded into a {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "general register",
        "acceptedAnswers": [
          "general register",
          "general-purpose register",
          "general purpose register",
          "reg",
          "ax"
        ],
        "hint": "Intermediate CPU register (such as AX) used as a stepping stone"
      }
    ],
    "explanation": "Week 4, Slide 10: The standard two-instruction sequence: MOV AX, 1000H followed by MOV DS, AX."
  },
  {
    "id": "cloze_w4_006",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Register Exchange",
    "slideNumber": 12,
    "sourceSentence": "The XCHG instruction exchanges the contents of two registers or a register and a memory location.",
    "template": "The {{b1}} instruction exchanges the contents of two registers or a register and a memory location.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "XCHG",
        "acceptedAnswers": [
          "xchg",
          "exchange",
          "xchg instruction"
        ],
        "hint": "Instruction performing bidirectional register/memory content swap"
      }
    ],
    "explanation": "Week 4, Slide 12: XCHG swaps two operands without needing a temporary third register."
  },
  {
    "id": "cloze_w4_007",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Register Exchange & Bus Lock",
    "slideNumber": 13,
    "sourceSentence": "The XCHG instruction automatically asserts the LOCK# bus signal when accessing memory to guarantee atomicity.",
    "template": "The XCHG instruction automatically asserts the {{b1}} bus signal when accessing memory to guarantee atomicity.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "LOCK#",
        "acceptedAnswers": [
          "lock#",
          "lock",
          "bus lock"
        ],
        "hint": "Active-low hardware signal ensuring atomic memory exchange"
      }
    ],
    "explanation": "Week 4, Slide 13: XCHG with memory automatically locks the system bus, making it ideal for operating system semaphores."
  },
  {
    "id": "cloze_w4_008",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Address Generation: LEA",
    "slideNumber": 14,
    "sourceSentence": "The LEA instruction loads the effective address of a memory variable into a register.",
    "template": "The {{b1}} instruction loads the effective address of a memory variable into a register.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "LEA",
        "acceptedAnswers": [
          "lea",
          "load effective address",
          "lea instruction"
        ],
        "hint": "Instruction loading offset without accessing the memory contents"
      }
    ],
    "explanation": "Week 4, Slide 14: LEA (Load Effective Address) computes and loads the 16-bit offset into the destination register."
  },
  {
    "id": "cloze_w4_009",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Address Generation: LEA vs OFFSET",
    "slideNumber": 14,
    "sourceSentence": "Unlike MOV with OFFSET which is resolved at compile time, LEA calculates the address at runtime.",
    "template": "Unlike MOV with OFFSET which is resolved at compile time, LEA calculates the address at {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "runtime",
        "acceptedAnswers": [
          "runtime",
          "run time",
          "run-time",
          "execution time"
        ],
        "hint": "When dynamic address calculation takes place with LEA"
      }
    ],
    "explanation": "Week 4, Slide 14: LEA executes dynamic address arithmetic at runtime (e.g. LEA BX, [DI+SI+4])."
  },
  {
    "id": "cloze_w4_010",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Far Pointer Loading: LDS",
    "slideNumber": 15,
    "sourceSentence": "The LDS instruction loads a 16-bit offset into a destination register and a 16-bit segment into the DS register.",
    "template": "The {{b1}} instruction loads a 16-bit offset into a destination register and a 16-bit segment into the DS register.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "LDS",
        "acceptedAnswers": [
          "lds",
          "lds instruction",
          "load pointer using ds"
        ],
        "hint": "Instruction loading 32-bit far pointer into reg:DS"
      }
    ],
    "explanation": "Week 4, Slide 15: LDS reads 4 consecutive bytes from memory: offset -> reg, segment -> DS."
  },
  {
    "id": "cloze_w4_011",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Far Pointer Loading: LES",
    "slideNumber": 15,
    "sourceSentence": "The LES instruction loads a 16-bit offset into a destination register and a 16-bit segment into the ES register.",
    "template": "The {{b1}} instruction loads a 16-bit offset into a destination register and a 16-bit segment into the ES register.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "LES",
        "acceptedAnswers": [
          "les",
          "les instruction",
          "load pointer using es"
        ],
        "hint": "Instruction loading 32-bit far pointer into reg:ES"
      }
    ],
    "explanation": "Week 4, Slide 15: LES reads 4 consecutive bytes from memory: offset -> reg, segment -> ES."
  },
  {
    "id": "cloze_w4_012",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Stack Instructions: PUSHA",
    "slideNumber": 18,
    "sourceSentence": "The PUSHA instruction pushes all eight general-purpose registers onto the stack in a fixed sequence.",
    "template": "The {{b1}} instruction pushes all eight general-purpose registers onto the stack in a fixed sequence.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "PUSHA",
        "acceptedAnswers": [
          "pusha",
          "push all",
          "pusha instruction"
        ],
        "hint": "Instruction pushing AX, CX, DX, BX, SP, BP, SI, DI"
      }
    ],
    "explanation": "Week 4, Slide 18: PUSHA pushes AX, CX, DX, BX, original SP, BP, SI, and DI (16 bytes total)."
  },
  {
    "id": "cloze_w4_013",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Stack Instructions: POPA",
    "slideNumber": 19,
    "sourceSentence": "The POPA instruction restores registers in reverse order, discarding the original SP value saved on the stack.",
    "template": "The POPA instruction restores registers in reverse order, discarding the {{b1}} value saved on the stack.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "original SP",
        "acceptedAnswers": [
          "original sp",
          "sp",
          "stack pointer",
          "original stack pointer"
        ],
        "hint": "Register whose pushed value is skipped during POPA restoration"
      }
    ],
    "explanation": "Week 4, Slide 19: POPA pops DI, SI, BP, skips SP (so current stack pointer is not overwritten), then BX, DX, CX, AX."
  },
  {
    "id": "cloze_w4_014",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Stack Instructions: Flags",
    "slideNumber": 20,
    "sourceSentence": "The PUSHF instruction pushes the 16-bit contents of the flags register onto the stack.",
    "template": "The {{b1}} instruction pushes the 16-bit contents of the flags register onto the stack.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "PUSHF",
        "acceptedAnswers": [
          "pushf",
          "push flags",
          "pushf instruction"
        ],
        "hint": "Instruction saving processor flags to the stack"
      }
    ],
    "explanation": "Week 4, Slide 20: PUSHF copies the entire 16-bit FLAGS register onto the stack."
  },
  {
    "id": "cloze_w4_015",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Stack Instructions: Flags",
    "slideNumber": 21,
    "sourceSentence": "The POPF instruction restores the flags register by popping the top of the stack into FLAGS.",
    "template": "The {{b1}} instruction restores the flags register by popping the top of the stack into FLAGS.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "POPF",
        "acceptedAnswers": [
          "popf",
          "pop flags",
          "popf instruction"
        ],
        "hint": "Instruction reloading processor flags from the stack"
      }
    ],
    "explanation": "Week 4, Slide 21: POPF reloads condition and control flags from the stack."
  },
  {
    "id": "cloze_w4_016",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "I/O Instructions",
    "slideNumber": 24,
    "sourceSentence": "The IN instruction reads data from an external input device port into the accumulator (AL or AX).",
    "template": "The {{b1}} instruction reads data from an external input device port into the accumulator (AL or AX).",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "IN",
        "acceptedAnswers": [
          "in",
          "in instruction"
        ],
        "hint": "Opcode reading port data into AL/AX"
      }
    ],
    "explanation": "Week 4, Slide 24: IN receives a byte or word from an I/O port directly into AL or AX."
  },
  {
    "id": "cloze_w4_017",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "I/O Instructions",
    "slideNumber": 24,
    "sourceSentence": "The OUT instruction sends data from the accumulator (AL or AX) to an external output device port.",
    "template": "The {{b1}} instruction sends data from the accumulator (AL or AX) to an external output device port.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "OUT",
        "acceptedAnswers": [
          "out",
          "out instruction"
        ],
        "hint": "Opcode writing AL/AX data out to a peripheral port"
      }
    ],
    "explanation": "Week 4, Slide 24: OUT transmits the contents of AL or AX to a designated I/O port address."
  },
  {
    "id": "cloze_w4_018",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "I/O Instructions",
    "slideNumber": 25,
    "sourceSentence": "For variable I/O port addressing covering 0000H to FFFFH, the port address must be held in the DX register.",
    "template": "For variable I/O port addressing covering 0000H to FFFFH, the port address must be held in the {{b1}} register.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "DX",
        "acceptedAnswers": [
          "dx",
          "dx register"
        ],
        "hint": "16-bit register holding variable I/O port numbers: IN AL, DX"
      }
    ],
    "explanation": "Week 4, Slide 25: Fixed ports (00H-FFH) encode the port directly in the instruction; variable ports (0000H-FFFFH) must use DX."
  },
  {
    "id": "cloze_w4_019",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "String Instructions",
    "slideNumber": 27,
    "sourceSentence": "String source data is addressed by the register pair DS:SI, while destination data is addressed by ES:DI.",
    "template": "String source data is addressed by the register pair {{b1}}, while destination data is addressed by ES:DI.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "DS:SI",
        "acceptedAnswers": [
          "ds:si",
          "ds and si",
          "ds:si pair"
        ],
        "hint": "Segment:offset pair pointing to source string bytes"
      }
    ],
    "explanation": "Week 4, Slide 27: String operations read from DS:SI and write to ES:DI."
  },
  {
    "id": "cloze_w4_020",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "String Instructions: Direction",
    "slideNumber": 28,
    "sourceSentence": "The Direction Flag (DF) determines whether string operations increment (CLD, DF=0) or decrement (STD, DF=1) pointers.",
    "template": "The {{b1}} determines whether string operations increment (CLD, DF=0) or decrement (STD, DF=1) pointers.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "Direction Flag",
        "acceptedAnswers": [
          "direction flag",
          "df",
          "direction flag (df)"
        ],
        "hint": "Control flag set by STD and cleared by CLD"
      }
    ],
    "explanation": "Week 4, Slide 28: CLD clears DF so pointers auto-increment; STD sets DF so pointers auto-decrement."
  },
  {
    "id": "cloze_w4_021",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "String Instructions: REP",
    "slideNumber": 30,
    "sourceSentence": "The REP prefix repeats a string instruction until the CX register decrements to zero.",
    "template": "The {{b1}} prefix repeats a string instruction until the CX register decrements to zero.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "REP",
        "acceptedAnswers": [
          "rep",
          "rep prefix",
          "repeat"
        ],
        "hint": "Prefix repeating string primitives CX times"
      }
    ],
    "explanation": "Week 4, Slide 30: REP repeats MOVS, STOS, etc., while decrementing CX until CX becomes 0."
  },
  {
    "id": "cloze_w4_022",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Sign Extension: MOVSX",
    "slideNumber": 32,
    "sourceSentence": "The MOVSX instruction copies a smaller source operand into a larger register while sign-extending the value.",
    "template": "The {{b1}} instruction copies a smaller source operand into a larger register while sign-extending the value.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "MOVSX",
        "acceptedAnswers": [
          "movsx",
          "move with sign-extend",
          "movsx instruction"
        ],
        "hint": "Instruction moving with sign-extension"
      }
    ],
    "explanation": "Week 4, Slide 32: MOVSX preserves signed value by copying sign bit across all upper destination bits."
  },
  {
    "id": "cloze_w4_023",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Zero Extension: MOVZX",
    "slideNumber": 32,
    "sourceSentence": "The MOVZX instruction copies a smaller source into a larger register, padding the upper bits with zeros.",
    "template": "The {{b1}} instruction copies a smaller source into a larger register, padding the upper bits with zeros.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "MOVZX",
        "acceptedAnswers": [
          "movzx",
          "move with zero-extend",
          "movzx instruction"
        ],
        "hint": "Instruction moving with zero-extension"
      }
    ],
    "explanation": "Week 4, Slide 32: MOVZX pads the upper bits with zeros for unsigned extension."
  },
  {
    "id": "cloze_w4_024",
    "week": 4,
    "weekTitle": "Week 4 - Data Movement Instructions",
    "topic": "Table Lookup: XLAT",
    "slideNumber": 34,
    "sourceSentence": "The XLAT instruction converts the byte in AL by looking up a translation table in memory at DS:[BX + AL].",
    "template": "The {{b1}} instruction converts the byte in AL by looking up a translation table in memory at DS:[BX + AL].",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "XLAT",
        "acceptedAnswers": [
          "xlat",
          "xlatb",
          "translate",
          "xlat instruction"
        ],
        "hint": "Instruction performing table lookup translation into AL"
      }
    ],
    "explanation": "Week 4, Slide 34: XLAT (Translate) replaces AL with the byte at memory address DS:[BX + AL]."
  },
  {
    "id": "cloze_w5_001",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Addition Instructions",
    "slideNumber": 5,
    "sourceSentence": "The ADD instruction computes the sum of the source and destination operands and stores the result in the destination.",
    "template": "The {{b1}} instruction computes the sum of the source and destination operands and stores the result in the destination.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "ADD",
        "acceptedAnswers": [
          "add",
          "add instruction"
        ],
        "hint": "Primary arithmetic addition instruction"
      }
    ],
    "explanation": "Week 5, Slide 5: ADD performs destination <- destination + source, updating all arithmetic flags."
  },
  {
    "id": "cloze_w5_002",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Increment Instruction",
    "slideNumber": 8,
    "sourceSentence": "The INC instruction increments its operand by 1 but deliberately leaves the Carry Flag (CF) unchanged.",
    "template": "The INC instruction increments its operand by 1 but deliberately leaves the {{b1}} unchanged.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "Carry Flag",
        "acceptedAnswers": [
          "carry flag",
          "cf",
          "carry flag (cf)",
          "carry"
        ],
        "hint": "Flag deliberately unaffected by INC so loops don't corrupt multi-word adds"
      }
    ],
    "explanation": "Week 5, Slide 8: INC affects ZF, SF, OF, AF, PF, but NEVER affects CF."
  },
  {
    "id": "cloze_w5_003",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Addition with Carry",
    "slideNumber": 9,
    "sourceSentence": "The ADC instruction performs addition with carry, adding the destination, source, and the current value of CF.",
    "template": "The {{b1}} instruction performs addition with carry, adding the destination, source, and the current value of CF.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "ADC",
        "acceptedAnswers": [
          "adc",
          "add with carry",
          "adc instruction"
        ],
        "hint": "Instruction adding dest + src + CF for multi-word math"
      }
    ],
    "explanation": "Week 5, Slide 9: ADC is used to chain multi-word additions: dest <- dest + src + CF."
  },
  {
    "id": "cloze_w5_004",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Subtraction Instructions",
    "slideNumber": 11,
    "sourceSentence": "The SUB instruction subtracts the source operand from the destination operand and stores the difference in the destination.",
    "template": "The {{b1}} instruction subtracts the source operand from the destination operand and stores the difference in the destination.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "SUB",
        "acceptedAnswers": [
          "sub",
          "sub instruction",
          "subtract"
        ],
        "hint": "Primary arithmetic subtraction instruction"
      }
    ],
    "explanation": "Week 5, Slide 11: SUB performs dest <- dest - src, updating flags including CF (borrow) and ZF."
  },
  {
    "id": "cloze_w5_005",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Decrement Instruction",
    "slideNumber": 13,
    "sourceSentence": "The DEC instruction decrements its operand by 1 and, like INC, leaves the Carry Flag (CF) unaffected.",
    "template": "The DEC instruction decrements its operand by 1 and, like INC, leaves the {{b1}} unaffected.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "Carry Flag",
        "acceptedAnswers": [
          "carry flag",
          "cf",
          "carry flag (cf)",
          "carry"
        ],
        "hint": "Flag left unchanged by DEC"
      }
    ],
    "explanation": "Week 5, Slide 13: Like INC, DEC updates ZF, SF, OF, AF, PF, but preserves the Carry Flag (CF)."
  },
  {
    "id": "cloze_w5_006",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Subtraction with Borrow",
    "slideNumber": 14,
    "sourceSentence": "The SBB instruction subtracts both the source operand and the Carry Flag (borrow) from the destination.",
    "template": "The {{b1}} instruction subtracts both the source operand and the Carry Flag (borrow) from the destination.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "SBB",
        "acceptedAnswers": [
          "sbb",
          "subtract with borrow",
          "sbb instruction"
        ],
        "hint": "Instruction performing dest - src - CF for wide numbers"
      }
    ],
    "explanation": "Week 5, Slide 14: SBB (Subtract with Borrow) is used for multi-word subtractions."
  },
  {
    "id": "cloze_w5_007",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Comparison: CMP",
    "slideNumber": 15,
    "sourceSentence": "The CMP instruction performs a subtraction between operands to update the flags, but does not alter either operand.",
    "template": "The {{b1}} instruction performs a subtraction between operands to update the flags, but does not alter either operand.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "CMP",
        "acceptedAnswers": [
          "cmp",
          "compare",
          "cmp instruction"
        ],
        "hint": "Non-destructive compare instruction preceding conditional jumps"
      }
    ],
    "explanation": "Week 5, Slide 15: CMP performs dest - src internally, updating flags while leaving both operands intact."
  },
  {
    "id": "cloze_w5_008",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Multiplication Types",
    "slideNumber": 18,
    "sourceSentence": "The MUL instruction performs unsigned multiplication, while the IMUL instruction performs signed multiplication.",
    "template": "The MUL instruction performs unsigned multiplication, while the {{b1}} instruction performs signed multiplication.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "IMUL",
        "acceptedAnswers": [
          "imul",
          "imul instruction",
          "signed multiplication"
        ],
        "hint": "Opcode for signed multiplication in x86"
      }
    ],
    "explanation": "Week 5, Slide 18: MUL treats operands as unsigned integers; IMUL handles two's complement signed values."
  },
  {
    "id": "cloze_w5_009",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "8-Bit Multiplication",
    "slideNumber": 19,
    "sourceSentence": "In an 8-bit multiplication, the multiplicand must be in AL, and the 16-bit product is returned in AX.",
    "template": "In an 8-bit multiplication, the multiplicand must be in AL, and the 16-bit product is returned in {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "AX",
        "acceptedAnswers": [
          "ax",
          "ax register"
        ],
        "hint": "16-bit register holding product of AL * byte"
      }
    ],
    "explanation": "Week 5, Slide 19: 8-bit multiply computes AX <- AL * operand."
  },
  {
    "id": "cloze_w5_010",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "16-Bit Multiplication",
    "slideNumber": 20,
    "sourceSentence": "In a 16-bit multiplication, the multiplicand is in AX, and the 32-bit product is placed across DX:AX.",
    "template": "In a 16-bit multiplication, the multiplicand is in AX, and the 32-bit product is placed across {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "DX:AX",
        "acceptedAnswers": [
          "dx:ax",
          "dx and ax",
          "dx:ax register pair",
          "dx-ax"
        ],
        "hint": "Register pair holding high word in DX and low word in AX"
      }
    ],
    "explanation": "Week 5, Slide 20: 16-bit multiply computes DX:AX <- AX * operand."
  },
  {
    "id": "cloze_w5_011",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Division Types",
    "slideNumber": 22,
    "sourceSentence": "The DIV instruction performs unsigned division, while IDIV performs signed division.",
    "template": "The {{b1}} instruction performs unsigned division, while IDIV performs signed division.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "DIV",
        "acceptedAnswers": [
          "div",
          "div instruction",
          "unsigned division"
        ],
        "hint": "Opcode for unsigned integer division"
      }
    ],
    "explanation": "Week 5, Slide 22: DIV performs unsigned division; IDIV performs signed two's complement division."
  },
  {
    "id": "cloze_w5_012",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "8-Bit Division: Quotient",
    "slideNumber": 23,
    "sourceSentence": "In an 8-bit division, the 16-bit dividend in AX is divided by the operand, producing the quotient in AL and remainder in AH.",
    "template": "In an 8-bit division, the 16-bit dividend in AX is divided by the operand, producing the quotient in {{b1}} and remainder in AH.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "AL",
        "acceptedAnswers": [
          "al",
          "al register",
          "al (quotient)"
        ],
        "hint": "8-bit register receiving the division quotient"
      }
    ],
    "explanation": "Week 5, Slide 23: When dividing AX by an 8-bit operand, AL receives the quotient."
  },
  {
    "id": "cloze_w5_013",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "8-Bit Division: Remainder",
    "slideNumber": 23,
    "sourceSentence": "In an 8-bit division, the remainder is placed in register AH.",
    "template": "In an 8-bit division, the remainder is placed in register {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "AH",
        "acceptedAnswers": [
          "ah",
          "ah register",
          "ah (remainder)"
        ],
        "hint": "8-bit register receiving the division remainder"
      }
    ],
    "explanation": "Week 5, Slide 23: When dividing AX by an 8-bit divisor, AH receives the remainder."
  },
  {
    "id": "cloze_w5_014",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "16-Bit Division: Quotient",
    "slideNumber": 24,
    "sourceSentence": "In a 16-bit division, the 32-bit dividend is held in DX:AX, yielding the quotient in AX and remainder in DX.",
    "template": "In a 16-bit division, the 32-bit dividend is held in DX:AX, yielding the quotient in {{b1}} and remainder in DX.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "AX",
        "acceptedAnswers": [
          "ax",
          "ax register",
          "ax quotient"
        ],
        "hint": "16-bit register receiving the division quotient"
      }
    ],
    "explanation": "Week 5, Slide 24: Dividing DX:AX by a 16-bit operand places the 16-bit quotient in AX."
  },
  {
    "id": "cloze_w5_015",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "16-Bit Division: Remainder",
    "slideNumber": 24,
    "sourceSentence": "In a 16-bit division, the remainder is placed in register DX.",
    "template": "In a 16-bit division, the remainder is placed in register {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "DX",
        "acceptedAnswers": [
          "dx",
          "dx register",
          "dx remainder"
        ],
        "hint": "16-bit register receiving the division remainder"
      }
    ],
    "explanation": "Week 5, Slide 24: Dividing DX:AX by a 16-bit operand places the 16-bit remainder in DX."
  },
  {
    "id": "cloze_w5_016",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Division Exceptions",
    "slideNumber": 25,
    "sourceSentence": "A divide overflow error occurs when dividing by zero or when the quotient is too large to fit in the destination register.",
    "template": "A {{b1}} error occurs when dividing by zero or when the quotient is too large to fit in the destination register.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "divide overflow",
        "acceptedAnswers": [
          "divide overflow",
          "divide error",
          "division overflow",
          "divide by zero"
        ],
        "hint": "Type 0 hardware interrupt condition caused by faulty division"
      }
    ],
    "explanation": "Week 5, Slide 25: A Type 0 interrupt is triggered when dividing by zero or if quotient > 255 (in 8-bit) or > 65535 (in 16-bit)."
  },
  {
    "id": "cloze_w5_017",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Sign Extension: CBW",
    "slideNumber": 26,
    "sourceSentence": "The CBW instruction sign-extends the 8-bit value in AL into the 16-bit register AX.",
    "template": "The {{b1}} instruction sign-extends the 8-bit value in AL into the 16-bit register AX.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "CBW",
        "acceptedAnswers": [
          "cbw",
          "convert byte to word",
          "cbw instruction"
        ],
        "hint": "Instruction converting signed byte in AL to signed word in AX"
      }
    ],
    "explanation": "Week 5, Slide 26: CBW (Convert Byte to Word) replicates AL's sign bit (bit 7) across AH."
  },
  {
    "id": "cloze_w5_018",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Sign Extension: CWD",
    "slideNumber": 26,
    "sourceSentence": "The CWD instruction sign-extends the 16-bit value in AX into the 32-bit pair DX:AX.",
    "template": "The {{b1}} instruction sign-extends the 16-bit value in AX into the 32-bit pair DX:AX.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "CWD",
        "acceptedAnswers": [
          "cwd",
          "convert word to doubleword",
          "cwd instruction"
        ],
        "hint": "Instruction preparing AX for 16-bit IDIV by extending into DX"
      }
    ],
    "explanation": "Week 5, Slide 26: CWD (Convert Word to Doubleword) replicates AX's sign bit (bit 15) throughout DX."
  },
  {
    "id": "cloze_w5_019",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Bitwise Logic: AND",
    "slideNumber": 28,
    "sourceSentence": "The AND instruction performs a bitwise logical AND, commonly used to clear or mask selected bits.",
    "template": "The {{b1}} instruction performs a bitwise logical AND, commonly used to clear or mask selected bits.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "AND",
        "acceptedAnswers": [
          "and",
          "and instruction",
          "logical and"
        ],
        "hint": "Logic instruction used for bit masking"
      }
    ],
    "explanation": "Week 5, Slide 28: AND outputs 1 only where both input bits are 1; used to mask unwanted bits to 0."
  },
  {
    "id": "cloze_w5_020",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Bitwise Logic: OR",
    "slideNumber": 30,
    "sourceSentence": "The OR instruction performs a bitwise logical OR, frequently used to set specific bits to 1.",
    "template": "The {{b1}} instruction performs a bitwise logical OR, frequently used to set specific bits to 1.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "OR",
        "acceptedAnswers": [
          "or",
          "or instruction",
          "logical or"
        ],
        "hint": "Logic instruction used to turn bits on"
      }
    ],
    "explanation": "Week 5, Slide 30: OR outputs 1 if either input bit is 1; used to set specific bits without affecting others."
  },
  {
    "id": "cloze_w5_021",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Bitwise Logic: XOR",
    "slideNumber": 31,
    "sourceSentence": "The XOR instruction performs a bitwise exclusive OR; XORing a register with itself is the standard fast way to clear it to zero.",
    "template": "The {{b1}} instruction performs a bitwise exclusive OR; XORing a register with itself is the standard fast way to clear it to zero.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "XOR",
        "acceptedAnswers": [
          "xor",
          "xor instruction",
          "exclusive or"
        ],
        "hint": "Instruction used in 'XOR AX, AX' to zero a register"
      }
    ],
    "explanation": "Week 5, Slide 31: XOR reg, reg sets the register to 0 in fewer machine code bytes than MOV reg, 0."
  },
  {
    "id": "cloze_w5_022",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Bitwise Logic: TEST",
    "slideNumber": 32,
    "sourceSentence": "The TEST instruction performs a bitwise AND without modifying the destination, updating only the status flags.",
    "template": "The {{b1}} instruction performs a bitwise AND without modifying the destination, updating only the status flags.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "TEST",
        "acceptedAnswers": [
          "test",
          "test instruction"
        ],
        "hint": "Non-destructive logical AND checking bits prior to conditional jumps"
      }
    ],
    "explanation": "Week 5, Slide 32: TEST performs dest AND src internally and updates ZF and SF without altering destination."
  },
  {
    "id": "cloze_w5_023",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Negation: NEG",
    "slideNumber": 33,
    "sourceSentence": "The NEG instruction replaces the operand with its two's complement, effectively changing its arithmetic sign.",
    "template": "The {{b1}} instruction replaces the operand with its two's complement, effectively changing its arithmetic sign.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "NEG",
        "acceptedAnswers": [
          "neg",
          "negate",
          "neg instruction"
        ],
        "hint": "Instruction inverting sign: operand <- 0 - operand"
      }
    ],
    "explanation": "Week 5, Slide 33: NEG calculates the two's complement of an operand (equivalent to 0 - operand)."
  },
  {
    "id": "cloze_w5_024",
    "week": 5,
    "weekTitle": "Week 5 - Arithmetic and Logic Instructions",
    "topic": "Shifts: SAR",
    "slideNumber": 38,
    "sourceSentence": "The SAR instruction shifts bits right arithmetically, preserving the sign bit to perform signed division by two.",
    "template": "The {{b1}} instruction shifts bits right arithmetically, preserving the sign bit to perform signed division by two.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "SAR",
        "acceptedAnswers": [
          "sar",
          "shift arithmetic right",
          "sar instruction"
        ],
        "hint": "Shift right instruction that retains the MSB sign bit"
      }
    ],
    "explanation": "Week 5, Slide 38: SAR shifts all bits right while duplicating the MSB sign bit, dividing signed numbers by 2."
  },
  {
    "id": "cloze_w6_001",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Unconditional Jump",
    "slideNumber": 6,
    "sourceSentence": "The JMP instruction unconditionally transfers program execution to a specified destination label or address.",
    "template": "The JMP instruction {{b1}} transfers program execution to a specified destination label or address.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "unconditionally",
        "acceptedAnswers": [
          "unconditionally",
          "unconditional",
          "always"
        ],
        "hint": "How JMP branches regardless of flag states"
      }
    ],
    "explanation": "Week 6, Slide 6: JMP always branches without checking any CPU condition flags."
  },
  {
    "id": "cloze_w6_002",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Conditional Jumps",
    "slideNumber": 8,
    "sourceSentence": "Conditional jump instructions test the status flags in the flags register to decide whether to branch.",
    "template": "Conditional jump instructions test the {{b1}} in the flags register to decide whether to branch.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "status flags",
        "acceptedAnswers": [
          "status flags",
          "flags",
          "condition flags",
          "flags register"
        ],
        "hint": "Processor status bits evaluated by conditional jumps"
      }
    ],
    "explanation": "Week 6, Slide 8: Conditional jumps check ZF, CF, SF, OF, or PF to determine whether to branch or fall through."
  },
  {
    "id": "cloze_w6_003",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Signed Conditional Jumps",
    "slideNumber": 9,
    "sourceSentence": "For signed numbers, the JG instruction branches when ZF=0 and SF=OF.",
    "template": "For signed numbers, the {{b1}} instruction branches when ZF=0 and SF=OF.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "JG",
        "acceptedAnswers": [
          "jg",
          "jnle",
          "jump if greater",
          "jg instruction"
        ],
        "hint": "Jump if greater opcode for signed comparisons"
      }
    ],
    "explanation": "Week 6, Slide 9: JG (Jump if Greater) evaluates signed condition: ZF=0 and SF=OF."
  },
  {
    "id": "cloze_w6_004",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Signed Conditional Jumps",
    "slideNumber": 9,
    "sourceSentence": "For signed numbers, the JL instruction branches when SF is not equal to OF.",
    "template": "For signed numbers, the {{b1}} instruction branches when SF is not equal to OF.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "JL",
        "acceptedAnswers": [
          "jl",
          "jnge",
          "jump if less",
          "jl instruction"
        ],
        "hint": "Jump if less opcode for signed comparisons"
      }
    ],
    "explanation": "Week 6, Slide 9: JL (Jump if Less) checks if SF != OF."
  },
  {
    "id": "cloze_w6_005",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Unsigned Conditional Jumps",
    "slideNumber": 10,
    "sourceSentence": "For unsigned numbers, JA branches when both CF=0 and ZF=0.",
    "template": "For unsigned numbers, {{b1}} branches when both CF=0 and ZF=0.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "JA",
        "acceptedAnswers": [
          "ja",
          "jnbe",
          "jump if above",
          "ja instruction"
        ],
        "hint": "Jump if above opcode for unsigned comparisons"
      }
    ],
    "explanation": "Week 6, Slide 10: JA (Jump if Above) branches when unsigned destination > source (CF=0 and ZF=0)."
  },
  {
    "id": "cloze_w6_006",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Unsigned Conditional Jumps",
    "slideNumber": 10,
    "sourceSentence": "For unsigned numbers, JB branches when the Carry Flag CF=1.",
    "template": "For unsigned numbers, {{b1}} branches when the Carry Flag CF=1.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "JB",
        "acceptedAnswers": [
          "jb",
          "jnae",
          "jc",
          "jump if below",
          "jb instruction"
        ],
        "hint": "Jump if below opcode for unsigned comparisons"
      }
    ],
    "explanation": "Week 6, Slide 10: JB (Jump if Below) branches when unsigned destination < source, indicated by CF=1."
  },
  {
    "id": "cloze_w6_007",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Zero Flag Jumps",
    "slideNumber": 10,
    "sourceSentence": "The JZ instruction branches when the Zero Flag ZF=1.",
    "template": "The {{b1}} instruction branches when the Zero Flag ZF=1.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "JZ",
        "acceptedAnswers": [
          "jz",
          "je",
          "jump if zero",
          "jump if equal"
        ],
        "hint": "Opcode jumping when result is zero (or operands equal)"
      }
    ],
    "explanation": "Week 6, Slide 10: JZ / JE branches if the Zero Flag ZF is set to 1."
  },
  {
    "id": "cloze_w6_008",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Zero Flag Jumps",
    "slideNumber": 10,
    "sourceSentence": "The JNZ instruction branches when the Zero Flag ZF=0.",
    "template": "The {{b1}} instruction branches when the Zero Flag ZF=0.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "JNZ",
        "acceptedAnswers": [
          "jnz",
          "jne",
          "jump if not zero",
          "jump if not equal"
        ],
        "hint": "Opcode jumping when result is non-zero (or operands unequal)"
      }
    ],
    "explanation": "Week 6, Slide 10: JNZ / JNE branches when the Zero Flag ZF is 0."
  },
  {
    "id": "cloze_w6_009",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Loop Instruction",
    "slideNumber": 11,
    "sourceSentence": "The LOOP instruction decrements the CX register by 1 and jumps to the target label if CX is not zero.",
    "template": "The LOOP instruction decrements the {{b1}} register by 1 and jumps to the target label if CX is not zero.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "CX",
        "acceptedAnswers": [
          "cx",
          "cx register",
          "count",
          "count register"
        ],
        "hint": "Register automatically decremented by LOOP"
      }
    ],
    "explanation": "Week 6, Slide 11: LOOP performs DEC CX; JNZ label without modifying CPU flags."
  },
  {
    "id": "cloze_w6_010",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Loop Edge Case",
    "slideNumber": 12,
    "sourceSentence": "If CX is initially 0 when entering a LOOP instruction, it decrements to FFFFH and repeats 65,536 times.",
    "template": "If CX is initially 0 when entering a LOOP instruction, it decrements to FFFFH and repeats {{b1}} times.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "65,536",
        "acceptedAnswers": [
          "65,536",
          "65536",
          "65536 times",
          "65,536 times"
        ],
        "hint": "Full 16-bit iteration wrap-around count"
      }
    ],
    "explanation": "Week 6, Slide 12: If CX=0, the first LOOP decrements CX to FFFFH (65535), causing the loop to run 65,536 times."
  },
  {
    "id": "cloze_w6_011",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Loop Guard: JCXZ",
    "slideNumber": 13,
    "sourceSentence": "The JCXZ instruction branches if CX is zero, used as a guard before a loop to prevent running 65,536 times.",
    "template": "The {{b1}} instruction branches if CX is zero, used as a guard before a loop to prevent running 65,536 times.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "JCXZ",
        "acceptedAnswers": [
          "jcxz",
          "jump if cx is zero",
          "jcxz instruction"
        ],
        "hint": "Instruction testing CX without altering flags"
      }
    ],
    "explanation": "Week 6, Slide 13: JCXZ checks CX and jumps if CX=0, skipping the loop safely."
  },
  {
    "id": "cloze_w6_012",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Conditional Loops",
    "slideNumber": 14,
    "sourceSentence": "The LOOPE instruction decrements CX and branches only if CX is not zero and ZF=1.",
    "template": "The {{b1}} instruction decrements CX and branches only if CX is not zero and ZF=1.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "LOOPE",
        "acceptedAnswers": [
          "loope",
          "loopz",
          "loope/loopz"
        ],
        "hint": "Loop instruction terminating if elements become non-equal (ZF=0)"
      }
    ],
    "explanation": "Week 6, Slide 14: LOOPE (or LOOPZ) continues the loop as long as CX != 0 and ZF == 1."
  },
  {
    "id": "cloze_w6_013",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Nested Loops",
    "slideNumber": 15,
    "sourceSentence": "When nesting loops, the outer loop's CX counter must be saved onto the stack with PUSH CX and restored with POP CX.",
    "template": "When nesting loops, the outer loop's CX counter must be saved onto the stack with {{b1}} and restored with POP CX.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "PUSH CX",
        "acceptedAnswers": [
          "push cx",
          "pushing cx",
          "push cx instruction"
        ],
        "hint": "Stack instruction saving CX before loading inner loop counter"
      }
    ],
    "explanation": "Week 6, Slide 15: Since LOOP always modifies CX, nested loops must preserve the outer CX on the stack."
  },
  {
    "id": "cloze_w6_014",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Procedures",
    "slideNumber": 22,
    "sourceSentence": "A procedure is defined in assembly using the PROC and ENDP directives.",
    "template": "A procedure is defined in assembly using the {{b1}} and ENDP directives.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "PROC",
        "acceptedAnswers": [
          "proc",
          "proc directive"
        ],
        "hint": "Assembler directive marking the start of a procedure"
      }
    ],
    "explanation": "Week 6, Slide 22: Procedures begin with `Name PROC [NEAR|FAR]` and terminate with `Name ENDP`."
  },
  {
    "id": "cloze_w6_015",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Procedures: CALL",
    "slideNumber": 23,
    "sourceSentence": "The CALL instruction saves the address of the next instruction on the stack and jumps to the procedure.",
    "template": "The {{b1}} instruction saves the address of the next instruction on the stack and jumps to the procedure.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "CALL",
        "acceptedAnswers": [
          "call",
          "call instruction"
        ],
        "hint": "Instruction invoking a procedure"
      }
    ],
    "explanation": "Week 6, Slide 23: CALL pushes the return address (IP or CS:IP) and transfers execution to the procedure."
  },
  {
    "id": "cloze_w6_016",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Procedures: RET",
    "slideNumber": 24,
    "sourceSentence": "The RET instruction pops the return address from the stack into the instruction pointer to return from a procedure.",
    "template": "The {{b1}} instruction pops the return address from the stack into the instruction pointer to return from a procedure.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "RET",
        "acceptedAnswers": [
          "ret",
          "ret instruction",
          "return"
        ],
        "hint": "Instruction exiting a procedure"
      }
    ],
    "explanation": "Week 6, Slide 24: RET reloads the saved instruction pointer from the stack to resume caller execution."
  },
  {
    "id": "cloze_w6_017",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Interrupts vs CALL",
    "slideNumber": 26,
    "sourceSentence": "Unlike CALL, an interrupt automatically pushes the flags register onto the stack before the return address.",
    "template": "Unlike CALL, an interrupt automatically pushes the {{b1}} onto the stack before the return address.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "flags register",
        "acceptedAnswers": [
          "flags register",
          "flags",
          "flag register",
          "psw"
        ],
        "hint": "Status word saved by hardware interrupts before pushing CS and IP"
      }
    ],
    "explanation": "Week 6, Slide 26: Hardware/software interrupts push FLAGS, CS, then IP onto the stack."
  },
  {
    "id": "cloze_w6_018",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Interrupt Vector Table",
    "slideNumber": 27,
    "sourceSentence": "The Interrupt Vector Table (IVT) is located in the lowest 1024 bytes of memory from 00000H to 003FFH.",
    "template": "The Interrupt Vector Table (IVT) is located in the lowest 1024 bytes of memory from {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "00000H to 003FFH",
        "acceptedAnswers": [
          "00000h to 003ffh",
          "00000h - 003ffh",
          "0000:0000 to 0000:03ff",
          "0 to 1023",
          "00000h-003ffh"
        ],
        "hint": "Address range of the 1KB vector table at the base of memory"
      }
    ],
    "explanation": "Week 6, Slide 27: The IVT occupies the first 1024 bytes (00000H to 003FFH) of physical memory in real mode."
  },
  {
    "id": "cloze_w6_019",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Interrupt Vector Table",
    "slideNumber": 27,
    "sourceSentence": "The IVT contains 256 interrupt vectors, each consisting of 4 bytes.",
    "template": "The IVT contains {{b1}} interrupt vectors, each consisting of 4 bytes.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "256",
        "acceptedAnswers": [
          "256",
          "256 vectors",
          "256 interrupts"
        ],
        "hint": "Total count of interrupt types supported by x86"
      }
    ],
    "explanation": "Week 6, Slide 27: The 8086 architecture defines 256 interrupt types (INT 0 to INT 255)."
  },
  {
    "id": "cloze_w6_020",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Vector Address Calculation",
    "slideNumber": 28,
    "sourceSentence": "To find the vector address in the IVT, the interrupt type number is multiplied by 4.",
    "template": "To find the vector address in the IVT, the interrupt type number is multiplied by {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "4",
        "acceptedAnswers": [
          "4",
          "four",
          "4 bytes"
        ],
        "hint": "Multiplier corresponding to the 4-byte size of each far pointer"
      }
    ],
    "explanation": "Week 6, Slide 28: Each vector is 4 bytes (2 for IP, 2 for CS), so VectorAddress = InterruptType * 4."
  },
  {
    "id": "cloze_w6_021",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Vector Address Calculation",
    "slideNumber": 29,
    "sourceSentence": "For INT 21H, the vector address in the IVT is calculated as 21H * 4 = 84H (00084H).",
    "template": "For INT 21H, the vector address in the IVT is calculated as 21H * 4 = {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "00084H",
        "acceptedAnswers": [
          "00084h",
          "84h",
          "0x84",
          "84 hex",
          "00084"
        ],
        "hint": "Hex address in IVT: 21H * 4 = 33 * 4 = 132 = 84H"
      }
    ],
    "explanation": "Week 6, Slide 29: 21H * 4 = 84H; the DOS service vector is stored at physical address 00084H."
  },
  {
    "id": "cloze_w6_022",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Interrupt Return: IRET",
    "slideNumber": 30,
    "sourceSentence": "The IRET instruction is used to return from an interrupt service routine, popping IP, CS, and FLAGS.",
    "template": "The {{b1}} instruction is used to return from an interrupt service routine, popping IP, CS, and FLAGS.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "IRET",
        "acceptedAnswers": [
          "iret",
          "iret instruction",
          "interrupt return"
        ],
        "hint": "Special return instruction popping 6 bytes: IP, CS, and FLAGS"
      }
    ],
    "explanation": "Week 6, Slide 30: IRET pops IP, CS, and FLAGS from the stack to cleanly restore pre-interrupt state."
  },
  {
    "id": "cloze_w6_023",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Relative Branching",
    "slideNumber": 34,
    "sourceSentence": "Short and near conditional jumps are relative jumps that use a displacement added to the IP register.",
    "template": "Short and near conditional jumps are {{b1}} jumps that use a displacement added to the IP register.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "relative",
        "acceptedAnswers": [
          "relative",
          "relative jumps",
          "relative jump"
        ],
        "hint": "Jump type calculating target relative to current instruction pointer"
      }
    ],
    "explanation": "Week 6, Slide 34: Conditional branches are relative: IP <- IP + displacement."
  },
  {
    "id": "cloze_w6_024",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Stack Balancing Pitfall",
    "slideNumber": 37,
    "sourceSentence": "Failing to balance PUSH and POP instructions inside a procedure causes RET to jump to a corrupted address.",
    "template": "Failing to balance PUSH and POP instructions inside a procedure causes RET to jump to a corrupted {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "address",
        "acceptedAnswers": [
          "address",
          "target",
          "location",
          "instruction"
        ],
        "hint": "What gets corrupted when the stack pointer has drifted"
      }
    ],
    "explanation": "Week 6, Slide 37: Unbalanced PUSH/POP operations alter SP, so RET pops data instead of the true return address."
  },
  {
    "id": "cloze_w6_025",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Simple Exercise: Trace the Loop (Foto/451.jpeg)",
    "slideNumber": 19,
    "sourceSentence": "In the Simple Exercise (MOV CX, 4; MOV AX, 0; MOV BX, 2; AGAIN: ADD AX, BX; ADD BX, 2; LOOP AGAIN), when the loop finishes after 4 passes, AX is 20, BX is 10, and CX is 0.",
    "template": "In the Simple Exercise (MOV CX, 4; MOV AX, 0; MOV BX, 2; AGAIN: ADD AX, BX; ADD BX, 2; LOOP AGAIN), when the loop finishes after 4 passes, AX is {{b1}}, BX is {{b2}}, and CX is 0.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "20",
        "acceptedAnswers": [
          "20",
          "0014h",
          "14h",
          "0x14"
        ],
        "hint": "Final sum in AX: 2 + 4 + 6 + 8"
      },
      {
        "id": "b2",
        "targetAnswer": "10",
        "acceptedAnswers": [
          "10",
          "000ah",
          "0ah",
          "ah",
          "0x0a"
        ],
        "hint": "Final value of BX after adding 2 four times starting from 2"
      }
    ],
    "explanation": "Classroom Photo 451.jpeg (week6.excalidraw): Pass 1: AX=2, BX=4, CX=3; Pass 2: AX=6, BX=6, CX=2; Pass 3: AX=12, BX=8, CX=1; Pass 4: AX=20, BX=10, CX=0 (Jump? no)."
  },
  {
    "id": "cloze_w6_026",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Simple Exercise: Loop Termination (Foto/451.jpeg)",
    "slideNumber": 19,
    "sourceSentence": "When the LOOP AGAIN instruction finishes its final pass in the Trace the Loop exercise, the CX register equals 0 and the loop does not jump.",
    "template": "When the LOOP AGAIN instruction finishes its final pass in the Trace the Loop exercise, the CX register equals {{b1}} and the loop does not jump.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "0",
        "acceptedAnswers": [
          "0",
          "zero",
          "0000h"
        ],
        "hint": "Value of CX when LOOP terminates and falls through"
      }
    ],
    "explanation": "Classroom Photo 451.jpeg (week6.excalidraw): What is CX when the loop finishes? 0. When CX reaches 0 after decrementing, LOOP falls through to the next instruction."
  },
  {
    "id": "cloze_w6_027",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Nested Loop Flowchart & Fix (Foto/17.04.30.jpeg)",
    "slideNumber": 19,
    "sourceSentence": "In the nested loop fix (OUTER: PUSH CX; MOV CX, 3; INNER: LOOP INNER; POP CX; LOOP OUTER), the POP CX instruction restores the outer loop counter before LOOP OUTER executes.",
    "template": "In the nested loop fix (OUTER: PUSH CX; MOV CX, 3; INNER: LOOP INNER; {{b1}}; LOOP OUTER), the outer loop counter is restored from the stack before LOOP OUTER executes.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "POP CX",
        "acceptedAnswers": [
          "pop cx",
          "pop cx instruction"
        ],
        "hint": "Instruction restoring CX from the stack after LOOP INNER finishes"
      }
    ],
    "explanation": "Classroom Photo WhatsApp Image 2026-10-26 at 17.04.30.jpeg: OUTER pushes CX, sets MOV CX, 3 for INNER, runs LOOP INNER, then executes POP CX before LOOP OUTER."
  },
  {
    "id": "cloze_w6_028",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Case Study: Adding Two Arrays (Foto/234.jpeg)",
    "slideNumber": 20,
    "sourceSentence": "In the Week 6 Case Study with BLOCK1 DW 5,10,15 and BLOCK2 DW 3,4,5, adding each number in BLOCK1 to the corresponding number in BLOCK2 produces the expected results 8, 14, and 20.",
    "template": "In the Week 6 Case Study with BLOCK1 DW 5,10,15 and BLOCK2 DW 3,4,5, adding each number in BLOCK1 to the corresponding number in BLOCK2 produces the expected results 8, {{b1}}, and {{b2}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "14",
        "acceptedAnswers": [
          "14",
          "0eh",
          "000eh"
        ],
        "hint": "Position 2 result: BLOCK1=10, BLOCK2=4"
      },
      {
        "id": "b2",
        "targetAnswer": "20",
        "acceptedAnswers": [
          "20",
          "14h",
          "0014h"
        ],
        "hint": "Position 3 result: BLOCK1=15, BLOCK2=5"
      }
    ],
    "explanation": "Classroom Photo 234.jpeg (CASESTUDY_WEEK6.docx): Position 1: 5+3=8, Position 2: 10+4=14, Position 3: 15+5=20."
  },
  {
    "id": "cloze_w6_029",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Case Study: Array Addition with LODSW/STOSW",
    "slideNumber": 20,
    "sourceSentence": "In the BLOCK1 and BLOCK2 array addition loop, LODSW loads AX from DS:SI and STOSW stores the sum from AX into ES:DI while automatically advancing the pointers by 2 bytes.",
    "template": "In the BLOCK1 and BLOCK2 array addition loop, {{b1}} loads AX from DS:SI and {{b2}} stores the sum from AX into ES:DI while automatically advancing the pointers by 2 bytes.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "LODSW",
        "acceptedAnswers": [
          "lodsw",
          "lodsw instruction"
        ],
        "hint": "String instruction loading a 16-bit word from [DS:SI] into AX"
      },
      {
        "id": "b2",
        "targetAnswer": "STOSW",
        "acceptedAnswers": [
          "stosw",
          "stosw instruction"
        ],
        "hint": "String instruction storing AX into [ES:DI]"
      }
    ],
    "explanation": "Week 6, Slide 20: LODSW reads the word at DS:SI into AX (SI += 2), ADD AX, [ES:DI] adds the destination word, and STOSW writes AX to ES:DI (DI += 2)."
  },
  {
    "id": "cloze_w6_030",
    "week": 6,
    "weekTitle": "Week 6 - Program Control Instructions",
    "topic": "Conditional Loops: LOOPNE / LOOPNZ",
    "slideNumber": 21,
    "sourceSentence": "The LOOPNE (or LOOPNZ) instruction decrements CX and jumps to the target label if CX is not zero and the Zero Flag ZF=0.",
    "template": "The {{b1}} instruction decrements CX and jumps to the target label if CX is not zero and the Zero Flag ZF=0.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "LOOPNE",
        "acceptedAnswers": [
          "loopne",
          "loopnz",
          "loopne/loopnz"
        ],
        "hint": "Conditional loop instruction that repeats while not equal (ZF=0) and CX != 0"
      }
    ],
    "explanation": "Week 6, Slide 21: LOOPNE/LOOPNZ decrements CX and branches if CX != 0 and ZF == 0."
  },
  {
    "id": "cloze_w7_001",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "I/O Architecture Overview",
    "slideNumber": 5,
    "sourceSentence": "The third key structural element of a computer system, alongside the CPU and memory, is the I/O module.",
    "template": "The third key structural element of a computer system, alongside the CPU and memory, is the {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "I/O module",
        "acceptedAnswers": [
          "i/o module",
          "io module",
          "i/o modules",
          "io modules"
        ],
        "hint": "Interface block connecting external peripherals to system buses"
      }
    ],
    "explanation": "William Stallings, Week 7, Slide 5: The three pillars of computer system architecture are CPU, Memory, and I/O Modules."
  },
  {
    "id": "cloze_w7_002",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Peripheral Interfacing",
    "slideNumber": 6,
    "sourceSentence": "Directly connecting peripherals to the system bus is impractical due to wide differences in transfer speeds and data formats.",
    "template": "Directly connecting peripherals to the system bus is impractical due to wide differences in {{b1}} and data formats.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "transfer speeds",
        "acceptedAnswers": [
          "transfer speeds",
          "speed",
          "speeds",
          "data rates"
        ],
        "hint": "Mismatch between fast CPU clock and slow peripheral mechanical response"
      }
    ],
    "explanation": "Week 7, Slide 6: Peripherals operate at vastly different speeds compared to memory and processor buses."
  },
  {
    "id": "cloze_w7_003",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "I/O Module Interfaces",
    "slideNumber": 7,
    "sourceSentence": "An I/O module interfaces between the internal system bus and external device-specific links.",
    "template": "An I/O module interfaces between the internal {{b1}} and external device-specific links.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "system bus",
        "acceptedAnswers": [
          "system bus",
          "internal bus",
          "system bus lines"
        ],
        "hint": "Internal shared bus connected to the CPU and memory"
      }
    ],
    "explanation": "Week 7, Slide 7: The I/O module bridges the standardized high-speed system bus and proprietary external devices."
  },
  {
    "id": "cloze_w7_004",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Device Classification",
    "slideNumber": 8,
    "sourceSentence": "External devices are classified into three categories: human-readable, machine-readable, and communication.",
    "template": "External devices are classified into three categories: {{b1}}, machine-readable, and communication.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "human-readable",
        "acceptedAnswers": [
          "human-readable",
          "human readable"
        ],
        "hint": "Category suitable for communication with user (e.g. video monitors, keyboards)"
      }
    ],
    "explanation": "Week 7, Slide 8: External devices are divided into human-readable (monitors/printers), machine-readable (disks/sensors), and communication (modems/NICs)."
  },
  {
    "id": "cloze_w7_005",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "I/O Module Functions",
    "slideNumber": 10,
    "sourceSentence": "The five core functions of an I/O module are control and timing, CPU communication, device communication, data buffering, and error detection.",
    "template": "The five core functions of an I/O module are control and timing, CPU communication, device communication, {{b1}}, and error detection.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "data buffering",
        "acceptedAnswers": [
          "data buffering",
          "buffering",
          "data buffer"
        ],
        "hint": "Function compensating for speed mismatches by staging data in registers"
      }
    ],
    "explanation": "Week 7, Slide 10: Data buffering holds data transferred between fast system bus bursts and slower peripheral streams."
  },
  {
    "id": "cloze_w7_006",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "I/O Module Types",
    "slideNumber": 12,
    "sourceSentence": "An I/O module with substantial built-in processing capability and memory is referred to as an I/O channel or coprocessor.",
    "template": "An I/O module with substantial built-in processing capability and memory is referred to as an {{b1}} or coprocessor.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "I/O channel",
        "acceptedAnswers": [
          "i/o channel",
          "io channel",
          "channel",
          "i/o processor"
        ],
        "hint": "Intelligent controller executing its own I/O programs"
      }
    ],
    "explanation": "Week 7, Slide 12: An I/O channel contains a dedicated processor executing channel programs independently from the main CPU."
  },
  {
    "id": "cloze_w7_007",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Programmed I/O",
    "slideNumber": 14,
    "sourceSentence": "In programmed I/O, the processor directly controls I/O operations and must poll the device status in a loop.",
    "template": "In {{b1}}, the processor directly controls I/O operations and must poll the device status in a loop.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "programmed I/O",
        "acceptedAnswers": [
          "programmed i/o",
          "programmed io",
          "polling",
          "polling mode"
        ],
        "hint": "Simplest I/O technique where CPU waits in a busy-wait loop"
      }
    ],
    "explanation": "Week 7, Slide 14: In programmed I/O, CPU cycles are consumed repeatedly checking the status bit until ready."
  },
  {
    "id": "cloze_w7_008",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "I/O Command Types",
    "slideNumber": 15,
    "sourceSentence": "The four types of I/O commands sent by the CPU are control, test, read, and write.",
    "template": "The four types of I/O commands sent by the CPU are {{b1}}, test, read, and write.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "control",
        "acceptedAnswers": [
          "control",
          "control command"
        ],
        "hint": "Command activating peripheral or setting operating parameters"
      }
    ],
    "explanation": "Week 7, Slide 15: CPU commands to an I/O module fall into four categories: Control, Test, Read, and Write."
  },
  {
    "id": "cloze_w7_009",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Memory-Mapped I/O",
    "slideNumber": 17,
    "sourceSentence": "In memory-mapped I/O, devices share the same address space as main memory and are accessed using standard memory instructions.",
    "template": "In {{b1}}, devices share the same address space as main memory and are accessed using standard memory instructions.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "memory-mapped I/O",
        "acceptedAnswers": [
          "memory-mapped i/o",
          "memory mapped i/o",
          "memory-mapped io",
          "memory mapped io",
          "memory-mapped"
        ],
        "hint": "I/O scheme where ports look just like memory addresses"
      }
    ],
    "explanation": "Week 7, Slide 17: In memory-mapped I/O, instructions like MOV read/write I/O ports in the memory address map."
  },
  {
    "id": "cloze_w7_010",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Isolated I/O",
    "slideNumber": 18,
    "sourceSentence": "In isolated I/O, ports occupy a separate 64K address space and require dedicated IN and OUT instructions.",
    "template": "In {{b1}}, ports occupy a separate 64K address space and require dedicated IN and OUT instructions.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "isolated I/O",
        "acceptedAnswers": [
          "isolated i/o",
          "isolated io",
          "port-mapped i/o",
          "port mapped i/o",
          "isolated"
        ],
        "hint": "x86 architecture I/O scheme separate from physical memory addresses"
      }
    ],
    "explanation": "Week 7, Slide 18: Isolated (port-mapped) I/O gives ports their own address space (0000H-FFFFH) accessed via IN/OUT."
  },
  {
    "id": "cloze_w7_011",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Isolated I/O Bus Signals",
    "slideNumber": 19,
    "sourceSentence": "Isolated I/O uses separate bus control lines, specifically IORC (I/O Read) and IOWC (I/O Write).",
    "template": "Isolated I/O uses separate bus control lines, specifically {{b1}} and IOWC.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "IORC",
        "acceptedAnswers": [
          "iorc",
          "iorc signal",
          "i/o read control",
          "io read"
        ],
        "hint": "Bus control line for reading from an I/O port"
      }
    ],
    "explanation": "Week 7, Slide 19: The 8086 system uses MEMR/MEMW for memory and IORC/IOWC for isolated I/O."
  },
  {
    "id": "cloze_w7_012",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Interrupt-Driven I/O",
    "slideNumber": 23,
    "sourceSentence": "In interrupt-driven I/O, the CPU issues a command, continues executing other instructions, and is interrupted when the device is ready.",
    "template": "In {{b1}}, the CPU issues a command, continues executing other instructions, and is interrupted when the device is ready.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "interrupt-driven I/O",
        "acceptedAnswers": [
          "interrupt-driven i/o",
          "interrupt-driven io",
          "interrupt driven i/o",
          "interrupt driven io",
          "interrupt-driven"
        ],
        "hint": "I/O model avoiding busy-waiting by allowing hardware signaling"
      }
    ],
    "explanation": "Week 7, Slide 23: Interrupt-driven I/O eliminates CPU polling waste by signaling the processor asynchronously."
  },
  {
    "id": "cloze_w7_013",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Interrupt Hardware Sequence",
    "slideNumber": 24,
    "sourceSentence": "When an interrupt occurs, the CPU finishes the current instruction before acknowledging the interrupt.",
    "template": "When an interrupt occurs, the CPU {{b1}} before acknowledging the interrupt.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "finishes the current instruction",
        "acceptedAnswers": [
          "finishes the current instruction",
          "completes the current instruction",
          "finishes current instruction",
          "completes current instruction"
        ],
        "hint": "What the CPU does with the in-progress instruction before servicing interrupt"
      }
    ],
    "explanation": "Week 7, Slide 24: Interrupts are checked at the end of each instruction cycle; current instructions are never aborted."
  },
  {
    "id": "cloze_w7_014",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Interrupt Hardware Sequence",
    "slideNumber": 25,
    "sourceSentence": "The CPU sends an INTA (Interrupt Acknowledge) signal to notify the interrupting device.",
    "template": "The CPU sends an {{b1}} signal to notify the interrupting device.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "INTA",
        "acceptedAnswers": [
          "inta",
          "interrupt acknowledge",
          "inta#",
          "inta signal"
        ],
        "hint": "Active-low handshake signal sent by CPU on INTR line assertion"
      }
    ],
    "explanation": "Week 7, Slide 25: The CPU pulses INTA# twice: once to lock the bus and once to read the vector byte from the PIC."
  },
  {
    "id": "cloze_w7_015",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Device Identification",
    "slideNumber": 27,
    "sourceSentence": "In a daisy chain hardware poll, devices are connected in series and the interrupt acknowledge signal cascades through them.",
    "template": "In a {{b1}} hardware poll, devices are connected in series and the interrupt acknowledge signal cascades through them.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "daisy chain",
        "acceptedAnswers": [
          "daisy chain",
          "daisy-chain",
          "daisy chain poll"
        ],
        "hint": "Series priority polling circuit where signal ripples from device to device"
      }
    ],
    "explanation": "Week 7, Slide 27: A daisy-chain grants bus priority to the first device asserting the request along the series chain."
  },
  {
    "id": "cloze_w7_016",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Device Identification",
    "slideNumber": 28,
    "sourceSentence": "In bus arbitration, an I/O module must gain control of the bus before raising an interrupt request.",
    "template": "In {{b1}}, an I/O module must gain control of the bus before raising an interrupt request.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "bus arbitration",
        "acceptedAnswers": [
          "bus arbitration",
          "arbitration",
          "bus arbiter"
        ],
        "hint": "Mechanism where modules negotiate bus mastership"
      }
    ],
    "explanation": "Week 7, Slide 28: Bus arbitration ensures only one module acts as bus master at any given cycle."
  },
  {
    "id": "cloze_w7_017",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Vectored Interrupts",
    "slideNumber": 29,
    "sourceSentence": "A vectored interrupt identifies the interrupting device by providing an index or vector address directly on the data bus.",
    "template": "A {{b1}} identifies the interrupting device by providing an index or vector address directly on the data bus.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "vectored interrupt",
        "acceptedAnswers": [
          "vectored interrupt",
          "vectored",
          "vectored interrupts"
        ],
        "hint": "Interrupt scheme where the device places its vector number on the data bus"
      }
    ],
    "explanation": "Week 7, Slide 29: In vectored interrupts, the controller asserts the vector byte on D0-D7 during the second INTA pulse."
  },
  {
    "id": "cloze_w7_018",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Intel Support Chips: 82C59A",
    "slideNumber": 31,
    "sourceSentence": "The Intel 82C59A is a Programmable Interrupt Controller (PIC) that manages up to 8 interrupt request lines.",
    "template": "The Intel {{b1}} is a Programmable Interrupt Controller (PIC) that manages up to 8 interrupt request lines.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "82C59A",
        "acceptedAnswers": [
          "82c59a",
          "8259",
          "8259a",
          "82c59",
          "pic"
        ],
        "hint": "Intel part number for the classic PC interrupt controller"
      }
    ],
    "explanation": "Week 7, Slide 31: The 82C59A PIC arbitrates up to 8 prioritized interrupt lines (IR0 through IR7)."
  },
  {
    "id": "cloze_w7_019",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Intel Support Chips: 82C59A",
    "slideNumber": 31,
    "sourceSentence": "Multiple 82C59A PIC chips can be cascaded in a master-slave configuration to handle up to 64 priority interrupt inputs.",
    "template": "Multiple 82C59A PIC chips can be cascaded in a master-slave configuration to handle up to {{b1}} priority interrupt inputs.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "64",
        "acceptedAnswers": [
          "64",
          "64 interrupts",
          "64 devices",
          "64 lines"
        ],
        "hint": "Maximum inputs with 1 master and 8 slave 8259 PICs (8 x 8)"
      }
    ],
    "explanation": "Week 7, Slide 31: One master 82C59A can connect to 8 slave PICs, managing up to 64 interrupt request lines."
  },
  {
    "id": "cloze_w7_020",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Intel Support Chips: 82C55A",
    "slideNumber": 33,
    "sourceSentence": "The Intel 82C55A is a Programmable Peripheral Interface (PPI) chip providing 24 configurable I/O pins.",
    "template": "The Intel {{b1}} is a Programmable Peripheral Interface (PPI) chip providing 24 configurable I/O pins.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "82C55A",
        "acceptedAnswers": [
          "82c55a",
          "8255",
          "8255a",
          "82c55",
          "ppi"
        ],
        "hint": "Intel 24-pin parallel interface chip"
      }
    ],
    "explanation": "Week 7, Slide 33: The 82C55A PPI provides 24 parallel I/O pins used for keyboards, printers, and switches."
  },
  {
    "id": "cloze_w7_021",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Intel Support Chips: 82C55A",
    "slideNumber": 33,
    "sourceSentence": "The 24 I/O pins of the 82C55A PPI are organized into three 8-bit ports: Port A, Port B, and Port C.",
    "template": "The 24 I/O pins of the 82C55A PPI are organized into three 8-bit ports: {{b1}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "Port A, Port B, and Port C",
        "acceptedAnswers": [
          "port a, port b, and port c",
          "ports a, b, and c",
          "ports a, b, c",
          "port a, b, c",
          "a, b, and c",
          "a, b, c"
        ],
        "hint": "Names of the three 8-bit ports in the 8255"
      }
    ],
    "explanation": "Week 7, Slide 33: The 82C55A has Port A (8 bits), Port B (8 bits), and Port C (8 bits, split into upper/lower)."
  },
  {
    "id": "cloze_w7_022",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Direct Memory Access (DMA)",
    "slideNumber": 35,
    "sourceSentence": "Direct Memory Access (DMA) allows an external controller to transfer bulk data directly between I/O and memory without involving the CPU.",
    "template": "{{b1}} allows an external controller to transfer bulk data directly between I/O and memory without involving the CPU.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "Direct Memory Access",
        "acceptedAnswers": [
          "direct memory access",
          "dma",
          "direct memory access (dma)"
        ],
        "hint": "High-speed data transfer bypassing the central processor"
      }
    ],
    "explanation": "Week 7, Slide 35: DMA offloads bulk data transfers (e.g. disk sectors, sound buffers) from the processor."
  },
  {
    "id": "cloze_w7_023",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Direct Memory Access: Cycle Stealing",
    "slideNumber": 36,
    "sourceSentence": "In cycle stealing, the DMA controller takes control of the system bus for one bus cycle to transfer a data word.",
    "template": "In {{b1}}, the DMA controller takes control of the system bus for one bus cycle to transfer a data word.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "cycle stealing",
        "acceptedAnswers": [
          "cycle stealing",
          "cycle-stealing",
          "bus stealing"
        ],
        "hint": "Technique seizing individual bus cycles between CPU memory fetches"
      }
    ],
    "explanation": "Week 7, Slide 36: Cycle stealing pauses the CPU for a single clock cycle to transfer a byte/word directly."
  },
  {
    "id": "cloze_w7_024",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Direct Memory Access: Handshake",
    "slideNumber": 38,
    "sourceSentence": "The DMA controller requests bus control by asserting the HOLD line, and the CPU relinquishes the buses and responds with HLDA.",
    "template": "The DMA controller requests bus control by asserting the {{b1}} line, and the CPU relinquishes the buses and responds with HLDA.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "HOLD",
        "acceptedAnswers": [
          "hold",
          "hold line",
          "hold signal"
        ],
        "hint": "Bus request pin asserted to request CPU float its buses"
      }
    ],
    "explanation": "Week 7, Slide 38: DMA handshake: DMA asserts HOLD -> CPU floats address/data/control buses and responds with HLDA (Hold Acknowledge)."
  },
  {
    "id": "cloze_w7_025",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Polling Loop (Foto/21.43.43.jpeg)",
    "slideNumber": 15,
    "sourceSentence": "In the polling loop (POLL_LOOP: LOAD R1, [IO_STATUS_REG]; TEST R1, #READY_BIT; JUMP_IF_ZERO POLL_LOOP), the processor repeatedly tests the READY_BIT and branches back to POLL_LOOP if the result is zero.",
    "template": "In the polling loop (POLL_LOOP: LOAD R1, [IO_STATUS_REG]; TEST R1, #{{b1}}; JUMP_IF_ZERO {{b2}}), the processor repeatedly checks device readiness.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "READY_BIT",
        "acceptedAnswers": [
          "ready_bit",
          "ready bit",
          "ready"
        ],
        "hint": "Status flag mask tested inside POLL_LOOP"
      },
      {
        "id": "b2",
        "targetAnswer": "POLL_LOOP",
        "acceptedAnswers": [
          "poll_loop",
          "poll loop"
        ],
        "hint": "Label jumped to when READY_BIT is zero"
      }
    ],
    "explanation": "Classroom Photo WhatsApp Image 2026-11-02 at 21.43.43.jpeg: POLL_LOOP loads IO_STATUS_REG, tests #READY_BIT, and executes JUMP_IF_ZERO POLL_LOOP."
  },
  {
    "id": "cloze_w7_026",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Isolated I/O in x86 Assembly (Foto/2.jpeg & 23.jpeg)",
    "slideNumber": 18,
    "sourceSentence": "In the x86 Isolated I/O polling example, mov dx, 0x03F8 loads the COM1 serial port address into DX, and in al, dx copies 1 byte from I/O Port 0x03F8 into the AL register.",
    "template": "In the x86 Isolated I/O polling example, mov dx, {{b1}} loads the COM1 serial port address into DX, and {{b2}} copies 1 byte from that I/O port into the AL register.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "0x03F8",
        "acceptedAnswers": [
          "0x03f8",
          "03f8h",
          "3f8h",
          "0x3f8"
        ],
        "hint": "COM1 Serial Port status address loaded into DX"
      },
      {
        "id": "b2",
        "targetAnswer": "in al, dx",
        "acceptedAnswers": [
          "in al, dx",
          "in al,dx"
        ],
        "hint": "x86 instruction reading 1 byte from port [DX] into AL"
      }
    ],
    "explanation": "Classroom Photos 2.jpeg & 23.jpeg: Isolated I/O (x86 Assembly) uses `mov dx, 0x03F8` followed by `in al, dx` to read the status byte."
  },
  {
    "id": "cloze_w7_027",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Isolated I/O Status Check & Output (Foto/2.jpeg & 23.jpeg)",
    "slideNumber": 18,
    "sourceSentence": "After reading the status port in x86 Isolated I/O, test al, 0x01 checks if Bit 0 is set to 1, jz _start loops if not ready, and out dx, al pushes the character A (0x41) out to Port 0x03F9.",
    "template": "After reading the status port in x86 Isolated I/O, {{b1}} checks if Bit 0 is set to 1, jz _start loops if not ready, and {{b2}} pushes the character A (0x41) out to Port 0x03F9.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "test al, 0x01",
        "acceptedAnswers": [
          "test al, 0x01",
          "test al,0x01",
          "test al, 1",
          "test al, 01h"
        ],
        "hint": "Instruction checking if status bit 0 in AL is set"
      },
      {
        "id": "b2",
        "targetAnswer": "out dx, al",
        "acceptedAnswers": [
          "out dx, al",
          "out dx,al"
        ],
        "hint": "x86 instruction writing AL out to port [DX]"
      }
    ],
    "explanation": "Classroom Photos 2.jpeg & 23.jpeg: `test al, 0x01` checks Bit 0; when ready, `mov dx, 0x03F9`, `mov al, 0x41`, and `out dx, al` transmit ASCII \"A\"."
  },
  {
    "id": "cloze_w7_028",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "Memory-Mapped I/O in ARM64 Assembly (Foto/2.jpeg & 23.jpeg)",
    "slideNumber": 19,
    "sourceSentence": "In the ARM64 Memory-Mapped I/O example, ldr x0, =0x40020000 loads the base address of the MMIO register block, ldr w1, [x0, #0x10] reads the status register, and str w2, [x0, #0x04] writes the character A to the data register.",
    "template": "In the ARM64 Memory-Mapped I/O example, ldr x0, =0x40020000 loads the MMIO base pointer, {{b1}} w1, [x0, #0x10] reads the status register, and {{b2}} w2, [x0, #0x04] writes the character A to the data register.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "ldr",
        "acceptedAnswers": [
          "ldr",
          "load register"
        ],
        "hint": "ARM64 load instruction used to read the memory-mapped status register"
      },
      {
        "id": "b2",
        "targetAnswer": "str",
        "acceptedAnswers": [
          "str",
          "store register"
        ],
        "hint": "ARM64 store instruction used to write to the memory-mapped data register"
      }
    ],
    "explanation": "Classroom Photos 2.jpeg & 23.jpeg: Memory-Mapped I/O uses standard memory load (`ldr w1, [x0, #0x10]`) and store (`str w2, [x0, #0x04]`) instructions rather than special I/O instructions."
  },
  {
    "id": "cloze_w7_029",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "DMA Function: 4 Parameters Sent by Processor",
    "slideNumber": 36,
    "sourceSentence": "When initiating a DMA transfer, the processor sends four items to the DMA module: whether a read or write is requested, the I/O device address, the starting location in memory (address register), and the number of words to be transferred (data count register).",
    "template": "When initiating a DMA transfer, the processor sends the read/write command, the I/O device address, the starting memory location stored in the {{b1}}, and the word count stored in the {{b2}}.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "address register",
        "acceptedAnswers": [
          "address register",
          "dma address register"
        ],
        "hint": "DMA register storing the starting memory location"
      },
      {
        "id": "b2",
        "targetAnswer": "data count register",
        "acceptedAnswers": [
          "data count register",
          "count register",
          "word count register"
        ],
        "hint": "DMA register storing the number of words to be read or written"
      }
    ],
    "explanation": "Week 7, Slide 36: The DMA module stores the starting memory address in its address register and the word count in its data count register."
  },
  {
    "id": "cloze_w7_030",
    "week": 7,
    "weekTitle": "Week 7 - Input Output",
    "topic": "DMA Completion & Processor Involvement",
    "slideNumber": 38,
    "sourceSentence": "When a DMA block transfer is complete, the DMA module sends an interrupt signal to the processor, so the processor is involved only at the beginning and end of the transfer.",
    "template": "When a DMA block transfer is complete, the DMA module sends an {{b1}} signal to the processor, so the processor is involved only at the {{b2}} of the transfer.",
    "blanks": [
      {
        "id": "b1",
        "targetAnswer": "interrupt",
        "acceptedAnswers": [
          "interrupt",
          "interrupt signal"
        ],
        "hint": "Signal sent by the DMA controller to notify the CPU that the entire block has been transferred"
      },
      {
        "id": "b2",
        "targetAnswer": "beginning and end",
        "acceptedAnswers": [
          "beginning and end",
          "start and end",
          "beginning and the end"
        ],
        "hint": "When the CPU is involved during a DMA block operation (Slide 38)"
      }
    ],
    "explanation": "Week 7, Slide 38: The DMA module transfers the entire block directly to or from memory and sends an interrupt when done; thus the processor is involved only at the beginning and end."
  }
];

/**
 * Total count of authored questions in the bank.
 */
export const TOTAL_CLOZE_QUESTIONS = CLOZE_QUESTIONS.length;

/**
 * Utility to fetch questions belonging to a specific primary week (1..7).
 */
export function getQuestionsByWeek(week: number): ClozeQuestion[] {
  return CLOZE_QUESTIONS.filter((q) => q.week === week);
}
