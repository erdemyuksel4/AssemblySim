# Week 3 - Addressing Modes

**Source File**: `Week 3 - Addressing Modes.pptx`

**Total Slides**: 40

---

## Slide 1

µP

BMI3121 · MICROPROCESSOR SYSTEMS

Week 3

Addressing Modes

How MOV, JMP/CALL, and PUSH/POP locate the data, code, and stack memory they operate on.

Course content adapted from Brey, The Intel Microprocessors (2008), and supplementary course notes.


---

## Slide 2

µP

Week 3 · Learning outcomes

What You Will Be Able to Do

Week 3 · BMI3121 Microprocessor Systems

1

1

Explain the direction of data flow in a MOV instruction, and identify source and destination operands in any instruction.

2

Identify all seven data-addressing modes from a MOV instruction, and state what each one does.

3

Distinguish direct, relative, and indirect program memory addressing, and calculate the target address for each.

4

Explain how PUSH and POP maintain the stack, and calculate the physical stack address from SS and SP.

5

Trace a short sequence of PUSH/POP instructions to predict the final contents of a set of registers.


---

## Slide 3

µP

Week 3 · Agenda

Five Topics, One Question: Where Is the Data?

Week 3 · BMI3121 Microprocessor Systems

2

01

Data addressing modes: the basics

How MOV reads, and the rule that governs every instruction

02

The seven data-addressing modes

Register through base relative-plus-index

03

Program memory addressing modes

Direct, relative, and indirect, with JMP and CALL

04

Stack memory addressing

PUSH, POP, CALL, RET, and the LIFO discipline

05

Putting it together

Choosing a mode, common pitfalls, and takeaways


---

## Slide 4

01 / 05

Data Addressing Modes: The Basics

How MOV reads, and the one rule that governs every instruction in this course

Week 3 · BMI3121 Microprocessor Systems

Section divider    3


---

## Slide 5

µP

Section 1

Why Addressing Modes Matter

Week 3 · BMI3121 Microprocessor Systems

4

Efficient software development requires complete familiarity with the addressing modes each instruction can use.
This week uses three instructions as teaching examples: MOV for data-addressing modes, CALL and JMP for program memory addressing modes, and PUSH/POP for stack addressing modes.
The modes themselves are not unique to these instructions. Once learned here, they apply across most of the instruction set.


---

## Slide 6

µP

Section 1

MOV: The Direction of Data Flow

Week 3 · BMI3121 Microprocessor Systems

5

MOV   AX,  BX

opcode   destination   source

data flows right → left

The source is written to the right; the destination is written to the left, next to the opcode.
This direction applies to every instruction in the set. It feels backward at first: we naturally read left to right, but data here moves right to left.


---

## Slide 7

µP

Section 1

One Rule to Remember: MOV Copies, It Never Moves

Week 3 · BMI3121 Microprocessor Systems

6

MOV AX, BX transfers the word contents of the source (BX) into the destination (AX).
The source never changes. The destination always changes.
It is crucial to remember: MOV always copies the source data into the destination. It never actually picks up and moves the original data.
The flag register is unaffected by most data-transfer instructions.

Before

AX = 0000H
BX = 2000H

MOV AX, BX

After

AX = 2000H
BX = 2000H  (unchanged)


---

## Slide 8

02 / 05

The Seven Data-Addressing Modes

Every way MOV can locate its source and destination operands

Week 3 · BMI3121 Microprocessor Systems

Section divider    7


---

## Slide 9

µP

Section 2 · Mode 1 of 7

Register Addressing

Week 3 · BMI3121 Microprocessor Systems

8

Transfers a copy of a byte or word from a source register (or memory location) into a destination register (or memory location).

MOV CX, DX

Copies the word-sized contents of register DX into register CX.

Both operands are registers: no memory access is involved, which makes this the fastest data-addressing mode.


---

## Slide 10

µP

Section 2 · Mode 2 of 7

Immediate Addressing

Week 3 · BMI3121 Microprocessor Systems

9

Transfers the source, an immediate byte, word, doubleword, or quadword of data, directly into the destination register or memory location.

MOV AL, 22H

Copies the byte-sized constant 22H into register AL.

The word "immediate" means the value is encoded directly in the instruction: no register or memory lookup is needed to find it.


---

## Slide 11

µP

Section 2 · Mode 3 of 7

Direct Addressing

Week 3 · BMI3121 Microprocessor Systems

10

Moves a byte or word directly between a named memory location and a register.
The instruction set does not support a general memory-to-memory transfer, with one exception: the MOVS string instruction.

