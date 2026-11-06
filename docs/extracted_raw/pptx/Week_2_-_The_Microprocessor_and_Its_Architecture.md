# Week 2 - The Microprocessor and Its Architecture

**Source File**: `Week 2 - The Microprocessor and Its Architecture.pptx`

**Total Slides**: 40

---

## Slide 1

µP

BMI3121 · MICROPROCESSOR SYSTEMS

Week 2

The Microprocessor and Its Architecture

The internal programming model: registers, the flags register, segment registers, and real-mode memory addressing.

Course content adapted from Brey, The Intel Microprocessors (2008), and supplementary course notes.


---

## Slide 2

µP

Week 2 · Learning outcomes

What You Will Be Able to Do

Week 2 · BMI3121 Microprocessor Systems

1

1

Distinguish program-visible from program-invisible registers, and name the 8-, 16-, 32-, and 64-bit register families.

2

Identify each multipurpose register (AX, BX, CX, DX, SI, DI, BP, SP) and its typical role in a program.

3

Read the flags register and explain what each status flag reports about the last operation.

4

Name the six segment registers and explain how a segment combines with an offset to form a physical address.

5

Calculate a 20-bit physical address from a segment:offset pair, and explain why this scheme makes programs relocatable.


---

## Slide 3

µP

Week 2 · Agenda

Five Topics, One Programming Model

Week 2 · BMI3121 Microprocessor Systems

2

01

The programming model

Register families, and visible vs. invisible registers

02

Multipurpose registers

AX, BX, CX, DX, SI, DI, BP, SP

03

Special-purpose registers and the flags

IP, SP, and every bit of the flags register

04

Segment registers

CS, DS, ES, SS, FS, GS

05

Real-mode memory addressing

Segment:offset, physical addresses, and relocation


---

## Slide 4

01 / 05

The Programming Model

What is inside the microprocessor, and how the registers are organized

Week 2 · BMI3121 Microprocessor Systems

Section divider    3


---

## Slide 5

µP

Section 1

Before Writing Code, Know What Is Inside

Week 2 · BMI3121 Microprocessor Systems

4

Before a program is written or any instruction is investigated, the internal configuration of the microprocessor must be known.
This internal configuration is called the programming model: the set of registers a programmer can use or must account for.
In a multi-core microprocessor, each core contains the same programming model. The only difference is that each core runs a separate task or thread at the same time.

One core, one model

A quad-core processor is, from the programmer's view, four identical register sets running independently. Everything in this lecture describes one of those cores.


---

## Slide 6

µP

Section 1

Program-Visible vs. Program-Invisible Registers

Week 2 · BMI3121 Microprocessor Systems

5

Program-visible

Registers used during application programming, and specified directly by instructions. These are the registers this course works with day to day.

Examples: AX, BX, CX, DX, SI, DI, BP, SP, IP, flags, segment registers

Program-invisible

Registers that cannot be addressed directly by application instructions. They may still be used indirectly, during system-level or protected-mode programming.

Out of scope for this course's real-mode focus, but worth knowing they exist.


---

## Slide 7

µP

Section 1

One Family, Four Widths

Week 2 · BMI3121 Microprocessor Systems

6


| Width | Register examples | Introduced with |
| --- | --- | --- |
| 8-bit | AH, AL, BH, BL, CH, CL, DH, DL | 8086 |
| 16-bit | AX, BX, CX, DX, SP, BP, DI, SI, IP, FLAGS, CS, DS, ES, SS | 8086 |
| 32-bit | EAX, EBX, ECX, EDX, EDI, ESI, … | 80386 |
| 64-bit | RAX, RBX, RCX, RDX, …, plus R8–R15 | 64-bit extensions |

ADD AL, AH is a valid instruction: it adds the 8-bit contents of AH to AL. The two-letter names in the 8-bit row are how a programmer refers to each half of a 16-bit register.


---

## Slide 8

µP

Section 1

Nested Widths: RAX Contains EAX Contains AX Contains AH/AL

Week 2 · BMI3121 Microprocessor Systems

7

RAX (64-bit)

EAX (32-bit)

AX (16-bit)

AH

AL

bits 15–8

