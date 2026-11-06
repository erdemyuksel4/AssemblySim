# Week 1 - Microprocessors and the Computer

**Source File**: `Week 1 - Microprocessors and the Computer.pptx`

**Total Slides**: 40

---

## Slide 1

µP

BMI3121 · MICROPROCESSOR SYSTEMS

Week 1

Microprocessors and the Computer

How a microprocessor-based system is organized, how it represents numbers and data, and how it makes decisions.

Course content adapted from Brey, The Intel Microprocessors (2008), and supplementary course notes.


---

## Slide 2

µP

Week 1 · Learning outcomes

What You Will Be Able to Do

Week 1 · BMI3121 Microprocessor Systems

1

1

Describe the block structure of a microprocessor-based computer system and explain what each bus carries.

2

Explain how the classic PC memory map divides address space among program, system, and extended memory.

3

List the three core tasks a microprocessor performs, and identify the flag bits that support its decisions.

4

Convert numbers between decimal, binary, octal, and hexadecimal, including fractional values.

5

Represent negative numbers using one's and two's complement, and distinguish ASCII, Unicode, and BCD data formats.


---

## Slide 3

µP

Week 1 · Agenda

Five Topics, One Foundation

Week 1 · BMI3121 Microprocessor Systems

2

01

The microprocessor-based computer system

Blocks, buses, and how they connect

02

Memory and I/O organization

The classic PC memory map and I/O space

03

The microprocessor's role and core operations

Data transfer, arithmetic/logic, and flow control

04

Number systems

Decimal, binary, octal, hexadecimal, and conversions

05

Complements and computer data formats

Negative numbers, ASCII/Unicode, and BCD


---

## Slide 4

01 / 05

The Microprocessor-Based
Computer System

Blocks, buses, and how a personal computer is organized around them

Week 1 · BMI3121 Microprocessor Systems

Section divider    3


---

## Slide 5

µP

Section 1 · Foundations

From Room-Sized Machines to a Single Chip

Week 1 · BMI3121 Microprocessor Systems

4

Computer systems have changed a great deal in a short time. Machines that once filled entire rooms have shrunk to a desktop system, largely because of the microprocessor.
The microprocessor (MP) is the controlling element of a computer system. It is also called the CPU (Central Processing Unit).
The MP controls memory and I/O exclusively through a series of connections called buses.
Everything else in this course builds on this one fact: memory and I/O do nothing on their own. The MP directs every transfer and every operation.

Definition

Microprocessor (MP)

A single integrated circuit that acts as the central processing unit (CPU) of a computer system. It controls memory and I/O entirely through bus connections, and it executes instructions stored in memory.

Also called: CPU


---

## Slide 6

µP

Section 1

Three Blocks, Connected by Buses

Week 1 · BMI3121 Microprocessor Systems

5

A bus is a set of common connections that carry the same type of information between blocks. Three named buses link the microprocessor to memory and to the I/O system.

Address bus

Data bus

Control bus

I/O System

Keyboard, display, printers, storage

Microprocessor

Controls memory and I/O via buses

Memory

ROM / RAM, program + data storage

The address bus carries the location the MP wants to read or write. The data bus carries the value itself. The control bus carries timing and read/write signals that keep the transfer synchronized.


---

## Slide 7

µP

Section 1

Address, Data, and Control Buses

Week 1 · BMI3121 Microprocessor Systems

6

Address bus

Carries the memory or I/O address the MP wants to access. It is one-directional: only the MP places addresses on it. Its width in bits sets how many locations can be addressed.

Data bus

Carries the actual value being transferred. It is bidirectional: the MP can write data out to memory/I/O or read data in from them, over the same lines.

Control bus

Carries read/write signals and timing information that keep the address and data buses synchronized, so every device knows when to place or accept data.


---

## Slide 8

µP

Section 1 · Worked example

Address Lines Determine Addressable Space

Week 1 · BMI3121 Microprocessor Systems

7

If a bus has n address lines, it can address 2ⁿ distinct locations.

I/O addressing

16-bit I/O address bus
2¹⁶ = 65,536 (64K) addressable I/O ports
Range: 0000H to FFFFH

Memory addressing (8086)

20-bit memory address bus
2²⁰ = 1,048,576 bytes = 1 MB of addressable memory
Range: 00000H to FFFFFH
Modern 64-bit processors use much wider address buses, addressing far more than 1 MB. The formula stays the same; only n grows.


---

## Slide 9

µP

Section 1

Data Bus Width Has Grown With Each Generation