MOV CX, LIST

Copies the word-sized contents of memory location LIST into register CX.


---

## Slide 12

µP

Section 2 · Mode 4 of 7

Register Indirect Addressing

Week 3 · BMI3121 Microprocessor Systems

11

Transfers a byte or word between a register and a memory location addressed by an index or base register.
The index and base registers available for this mode are BP, BX, DI, and SI.

MOV AX, [BX]

Copies the word-sized data at the data-segment offset held in BX, into register AX.


---

## Slide 13

µP

Section 2 · Mode 5 of 7

Base-Plus-Index Addressing

Week 3 · BMI3121 Microprocessor Systems

12

Transfers a byte or word between a register and the memory location addressed by a base register (BP or BX) plus an index register (DI or SI).

MOV [BX+DI], CL

Copies the byte-sized contents of CL into the data-segment location addressed by BX plus DI.

Two registers combine to form the effective address: one base, one index.


---

## Slide 14

µP

Section 2 · Mode 6 of 7

Register Relative Addressing

Week 3 · BMI3121 Microprocessor Systems

13

Moves a byte or word between a register and the memory location addressed by an index or base register plus a displacement.

MOV AX, [BX+4]

Loads AX from the data-segment address formed by BX plus the displacement 4.

MOV AX, ARRAY[BX]

Loads AX from the data-segment location at ARRAY, offset by the contents of BX.


---

## Slide 15

µP

Section 2 · Mode 7 of 7

Base Relative-Plus-Index Addressing

Week 3 · BMI3121 Microprocessor Systems

14

Transfers a byte or word between a register and the memory location addressed by a base register and an index register, plus a displacement: three components combined into one address.

MOV AX, ARRAY[BX+DI]

Loads AX from the address formed by adding ARRAY, BX, and DI.

MOV AX, [BX+DI+4]

Loads AX from the address formed by adding BX, DI, and the displacement 4.


---

## Slide 16

µP

Section 2 · Reference

All Seven Data-Addressing Modes

Week 3 · BMI3121 Microprocessor Systems

15


| Mode | Example | Address comes from |
| --- | --- | --- |
| Register | MOV CX, DX | Two registers; no memory access |
| Immediate | MOV AL, 22H | A constant encoded in the instruction |
| Direct | MOV CX, LIST | A named memory location |
| Register indirect | MOV AX, [BX] | One base/index register |
| Base-plus-index | MOV [BX+DI], CL | One base register + one index register |
| Register relative | MOV AX, [BX+4] | One register + a displacement |
| Base relative-plus-index | MOV AX, [BX+DI+4] | Base + index + displacement |


---

## Slide 17

03 / 05

Program Memory Addressing Modes

Direct, relative, and indirect: how JMP and CALL find the next instruction

Week 3 · BMI3121 Microprocessor Systems

Section divider    16


---

## Slide 18

µP

Section 3

Three Forms, One Question: Where to Jump?

Week 3 · BMI3121 Microprocessor Systems

17

Program memory-addressing modes, used with JMP (jump) and CALL, consist of three distinct forms: direct, relative, and indirect.
This section uses JMP to illustrate how each form calculates the address of the next instruction.

Direct

The target address is stored with the opcode.

Relative

The target is a displacement added to IP.

Indirect

The target address is held in a register or memory location.


---

## Slide 19

µP

Section 3

Direct Program Memory Addressing

Week 3 · BMI3121 Microprocessor Systems

18

Direct program memory addressing is what many early microprocessors used for all jumps and calls.
It is also the model behind the GOTO statement in high-level languages.
This microprocessor family supports direct addressing, but uses it less often than relative and indirect addressing.


---

## Slide 20

µP

Section 3 · Worked example

A Direct Far Jump

Week 3 · BMI3121 Microprocessor Systems

19

Direct addressing stores the target address with the opcode. A jump to memory location 10000H stores that address directly following the opcode, in memory.

JMP 1000:0000

Loads CS with 1000H and IP with 0000H, jumping to memory location 10000H for the next instruction.

The full instruction requires the opcode plus 4 bytes: 2 bytes for the new CS, 2 bytes for the new IP.


---

## Slide 21

µP

Section 3

Intersegment vs. Intrasegment Jumps

Week 3 · BMI3121 Microprocessor Systems

20

Intersegment (far)

A jump to any memory location in the entire memory system, in any segment. The direct jump shown on the previous slide is intersegment, which is why it is often called a far jump.

Intrasegment (near)

A jump anywhere within the current code segment only. Relative jumps, covered next, are intrasegment.


---