bits 7–0

Writing to a smaller register only changes that portion of the wider register. Writing AL leaves AH, and the upper 48 bits of RAX, untouched.


---

## Slide 9

µP

Section 1

R8–R15: The Extended 64-Bit Registers

Week 2 · BMI3121 Microprocessor Systems

8

Eight additional 64-bit registers, R8 through R15, are available when 64-bit extensions are enabled.
Each can be addressed as a byte, word, doubleword, or quadword, using a size override, but only the rightmost 8 bits are addressable as a byte. Unlike AX's family, there is no way to directly address bits 8–15 of R8–R15 as a byte.


| Register size | Override | Bits accessed | Example |
| --- | --- | --- | --- |
| 8 bits | B | 7–0 | MOV R9B, R10B |
| 16 bits | W | 15–0 | MOV R10W, AX |
| 32 bits | D | 31–0 | MOV R14D, R15D |
| 64 bits | (none) | 63–0 | MOV R13, R12 |


---

## Slide 10

02 / 05

Multipurpose Registers

AX, BX, CX, DX, SI, DI, BP, and SP: the registers a program uses every day

Week 2 · BMI3121 Microprocessor Systems

Section divider    9


---

## Slide 11

µP

Section 2

AX: The Accumulator

Week 2 · BMI3121 Microprocessor Systems

10

RAX (64) → EAX (32) → AX (16) → AH / AL (8)

AX is the accumulator register: the primary register for arithmetic results.
It is required by several instructions, including multiplication, division, and some adjustment instructions.
Addressing an 8- or 16-bit portion of AX changes only that portion. The remaining bits of the wider register are unaffected.


---

## Slide 12

µP

Section 2

BX: The Base Register

Week 2 · BMI3121 Microprocessor Systems

11

RBX (64) → EBX (32) → BX (16) → BH / BL (8)

BX is addressable as RBX, EBX, BX, BH, and BL.
Its defining role: it holds the offset address of a location in the memory system, most often paired with the DS (data segment) register.


---

## Slide 13

µP

Section 2

CX: The Count Register

Week 2 · BMI3121 Microprocessor Systems

12

CX is addressable as RCX, ECX, CX, CH, and CL.
It holds the count for instructions that repeat: shift, rotate, repeated string instructions, and LOOP.


| Instruction type | Count register used |
| --- | --- |
| Shift and rotate | CL (the 8-bit count) |
| Repeated string instructions | CX |
| LOOP / LOOPD | CX or ECX |
| LOOP, in 64-bit mode | RCX |


---

## Slide 14

µP

Section 2

DX: The Data Register

Week 2 · BMI3121 Microprocessor Systems

13

RDX (64) → EDX (32) → DX (16) → DH / DL (8)

DX holds part of the result from a multiplication, or part of the dividend before a division; AX and DX often work as a pair for wide arithmetic.
DX can also address memory data.


---

## Slide 15

µP

Section 2

BP, DI, and SI: Pointer and Index Registers

Week 2 · BMI3121 Microprocessor Systems

14

BP

Base Pointer

Points to a memory location for memory data transfers, typically within the stack segment.

DI

Destination Index

Addresses the destination string data for string instructions.

SI

Source Index

Addresses the source string data for string instructions.


---

## Slide 16

µP

Section 2 · Reference

Multipurpose Registers at a Glance

Week 2 · BMI3121 Microprocessor Systems

15


| Register | Full name | Primary role |
| --- | --- | --- |
| AX | Accumulator | Arithmetic results; required by MUL, DIV |
| BX | Base | Holds an offset address into memory |
| CX | Count | Loop, shift, rotate, and string repeat counts |
| DX | Data | Extends AX for wide multiply/divide; memory data |
| SI / DI | Source / Destination Index | String instruction source/destination addresses |
| BP / SP | Base / Stack Pointer | Stack-frame and stack-top addressing |


---

## Slide 17

03 / 05

Special-Purpose Registers and the Flags

IP, SP, and every status bit in the flags register

Week 2 · BMI3121 Microprocessor Systems

Section divider    16


---

## Slide 18

µP

Section 3

IP and SP: Two Registers With One Job Each