Week 1 · BMI3121 Microprocessor Systems

8


| Processor | Data bus width | Typical clock speed |
| --- | --- | --- |
| Intel 8086 (1978) | 16-bit | 4.77–8 MHz |
| Intel 80286 | 16-bit | 6–20 MHz |
| Intel 80386 | 32-bit | 16–33 MHz |
| Intel 80486 | 32-bit | 25–50 MHz |
| Modern desktop CPU (multi-core) | 64-bit | 3–5+ GHz per core |

A wider data bus moves more bits per transfer. The 8086 transferred 16 bits at a time; modern processors transfer 64 bits per cycle across multiple cores, which is one reason instruction throughput has grown by orders of magnitude.


---

## Slide 10

02 / 05

Memory and I/O
Organization

The classic PC memory model (DOS-era), still a useful frame for understanding address space

Week 1 · BMI3121 Microprocessor Systems

Section divider    9


---

## Slide 11

µP

Section 2

The Memory System: Three Regions

Week 1 · BMI3121 Microprocessor Systems

10

The classic personal-computer memory system is divided into three main parts. Each occupies its own range of hexadecimal addresses.

TPA

Transient Program Area

Holds the operating system and application programs currently loaded and running.

System Area

Video RAM and ROM/BIOS

Holds video display memory and the ROM or flash memory that boots and controls the system.

XMS

Extended Memory System

Memory above the original 1 MB boundary, used by later systems and modern operating systems.


---

## Slide 12

µP

Section 2

TPA: Where Programs Live

Week 1 · BMI3121 Microprocessor Systems

11

The TPA holds the disk operating system (DOS) and other programs that control the computer system.
This is a DOS-era concept, not directly applicable to how Windows manages memory, but it is a useful starting point for understanding address-space partitioning.
The TPA also stores both active and inactive DOS application programs at the same time.

Why start with DOS?

The DOS memory map is small and fully documented, which makes it an approachable first example of how a real system partitions address space between programs, system code, and video memory. The ideas generalize directly to modern operating systems.


---

## Slide 13

µP

Section 2

Every Byte Has a Hexadecimal Address

Week 1 · BMI3121 Microprocessor Systems

12

Memory locations are numbered using hexadecimal addresses, one number per byte.
1234H and 0x1234 are two common ways of writing the same hexadecimal address.
Interrupt vectors, stored at fixed low addresses, give access to features of DOS, the BIOS, and applications.
IO.SYS is the program that lets DOS use the keyboard, video display, and printers; drivers control installable devices such as a mouse or optical drive; COMMAND.COM controls the system from the keyboard in DOS mode.
These core files should never be deleted to free disk space. Removing them leaves the system unable to start.

Address notation

1234H

=

0x1234

Both notations name the same address. The trailing H and the leading 0x are the two conventions you will see most often in this course and in datasheets.


---

## Slide 14

µP

Section 2

The System Area: Video RAM and ROM/BIOS

Week 1 · BMI3121 Microprocessor Systems

13

The system area contains programs held in ROM or flash memory, plus read/write (RAM) regions used for data storage.
The first part of the system area holds video display RAM and video control programs, in ROM or flash memory. This region runs from A0000H to C7FFFH.
The exact size and layout depend on the video display adapter installed in the system.

A0000H – C7FFFH

Video display RAM and video BIOS/ROM. Size and exact use depend on the installed video adapter.


---

## Slide 15

µP

Section 2

System Area Address Map

Week 1 · BMI3121 Microprocessor Systems

14


| Address range | Contents |
| --- | --- |
| A0000H – C7FFFH | Video display RAM and video control ROM/flash memory |
| C8000H – DFFFFH | Often free; used for expanded memory (EMS) on many PCs |
| E0000H – EFFFFH | Cassette BASIC on early IBM PCs; often free on newer systems |
| F0000H – FFFFFH | System BIOS ROM: setup routines, then basic I/O service routines |

The system BIOS occupies the top 64K bytes of the system area and controls the basic I/O devices. It does not control the video system, which has its own BIOS ROM starting at C0000H.


---

## Slide 16

µP

Section 2

Modern Systems: Paging and Virtual Memory

Week 1 · BMI3121 Microprocessor Systems

15

The TPA starting at address 00000000H does not mean a Windows program actually begins at that physical address.
Modern operating systems give each process its own page table, which maps every 4K-byte page of the process to a location in physical memory.
This lets an application use far more address space than the amount of physical memory installed.
When physical memory runs short, the OS uses the hard disk as an extension of RAM. This is virtual memory.