## Slide 22

µP

Section 3

Relative Program Memory Addressing

Week 3 · BMI3121 Microprocessor Systems

21

Not every early microprocessor supported relative addressing, but this family does.
"Relative" means relative to the instruction pointer (IP): the target address is a displacement that adds to IP.
For example, a JMP that skips the next 2 bytes of memory encodes a displacement of 2, which is added to IP to form the address of the next instruction.


---

## Slide 23

µP

Section 3 · Worked example

Calculating a Relative Jump Target

Week 3 · BMI3121 Microprocessor Systems

22

If IP = 0500H and JMP encodes a displacement of +2:

IP + displacement  =  0500H + 2  =  0502H

The next instruction executes from IP = 0502H, within the same code segment.

Because the target is computed relative to IP rather than stored as an absolute address, the same displacement byte produces a correct jump no matter where in memory the code has been loaded. This is part of what makes relocatable code possible.


---

## Slide 24

µP

Section 3

Short and Near Jumps: Both Intrasegment

Week 3 · BMI3121 Microprocessor Systems

23


| Jump type | Displacement size | Typical use |
| --- | --- | --- |
| Short jump | 1 byte | Small jumps, within about −128 to +127 bytes of IP |
| Near jump / call | 2 bytes | Larger jumps, anywhere within the current code segment |

The JMP opcode itself is always 1 byte. What follows it, either a 1-byte or a 2-byte displacement, is added to the instruction pointer. Both short and near jumps are intrasegment: they stay within the current code segment.


---

## Slide 25

µP

Section 3

Indirect Program Memory Addressing

Week 3 · BMI3121 Microprocessor Systems

24

The microprocessor supports several forms of indirect program memory addressing for JMP and CALL.
Instead of the target address being stored directly, or computed as a displacement from IP, it is held in a register or a memory location.
The instruction reads that register or memory location at run time to decide where to jump. This is what makes computed jumps, such as jump tables and function pointers, possible.

Example form: JMP AX  jumps to the address currently held in register AX, not to a fixed address written into the instruction.


---

## Slide 26

µP

Section 3 · Reference

Program Memory Addressing at a Glance

Week 3 · BMI3121 Microprocessor Systems

25


| Mode | Target address is | Segment reach |
| --- | --- | --- |
| Direct | Stored with the opcode | Intersegment (far) |
| Relative | IP + a displacement | Intrasegment (near or short) |
| Indirect | Held in a register or memory | Depends on the specific form |


---

## Slide 27

04 / 05

Stack Memory Addressing

How PUSH, POP, CALL, and RET use the stack's last-in, first-out discipline

Week 3 · BMI3121 Microprocessor Systems

Section divider    26


---

## Slide 28

µP

Section 4

The Stack: Last-In, First-Out Memory

Week 3 · BMI3121 Microprocessor Systems

27

The stack plays an important role in every microprocessor. It holds data temporarily, and it stores the return addresses used by procedures.
Stack memory is LIFO: last in, first out. The most recently stored item is always the first one retrieved.
Data is placed onto the stack with PUSH, and removed with POP. CALL uses the stack to hold a return address, and RET removes that return address.


---

## Slide 29

µP

Section 4

PUSH and POP: The Basic Operations

Week 3 · BMI3121 Microprocessor Systems

28

PUSH

Stores a word of data onto the stack, and decrements SP so it points to the new top of the stack.

POP

Retrieves a word of data from the stack, and increments SP so it points past the retrieved word.

PUSH and POP always store or retrieve full words, never single bytes, on the 8086 family.


---

## Slide 30

µP

Section 4

How PUSH Works, Byte by Byte

Week 3 · BMI3121 Microprocessor Systems

29

Whenever a word of data is pushed onto the stack, the high-order 8 bits go to the location addressed by SP − 1, and the low-order 8 bits go to the location addressed by SP − 2.
SP is then decremented by 2, so the next PUSH stores into the next available location.

PUSH AX, where AX = 3050H

SP − 1  ←  30H (high byte, AH)

SP − 2  ←  50H (low byte, AL)

SP  ←  SP − 2


---

## Slide 31

µP

Section 4

How POP Works, Byte by Byte

Week 3 · BMI3121 Microprocessor Systems

30

Whenever data is popped from the stack, the low-order 8 bits come from the location addressed by SP, and the high-order 8 bits come from the location addressed by SP + 1.
SP is then incremented by 2.

POP BX

BL  ←  contents at SP (low byte)

BH  ←  contents at SP + 1 (high byte)

SP  ←  SP + 2


---

## Slide 32