Week 2 · BMI3121 Microprocessor Systems

17

IP (Instruction Pointer)

Addresses the next instruction, in the section of memory defined as the code segment. It can be modified by a jump or call instruction. Also known as IP, EIP, or RIP, depending on operating mode.

SP (Stack Pointer)

Addresses the stack area of memory. Data is stored to, and retrieved from, the stack through this pointer. Also known as SP or ESP, depending on operating mode.


---

## Slide 19

µP

Section 3

RFLAGS: One Register, Many Signals

Week 2 · BMI3121 Microprocessor Systems

18

The flags register (RFLAGS, EFLAGS, or FLAGS depending on mode) indicates the condition of the microprocessor and controls some of its operation.
Most flags are set automatically by arithmetic and logic operations. Data transfer instructions do not affect them.
The next several slides work through each flag bit, grouped by what kind of information it carries.

Status flags report a fact about the last result (zero? negative? carried out?). Control flags change how the processor behaves (accept interrupts? step through code? count up or down?).


---

## Slide 20

µP

Section 3 · Status flags

Carry and Parity

Week 2 · BMI3121 Microprocessor Systems

19

C

Carry

Holds the carry after addition, or the borrow after subtraction. Also used to indicate certain error conditions.

P

Parity

Logic 0 for odd parity, logic 1 for even parity, based on the count of 1 bits in the low byte of the result. Mostly a legacy flag: modern systems check parity in communication hardware, not in the MP.


---

## Slide 21

µP

Section 3 · Status flags

Auxiliary Carry, Zero, and Sign

Week 2 · BMI3121 Microprocessor Systems

20


| Flag | What it reports |
| --- | --- |
| A (Auxiliary carry) | Carry (half-carry) after addition, or borrow after subtraction, between bit positions 3 and 4. Tested by DAA and DAS to adjust AL after BCD arithmetic. |
| Z (Zero) | Set to 1 when the result of an arithmetic or logic operation is exactly zero. |
| S (Sign) | Copies the arithmetic sign of the result: 1 means the leftmost (sign) bit is set (negative); 0 means positive. |


---

## Slide 22

µP

Section 3 · Control flags

Trap, Interrupt, and Direction

Week 2 · BMI3121 Microprocessor Systems

21


| Flag | What it controls |
| --- | --- |
| T (Trap) | Enables trapping through an on-chip debugging feature; used by debuggers such as Visual C++. |
| I (Interrupt) | Controls the INTR (interrupt request) input pin. I=1 enables interrupts. Set and cleared with STI and CLI. |
| D (Direction) | Selects increment (D=0) or decrement (D=1) mode for DI and SI during string instructions. Set and cleared with STD and CLD. |


---

## Slide 23

µP

Section 3 · Worked example

Overflow: When a Signed Result Doesn't Fit

Week 2 · BMI3121 Microprocessor Systems

22

O (Overflow) is set when adding or subtracting signed numbers produces a result that exceeds the machine's representable range. For unsigned operations, this flag is simply ignored.

8-bit signed addition: 7FH + 01H

7FH (+127) + 01H (+1) = 80H

80H, read as signed, is −128. Adding two positive numbers cannot legitimately produce a negative result: this is an overflow condition, and O is set to 1.

Note the difference from Carry: Carry tracks the unsigned bit pattern; Overflow tracks whether the signed interpretation still makes sense.


---

## Slide 24

µP

Section 3 · Control flags

IOPL: I/O Privilege Level

Week 2 · BMI3121 Microprocessor Systems

23

IOPL is used in protected mode to select the required privilege level for I/O device access.
If the current task's privilege level is at least as trusted as the IOPL, I/O instructions execute without hindrance.
If the task's privilege is lower (less trusted) than the IOPL, the program is suspended with an interrupt.

00 = highest privilege (most trusted)          11 = lowest privilege (least trusted)


---

## Slide 25

µP

Section 3 · Control flags

Nested Task, Resume, Virtual Mode, and Alignment Check

Week 2 · BMI3121 Microprocessor Systems

24