Then vs. now

DOS model: one fixed physical map, shared by everything.
Modern model: each process sees its own virtual address space, backed by page tables.
Physical RAM becomes a cache for whatever the OS decides is active.


---

## Slide 17

µP

Section 2

I/O Space: A Separate Address Range

Week 1 · BMI3121 Microprocessor Systems

16

The I/O space extends from I/O port 0000H to port FFFFH: 65,536 possible port addresses.
An I/O port address behaves like a memory address, but it identifies an I/O device rather than a memory location.
On a real system, the operating system's device manager tool lists the I/O devices connected to the computer and the port ranges they use.

0000H

FFFFH


---

## Slide 18

µP

Section 2

Why You Rarely Address I/O Directly

Week 1 · BMI3121 Microprocessor Systems

17

Most I/O devices are not addressed directly by application code.
The system BIOS ROM addresses these basic devices instead. Their exact location and behavior can vary from one computer to another.
Access to most I/O devices should go through Windows, DOS, or BIOS function calls, to keep software compatible across different hardware.

Layering, in one line

Application

OS / DOS

BIOS

Hardware I/O port


---

## Slide 19

03 / 05

The Microprocessor's Role and Core Operations

What the MP actually spends its time doing, instruction after instruction

Week 1 · BMI3121 Microprocessor Systems

Section divider    18


---

## Slide 20

µP

Section 3

The Microprocessor Controls Memory and I/O

Week 1 · BMI3121 Microprocessor Systems

19

The MP is the controlling element in a computer system. It controls memory and I/O through the series of connections called buses introduced in Section 1.
The buses select a memory or I/O device, transfer data between that device and the MP, and carry the control signals that time the transfer.
Memory and I/O are controlled through instructions. Instructions are stored in memory and executed one after another by the MP.

The instruction cycle

1

Fetch instruction from memory

2

Decode what it asks for

3

Execute it (ALU, transfer, or flow change)

4

Repeat, for the next instruction


---

## Slide 21

µP

Section 3

Three Core Tasks, Endlessly Repeated

Week 1 · BMI3121 Microprocessor Systems

20

1

Data transfer

Moving data between the MP itself and the memory or I/O system.

2

Arithmetic and logic

Executing simple arithmetic and logic instructions on that data.

3

Program flow

Changing the flow of the program through simple decisions.

The power of the microprocessor is its ability to execute these three tasks, in combination, at a rate of millions to billions of instructions per second, from a program (a group of instructions) stored in memory.


---

## Slide 22

µP

Section 3

From Megahertz to Multi-Core Gigahertz

Week 1 · BMI3121 Microprocessor Systems

21


|   | Intel 8086 (1978) | Modern desktop CPU |
| --- | --- | --- |
| Clock speed | 4.77–8 MHz | 3–5+ GHz, 6–16 cores |
| Approx. throughput | Well under 1 million instructions/sec | Tens of billions of instructions/sec |
| Data bus | 16-bit | 64-bit |

Clock speed alone does not measure performance: instructions per cycle, cache size, memory speed, and core count all matter. Still, the combined effect of higher clock speed, wider data paths, and many parallel cores explains most of the gap between 1978 and today.

MIPS / FLOPS: millions (or billions) of instructions, or floating-point operations, per second. These are the standard units for comparing raw processor throughput.


---

## Slide 23

µP

Section 3

Arithmetic and Logic Operations

Week 1 · BMI3121 Microprocessor Systems

22

These operations are simple on their own, but combining them solves very complex problems. Data comes from the memory system or from internal registers.

Arithmetic

Addition, subtraction, multiplication, division

Logic

AND, OR, NOT, NEG

Bit manipulation

Shift, rotate

Data widths for these operations vary. See the next slide for the standard widths used throughout this course.


---

## Slide 24

µP

Section 3

Data Widths: Byte, Word, Doubleword, Quadword

Week 1 · BMI3121 Microprocessor Systems

23


| Term | Width | Typical use |
| --- | --- | --- |
| Byte | 8 bits | Smallest addressable unit of memory |
| Word | 16 bits | Native register size on the 8086 |
| Doubleword | 32 bits | Native register size from the 80386 onward |
| Quadword | 64 bits | Native register size on modern processors |

These widths recur throughout the course: register sizes, memory operand sizes, and instruction operand sizes are all expressed in bytes, words, doublewords, or quadwords.


---

## Slide 25

µP

Section 3

Program Flow Decisions Rest on Flag Bits