µP

Section 4 · Worked example

Finding the Physical Stack Address

Week 3 · BMI3121 Microprocessor Systems

31

The stack is maintained by two registers: SP (stack pointer) and SS (stack segment). SP always points to a location within the stack segment.
In real mode, the physical stack address forms exactly like any other segment:offset address: SS × 10H + SP.

SS = 3000H, SP = 0100H

30000H + 0100H  =  30100H


---

## Slide 33

µP

Section 4

What Can Be Pushed and Popped

Week 3 · BMI3121 Microprocessor Systems

32

Data may be popped from the stack into any general-purpose register, or any segment register, with one exception: CS.
CS cannot be the target of a POP, because CS is only part of the address of the next instruction. Changing CS alone, without also changing IP in a coordinated way, would leave the processor pointing at a meaningless combination.


---

## Slide 34

µP

Section 4

CALL and RET: The Stack Meets Procedures

Week 3 · BMI3121 Microprocessor Systems

33

CALL pushes the address of the instruction following the CALL onto the stack, then jumps to the procedure.
RET pops that saved address back off the stack, into IP (and CS, for a far return), returning control to the instruction right after the original CALL.
This is exactly why CS cannot be popped directly: RET's automatic pop is the one safe, coordinated way the processor restores both CS and IP together.


---

## Slide 35

µP

Section 4 · Worked example

Swapping Two Registers With the Stack

Week 3 · BMI3121 Microprocessor Systems

34

The code

MOV AX, 1000H
MOV BX, 2000H
PUSH AX
PUSH BX
POP AX
POP BX

What happens

AX = 1000H, BX = 2000H
PUSH AX: 1000H onto the stack
PUSH BX: 2000H onto the stack, on top of 1000H
POP AX: the top value, 2000H, comes back off into AX
POP BX: the remaining value, 1000H, comes off into BX


---

## Slide 36

µP

Section 4 · Worked example

Tracing the Stack, Step by Step

Week 3 · BMI3121 Microprocessor Systems

35


| Instruction | Stack (top → bottom) | AX | BX |
| --- | --- | --- | --- |
| (start) | empty | 1000H | 2000H |
| PUSH AX | 1000H | 1000H | 2000H |
| PUSH BX | 2000H, 1000H | 1000H | 2000H |
| POP AX | 1000H | 2000H | 2000H |
| POP BX | empty | 2000H | 1000H |

Result: AX and BX have swapped values, using only the stack, with no third register needed.


---

## Slide 37

05 / 05

Putting It Together

Choosing a mode, avoiding the common mistakes, and what carries into next week

Week 3 · BMI3121 Microprocessor Systems

Section divider    36


---

## Slide 38

µP

Section 5

Choosing an Addressing Mode

Week 3 · BMI3121 Microprocessor Systems

37


| If you need to… | Reach for… |
| --- | --- |
| Copy between two registers, fastest | Register addressing |
| Load a known constant | Immediate addressing |
| Read or write one fixed, named variable | Direct addressing |
| Walk through an array using a pointer | Register indirect, or register relative |
| Index into a 2-D structure or a table of records | Base-plus-index, or base relative-plus-index |


---

## Slide 39

µP

Section 5

Common Pitfalls

Week 3 · BMI3121 Microprocessor Systems

38

Forgetting that source and destination read right to left. A misread MOV silently swaps which operand is supposed to change.
Assuming MOV moves data. It copies. The source is always still there afterward.
Mismatching PUSH and POP counts. Every PUSH needs a matching POP, in reverse order, or the stack pointer drifts and the next RET reads garbage.
Trying to POP directly into CS. It cannot be done: use a far RET, or a far JMP/CALL, to change CS safely.


---

## Slide 40

µP

Section 5 · Summary

Key Takeaways

Week 3 · BMI3121 Microprocessor Systems

39

This week, in brief

Every instruction reads right to left: source on the right, destination on the left.
Seven data-addressing modes cover every way MOV can locate an operand, from plain registers to base relative-plus-index.
JMP and CALL locate their target directly, relative to IP, or indirectly through a register.
The stack is LIFO. PUSH decrements SP and stores; POP retrieves and increments SP.

Key formulas

Relative jump target = IP + displacement
Physical stack address = SS × 10H + SP
PUSH: SP ← SP − 2, then store. POP: retrieve, then SP ← SP + 2.

Next week: data movement instructions, in depth, building on these addressing modes.

Sources: Brey, B. B. (2008). The Intel Microprocessors (8th ed.). Prentice Hall. Course notes, BMI3121.


---