| Flag | What it controls |
| --- | --- |
| NT (Nested Task) | Indicates the current task is nested within another task, in protected mode. |
| RF (Resume) | Used during debugging, to control resumption of execution after the next instruction. |
| VM (Virtual Mode) | Allows multiple 1 MB DOS memory partitions to coexist, so a system can run several DOS programs at once inside a modern OS. |
| AC (Alignment Check) | Activates when a word or doubleword is addressed on a boundary that is not word- or doubleword-aligned. |


---

## Slide 26

µP

Section 3 · Control flags

VIF, VIP, and ID: Pentium 4 Extensions

Week 2 · BMI3121 Microprocessor Systems

25


| Flag | What it controls |
| --- | --- |
| VIF (Virtual Interrupt) | A copy of the interrupt flag, available on Pentium 4 processors. |
| VIP (Virtual Interrupt Pending) | Used in multitasking environments to give the operating system a virtual interrupt flag, on P4 processors. |
| ID (Identification) | Indicates that the processor supports the CPUID instruction, which reports version and manufacturer information. |


---

## Slide 27

µP

Section 3 · Reference

Flags Register: Complete Reference

Week 2 · BMI3121 Microprocessor Systems

26


| Flag | Type | Reports / controls |
| --- | --- | --- |
| C, P, A, Z, S, O | Status | Carry, parity, auxiliary carry, zero, sign, overflow: set automatically by arithmetic/logic ops |
| T, I, D | Control | Trap (debug), interrupt enable, string direction |
| IOPL, NT, RF, VM, AC | System / protected mode | I/O privilege, nested task, resume, virtual 8086 mode, alignment check |
| VIF, VIP, ID | Pentium 4 extensions | Virtual interrupt, virtual interrupt pending, CPUID support |

For this course, the six status flags (C, P, A, Z, S, O) matter most: they are what conditional jump instructions read.


---

## Slide 28

04 / 05

Segment Registers

CS, DS, ES, SS, FS, and GS: the registers that locate a memory segment

Week 2 · BMI3121 Microprocessor Systems

Section divider    27


---

## Slide 29

µP

Section 4

CS, DS, and ES

Week 2 · BMI3121 Microprocessor Systems

28

Segment registers generate memory addresses when combined with other registers. Each defines the start of a 64K-byte region.

CS

Code Segment

Holds the section of memory containing the code (programs and procedures) the MP executes.

DS

Data Segment

Holds most of the data used by a program. Data here is addressed by an offset, held in another register.

ES

Extra Segment

An additional data segment, used by some string instructions to hold destination data.


---

## Slide 30

µP

Section 4

SS, FS, and GS

Week 2 · BMI3121 Microprocessor Systems

29

SS

Stack Segment

Defines the stack memory. Together with the stack pointer (and sometimes BP), it determines the stack's entry point.

FS

Supplemental

An additional segment register, with no fixed conventional role in real mode.

GS

Supplemental

An additional segment register. Windows uses FS and GS internally, but no application-level details are specified for this course.


---

## Slide 31

µP

Section 4 · Reference

All Six Segment Registers

Week 2 · BMI3121 Microprocessor Systems

30


| Register | Segment |
| --- | --- |
| CS | Code segment: where the running program's instructions live |
| DS | Data segment: where most program data lives |
| ES | Extra segment: destination data for string instructions |
| SS | Stack segment: where the stack lives |
| FS, GS | Supplemental segments, used internally by the operating system |


---

## Slide 32

05 / 05

Real-Mode Memory Addressing

How a segment register and an offset combine to reach any byte in the first megabyte

Week 2 · BMI3121 Microprocessor Systems

Section divider    31


---

## Slide 33

µP

Section 5

Real Mode: The First Megabyte

Week 2 · BMI3121 Microprocessor Systems

32

Real mode operation allows the microprocessor to address only the first 1 MB of memory space.
Modern Windows systems do not run application code in real mode; it survives today mainly as a teaching model and in boot-time firmware.
Understanding real mode addressing is still valuable: it is the clearest possible illustration of how segmentation works.

1 MB

00000H to FFFFFH: the entire real-mode address space, reachable with a 20-bit physical address.


---

## Slide 34

µP

Section 5

Segments and Offsets

Week 2 · BMI3121 Microprocessor Systems