Week 1 · BMI3121 Microprocessor Systems

24

Simple decisions control program flow by testing numeric facts about the result of the last operation.
A typical pattern is a CMP or TEST instruction, which sets flag bits, followed by a conditional jump instruction that reads them.
Five flags matter most at this stage: Zero, Sign, Carry, Parity, and Overflow. The next slide summarizes each, plus a few flags used less often.

The pattern

CMP AL, 5

sets Z, S, C, P, O

JE label1

reads Z, branches if 1


---

## Slide 26

µP

Section 3 · Reference

Flag Bit Reference Table

Week 1 · BMI3121 Microprocessor Systems

25


| Flag | Tests for |
| --- | --- |
| Z (Zero) | Whether the result of an operation is zero |
| S (Sign) | Whether the result is positive or negative |
| C (Carry) | Carry out after addition, or borrow after subtraction |
| P (Parity) | Whether the result has an even or odd number of 1 bits |
| O (Overflow) | Whether a signed result exceeds the representable range |
| A (Auxiliary carry) | Carry/borrow between bit positions 3 and 4 (used in BCD arithmetic) |

These bits live in the flag register and are set automatically after most arithmetic and logic instructions. Conditional jump instructions read them to decide whether to branch.


---

## Slide 27

04 / 05

Number Systems

Decimal, binary, octal, and hexadecimal, and how to convert between them

Week 1 · BMI3121 Microprocessor Systems

Section divider    26


---

## Slide 28

µP

Section 4

Number Systems: Bases and Digit Sets

Week 1 · BMI3121 Microprocessor Systems

27


| Base | Name | Digits used |
| --- | --- | --- |
| 10 | Decimal | 0–9 |
| 2 | Binary | 0–1 |
| 8 | Octal | 0–7 |
| 16 | Hexadecimal | 0–9, A–F  (A=10, B=11, C=12, D=13, E=14, F=15) |

A microprocessor works natively in binary. Programmers use hexadecimal as a compact, human-readable shorthand for binary, because each hex digit maps exactly to four binary digits.


---

## Slide 29

µP

Section 4

Positional Notation

Week 1 · BMI3121 Microprocessor Systems

28

Every digit in a number carries a weight determined by its position and the base (radix) of the number system.
Positions to the left of the radix point carry positive powers of the base.
Positions to the right of the radix point carry negative powers of the base.

Example: a three-digit decimal number

537₁₀ = 5 3 7

5 × 10² = 500
3 × 10¹ = 30
7 × 10⁰ = 7
Sum = 537


---

## Slide 30

µP

Section 4 · Worked example

Binary → Decimal

Week 1 · BMI3121 Microprocessor Systems

29

Convert 1101 0101₂ to decimal.

1

128

1

64

0

32

1

16

0

8

1

4

0

2

1

1

128 + 64 + 16 + 4 + 1  =  213

1101 0101₂ = 213₁₀


---

## Slide 31

µP

Section 4 · Worked example

Hexadecimal → Decimal

Week 1 · BMI3121 Microprocessor Systems

30

Convert 2AF₁₆ to decimal.

2

16² = 256

2 × 256 = 512

A

16¹ = 16

10 × 16 = 160

F

16⁰ = 1

15 × 1 = 15

512 + 160 + 15 = 687      →      2AF₁₆ = 687₁₀


---

## Slide 32

µP

Section 4 · Worked example

Decimal → Binary (Division-Remainder Method)

Week 1 · BMI3121 Microprocessor Systems

31

Convert 89₁₀ to binary. Divide repeatedly by 2 and read the remainders from bottom to top.


| Division | Quotient | Remainder |
| --- | --- | --- |
| 89 ÷ 2 | 44 | 1 |
| 44 ÷ 2 | 22 | 0 |
| 22 ÷ 2 | 11 | 0 |
| 11 ÷ 2 | 5 | 1 |
| 5 ÷ 2 | 2 | 1 |
| 2 ÷ 2 | 1 | 0 |
| 1 ÷ 2 | 0 | 1 |

Read remainders bottom → top:

1 0 1 1 0 0 1

89₁₀ = 1011001₂

Check: 64 + 16 + 8 + 1 = 89


---

## Slide 33

µP

Section 4 · Worked example

Decimal → Hexadecimal

Week 1 · BMI3121 Microprocessor Systems

32

Convert 500₁₀ to hexadecimal. Divide repeatedly by 16 and read the remainders from bottom to top.