33

A memory location in real mode is reached by combining a segment address and an offset address.
The segment address, held in a segment register, marks the beginning of a 64K-byte memory segment.
The offset address selects a specific byte within that 64K-byte segment.


---

## Slide 35

µP

Section 5 · Worked example

From Segment Register to Physical Range

Week 2 · BMI3121 Microprocessor Systems

34

In real mode, the microprocessor appends a 0H to the rightmost end of the segment register's value, then adds the offset, producing a 20-bit physical address.

Segment register = 1000H          →          Segment begins at physical address 10000H

Because a real-mode segment is always 64K bytes (65,536 = FFFFH), once the starting address is known, the ending address follows by adding FFFFH.

10000H + FFFFH = 1FFFFH  →  segment spans 10000H–1FFFFH


---

## Slide 36

µP

Section 5 · Worked example

Three More Segment Ranges

Week 2 · BMI3121 Microprocessor Systems

35


| Segment register | Starting address | Ending address |
| --- | --- | --- |
| 2000H | 20000H | 2FFFFH |
| 2001H | 20010H | 3000FH |
| 2100H | 21000H | 30FFFH |

The offset address is always added to the segment's starting address to locate a byte of data. A segment:offset pair is sometimes written directly, for example 1000:2000 for a segment of 1000H with an offset of 2000H.

Notice: 2001H starts only 10H above 2000H's start, even though the register value increased by 1. Each increment of a segment register shifts the start by only 10H (16 decimal) bytes.


---

## Slide 37

µP

Section 5

Default Segment and Offset Registers

Week 2 · BMI3121 Microprocessor Systems

36

The microprocessor follows a fixed set of rules for which segment register pairs with which offset register, for a given purpose.


| Segment | Offset | Special purpose |
| --- | --- | --- |
| CS | IP | Instruction address |
| SS | SP or BP | Stack address |
| DS | BX, DI, SI, or an 8/16-bit number | Data address |
| ES | DI (for string instructions) | String destination address |


---

## Slide 38

µP

Section 5 · Worked example

Calculating a Physical Address

Week 2 · BMI3121 Microprocessor Systems

37

CS:IP → instruction address

CS = 1400H
IP = 1200H

14000H + 1200H

= 15200H

The next instruction is fetched from physical address 15200H.

SS:BP → stack address

SS = 2000H
BP = 3000H

20000H + 3000H

= 23000H

This is the address accessed within the stack segment.


---

## Slide 39

µP

Section 5

Why Segmentation? Relocatable Programs and Data

Week 2 · BMI3121 Microprocessor Systems

38

Segment-plus-offset addressing looks complicated, but it buys the system a real advantage: relocatability.
A relocatable program can be placed into any area of memory and executed without change. Relocatable data can be placed anywhere and used without changing the program.
This scheme let DOS programs load into whatever memory happened to be free, and let real-mode programs continue to function inside protected-mode systems.
It matters on real hardware for another reason too: not every machine has the same memory layout. Relocatable software and data are what make a general-purpose personal computer possible, and the same idea underlies swapping and paging for virtual memory.


---

## Slide 40

µP

Section 5 · Summary

Key Takeaways

Week 2 · BMI3121 Microprocessor Systems

39

The programming model, in brief

Registers scale from 8 to 64 bits, and the smaller names (AL, AX, EAX) are all views into the same physical register (RAX).
AX, BX, CX, DX, SI, DI, BP, and SP each carry a conventional role, even though most are technically general-purpose.
The flags register reports facts (status flags) and configures behavior (control flags); conditional jumps read the status flags.
Six segment registers, CS, DS, ES, SS, FS, GS, mark the start of 64K-byte regions.

Key takeaways

A physical address in real mode is always: segment × 10H + offset.
A real-mode segment is fixed at 64K bytes, so its ending address is always its start plus FFFFH.
Segment:offset addressing exists to make programs and data relocatable, a requirement for general-purpose computing.

Next week: addressing modes, in depth, using MOV, CALL, JUMP, PUSH, and POP.

Sources: Brey, B. B. (2008). The Intel Microprocessors (8th ed.). Prentice Hall. Course notes, BMI3121.


---