| Division | Quotient | Remainder |
| --- | --- | --- |
| 500 ÷ 16 | 31 | 4 |
| 31 ÷ 16 | 1 | 15  (F) |
| 1 ÷ 16 | 0 | 1 |

Read remainders bottom → top:

1  F  4

500₁₀ = 1F4₁₆

Check: 256 + 240 + 4 = 500


---

## Slide 34

µP

Section 4

Converting Decimal Fractions: The Multiply-Radix Algorithm

Week 1 · BMI3121 Microprocessor Systems

33

1

Multiply the decimal fraction by the target radix (base).

2

Save the whole-number part of the result as the next digit, even if it is zero. The first digit produced sits immediately to the right of the radix point.

3

Repeat step 1 and step 2 on the fractional part of the previous result, until that fractional part reaches zero.


---

## Slide 35

µP

Section 4 · Worked example

Converting a Decimal Fraction

Week 1 · BMI3121 Microprocessor Systems

34

0.125₁₀ → binary

0.125 × 2 = 0.25 → digit 0
0.25 × 2 = 0.5 → digit 0
0.5 × 2 = 1.0 → digit 1

0.125₁₀ = 0.001₂

0.125₁₀ → octal

0.125 × 8 = 1.0 → digit 1

0.125₁₀ = 0.1₈

0.046875₁₀ → hex

0.046875 × 16 = 0.75 → digit 0
0.75 × 16 = 12.0 → digit C

0.046875₁₀ = 0.0C₁₆


---

## Slide 36

µP

Section 4

Binary-Coded Hexadecimal (BCH)

Week 1 · BMI3121 Microprocessor Systems

35

BCH represents hexadecimal data in binary code by writing each hex digit as its own 4-bit binary group.

2AC₁₆

= 0010  1010  1100₂

2 → 0010    A → 1010    C → 1100

83D.E₁₆

= 1000 0011 1101 . 1110₂

The radix point carries straight through into the binary form.


---

## Slide 37

05 / 05

Complements and Computer Data Formats

Representing negative numbers, and the formats used to store characters and decimal digits

Week 1 · BMI3121 Microprocessor Systems

Section divider    36


---

## Slide 38

µP

Section 5

Representing Negative Numbers: Complement Systems

Week 1 · BMI3121 Microprocessor Systems

37

Computers often store negative values in complement form, using one of two related systems.
Radix-1 complement (one's complement in binary): invert every digit.
Radix complement (two's complement in binary): take the radix-1 complement, then add 1 to the result.
Radix-1 complement is rarely used on its own. It has a drawback: both a positive and a negative representation of zero exist. Radix (two's) complement avoids this, giving only one representation of zero.

Two-step recipe

Invert every bit (one's complement).
Add 1 to the result (two's complement).

This two-step process is exactly how modern processors negate a binary value in hardware.


---

## Slide 39

µP

Section 5 · Worked example

One's and Two's Complement

Week 1 · BMI3121 Microprocessor Systems

38

Represent −76₁₀ as an 8-bit signed binary value. Start from +76.


| Step | Bit pattern | Meaning |
| --- | --- | --- |
| +76₁₀ | 0100 1100 | Original positive value |
| Invert every bit | 1011 0011 | One's complement |
| Add 1 | 1011 0100 | Two's complement = −76₁₀ |

Check: invert 1011 0100 and add 1 again → 0100 1100 = 76. The double negation returns the original value, confirming the representation.


---

## Slide 40

µP

Section 5 · Summary

Data Formats and Key Takeaways

Week 1 · BMI3121 Microprocessor Systems

39

Data formats, quick reference

ASCII: 7-bit character code; the 8th bit historically held parity or, for printers, selected alphanumeric vs. graphics printing.
Unicode: 16 bits per character; used throughout modern Windows systems for text.
BCD, packed: two decimal digits per byte.
BCD, unpacked: one decimal digit per byte; a BCD digit ranges from 0000 to 1001 (0–9).
Byte data: unsigned range 0–255; signed (two's complement) range −128 to +127.

Key takeaways

A microprocessor is defined by what flows over its buses: address, data, and control.
Address space, whether for memory or I/O, is fixed by the number of address lines: 2ⁿ locations.
Every number format in this course, decimal, binary, octal, hex, BCD, ASCII, ultimately reduces to patterns of bits interpreted by convention.
Two's complement is the standard way processors represent negative integers.

Next week: the microprocessor's internal architecture and register model.

Sources: Brey, B. B. (2008). The Intel Microprocessors (8th ed.). Prentice Hall. Course notes, BMI3121.


---
