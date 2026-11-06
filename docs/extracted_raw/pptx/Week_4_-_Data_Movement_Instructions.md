# Week 4 - Data Movement Instructions

**Source File**: `Week 4 - Data Movement Instructions.pptx`

**Total Slides**: 40

---

## Slide 1

µP

BMI3121 · MICROPROCESSOR SYSTEMS

Week 4

Data Movement Instructions

Beyond MOV: exchange, address-loading, stack, I/O, string, and conversion instructions that move data around the system.

Course content adapted from Brey, The Intel Microprocessors (2008), and supplementary course notes.


---

## Slide 2

µP

Week 4 · Learning outcomes

What You Will Be Able to Do

Week 4 · BMI3121 Microprocessor Systems

1

1

Name the illegal MOV combinations, and explain why XCHG and LEA exist as separate instructions.

2

Use LDS, LES, LFS, LGS, and LSS to load a register and a segment register from one far pointer in memory.

3

Explain PUSHA, PUSHF, POPA, and POPF, and state the exact register order each one uses.

4

Use IN and OUT to transfer data to and from I/O ports, with both fixed and variable port numbers.

5

Choose between MOVS, LODS, STOS, MOVSX, MOVZX, and the CBW/CWD family for a given data-movement task.


---

## Slide 3

µP

Week 4 · Agenda

Five Topics, One Family of Instructions

Week 4 · BMI3121 Microprocessor Systems

2

01

Data transfer fundamentals

The full instruction survey, and segment overrides

02

Register and memory transfer

MOV limits, XCHG, LEA, and the LDS family

03

Stack instructions, in depth

PUSH/POP, PUSHA/POPA, PUSHF/POPF

04

I/O, string, and conversion instructions

IN/OUT, MOVS/LODS/STOS, MOVSX/MOVZX, CBW/CWD, LAHF/SAHF, XLAT

05

Putting it to work

Choosing an instruction, pitfalls, and a quick reference


---

## Slide 4

01 / 05

Data Transfer Fundamentals

Surveying the full family of instructions that move data, beyond plain MOV

Week 4 · BMI3121 Microprocessor Systems

Section divider    3


---

## Slide 5

µP

Section 1

One Category, Five Kinds of Instruction

Week 4 · BMI3121 Microprocessor Systems

4

Week 3 covered MOV and the seven data-addressing modes it uses. MOV is only one member of a much larger family of data movement instructions.
Every instruction in this family shares one property: none of them change the flags register based on arithmetic. They move data, not compute new results from it.
This week groups the family into five kinds: register/memory transfer, stack transfer, I/O transfer, string transfer, and size/format conversion.


---

## Slide 6

µP

Section 1 · Reference

The Data Movement Instruction Set at a Glance

Week 4 · BMI3121 Microprocessor Systems

5


| Category | Instructions |
| --- | --- |
| Register / memory transfer | MOV, XCHG, LEA, LDS, LES, LFS, LGS, LSS |
| Stack transfer | PUSH, PUSHA, PUSHF, POP, POPA, POPF |
| I/O transfer | IN, OUT |
| String transfer | MOVS, LODS, STOS (and INS, OUTS for I/O strings) |
| Conversion | MOVSX, MOVZX, CBW, CWD, CWDE, CDQ, LAHF, SAHF, XLAT |


---

## Slide 7

µP

Section 1

Segment Override: Overriding the Default

Week 4 · BMI3121 Microprocessor Systems

6

Week 2 introduced the default segment:offset pairs: DS with BX/DI/SI, SS with SP/BP, ES with DI for string destinations.
A segment override prefix lets an instruction use a different segment register than its default, for one instruction only.

MOV AX, ES:[BX]

Normally [BX] defaults to the DS segment. The ES: prefix overrides that default for this one instruction, reading from the ES segment instead.


---

## Slide 8

02 / 05

Register and Memory Transfer Instructions

What MOV cannot do, and the instructions that fill the gap

Week 4 · BMI3121 Microprocessor Systems

Section divider    7


---

## Slide 9

µP

Section 2

MOV Recap: Powerful, But Not Universal

Week 4 · BMI3121 Microprocessor Systems

8

MOV can move data between two registers, between a register and memory, or an immediate value into a register or memory location.
MOV cannot move data directly between two memory locations, and it cannot load a segment register directly from an immediate value.
The next slide lists the specific combinations MOV refuses, and what to use instead.


---

## Slide 10

µP

Section 2 · Reference

Illegal MOV Combinations, and the Fix

Week 4 · BMI3121 Microprocessor Systems

9


| Not allowed | Use instead |
| --- | --- |
| MOV [mem1], [mem2]  (memory to memory) | Load into a register first, then store: two MOVs; or MOVS for a whole string |
| MOV DS, 1234H  (immediate to segment register) | MOV AX, 1234H, then MOV DS, AX |
| MOV CS, AX  (any transfer into CS) | Change CS only via a far JMP, CALL, or RET |
| MOV AL, BX  (mismatched operand sizes) | Match sizes: MOV AL, BL, or MOV AX, BX |


---

## Slide 11

µP

Section 2

XCHG: Exchange Instruction

Week 4 · BMI3121 Microprocessor Systems

10

XCHG swaps the contents of its two operands in a single instruction.
At least one operand must be a register; XCHG cannot exchange two memory locations directly.

XCHG AX, BX

AX and BX trade values in place. No third register or memory location is needed.


---

## Slide 12

µP

Section 2 · Worked example

XCHG vs. the Three-MOV Swap

Week 4 · BMI3121 Microprocessor Systems

11

Without XCHG

MOV CX, AX
MOV AX, BX
MOV BX, CX

3 instructions, and CX must be free to use as scratch space.

With XCHG

XCHG AX, BX

1 instruction, no scratch register required, and the intent (swap these two) is immediately clear to a reader.


---

## Slide 13

µP

Section 2

LEA: Load Effective Address

Week 4 · BMI3121 Microprocessor Systems

12

LEA (Load Effective Address) computes the offset address an instruction would use, and loads that offset into a register, without touching the data stored at that address.
It is the address-calculation logic of an addressing mode, exposed as its own instruction.

LEA BX, TABLE

Loads the offset address of TABLE into BX. BX now holds a pointer, not the data stored at TABLE.


---

## Slide 14

µP

Section 2 · Worked example

LEA BX, TABLE and MOV BX, OFFSET TABLE Are Equivalent

Week 4 · BMI3121 Microprocessor Systems

13

LEA BX, TABLE

MOV BX, OFFSET TABLE

For a simple, fixed label like TABLE, these two instructions produce the same result: BX holds TABLE's offset.

LEA earns its keep once the address is not a simple fixed label: LEA AX, [BX+DI+4] computes that whole expression at run time, something OFFSET alone (a compile-time constant) cannot do.
This makes LEA useful for computing a pointer into an array or structure from a base and an index, in one instruction.


---

## Slide 15

µP

Section 2

LDS, LES, LFS, LGS, LSS: Loading a Far Pointer

Week 4 · BMI3121 Microprocessor Systems

14

A far pointer stored in memory occupies 4 bytes: an offset word, followed by a segment word.
LDS, LES, LFS, LGS, and LSS each load a general-purpose register from the offset word, and the named segment register from the segment word, in a single instruction.
The instruction name tells you which segment register it loads: LDS loads DS, LES loads ES, and so on.


---

## Slide 16

µP

Section 2 · Worked example

LDS in Action

Week 4 · BMI3121 Microprocessor Systems

15

Suppose memory location PTR holds a far pointer: offset 0200H at PTR, segment 3000H at PTR+2.

LDS SI, PTR

SI  ←  0200H   (from PTR, the offset word)

DS  ←  3000H   (from PTR+2, the segment word)

One instruction now does the work of two separate MOVs, and it does so atomically.


---

## Slide 17

03 / 05

Stack Instructions, In Depth

Beyond single-register PUSH and POP: whole-register-set and flag transfers

Week 4 · BMI3121 Microprocessor Systems

Section divider    16


---

## Slide 18

µP

Section 3

PUSH Revisited: All Operand Forms

Week 4 · BMI3121 Microprocessor Systems

17

Week 3 introduced PUSH with a general-purpose register. PUSH also accepts a segment register, a memory operand, or (on later processors) an immediate value.
Every form follows the same rule from Week 3: SP is decremented by 2, and a full word is stored, never a single byte.


| Form | Example |
| --- | --- |
| Register | PUSH AX |
| Segment register | PUSH DS |
| Memory | PUSH WORD PTR [BX] |
| Immediate (80186 and later) | PUSH 1234H |


---

## Slide 19

µP

Section 3

PUSHA: Push All General-Purpose Registers

Week 4 · BMI3121 Microprocessor Systems

18

PUSHA pushes all eight general-purpose registers onto the stack in one instruction, saving the trouble of eight separate PUSH instructions.
It always uses the value SP had before PUSHA began, even though SP changes with every register it pushes.

PUSHA pushes, in order:

AX → CX → DX → BX → SP(original) → BP → SI → DI

The SP value saved is a snapshot from before the first push, not SP's value partway through.


---

## Slide 20

µP

Section 3

PUSHF: Push the Flags Register

Week 4 · BMI3121 Microprocessor Systems

19

PUSHF pushes the entire flags register onto the stack as one word, exactly like pushing any other register.
It is the standard way to save the processor's flag state before a sequence of code that will disturb the flags, so the original state can be restored afterward.
A common pattern: PUSHF, do some work, then POPF to restore the flags exactly as they were.


---

## Slide 21

µP

Section 3

POP, POPA, and POPF: The Mirror Operations

Week 4 · BMI3121 Microprocessor Systems

20


| Instruction | What it restores |
| --- | --- |
| POP reg | One register, from the current top of the stack; SP += 2 |
| POPA | DI, SI, BP, (SP slot skipped), BX, DX, CX, AX, in that order; SP += 16 total |
| POPF | The flags register, from the current top of the stack; SP += 2 |

POPA reads the same eight stack slots PUSHA wrote, but in exactly reverse order, and it discards the saved SP value rather than loading it back into SP.


---

## Slide 22

µP

Section 3 · Worked example

Why the Order of PUSHA and POPA Matches

Week 4 · BMI3121 Microprocessor Systems

21

PUSHA writes (top last)

AX
CX
DX
BX
SP (original)
BP
SI
DI  ← top of stack

POPA reads (top first)

DI  ← top of stack
SI
BP
(SP slot skipped)
BX
DX
CX
AX


---

## Slide 23

04 / 05

I/O, String, and Conversion Instructions

Talking to hardware ports, moving whole blocks of memory, and resizing data

Week 4 · BMI3121 Microprocessor Systems

Section divider    22


---

## Slide 24

µP

Section 4

IN and OUT: Talking to I/O Ports

Week 4 · BMI3121 Microprocessor Systems

23

IN transfers data from an I/O port into AL (a byte) or AX (a word). OUT transfers data from AL or AX out to an I/O port.
Recall from Week 1: the I/O address space is separate from memory, and runs from port 0000H to port FFFFH.


| Instruction | Direction |
| --- | --- |
| IN AL, port | port → AL |
| OUT port, AL | AL → port |


---

## Slide 25

µP

Section 4 · Worked example

Fixed Port vs. Variable Port Numbers

Week 4 · BMI3121 Microprocessor Systems

24

Fixed port

IN AL, 60H

The port number, 60H, is encoded directly in the instruction. Fixed-port IN/OUT can only address ports 00H–FFH.

Variable port

MOV DX, 03F8H
IN AL, DX

The port number is loaded into DX first. This form reaches the full 16-bit port range, 0000H–FFFFH.


---

## Slide 26

µP

Section 4

String Data Transfer: MOVS, LODS, STOS

Week 4 · BMI3121 Microprocessor Systems

25


| Instruction | Effect |
| --- | --- |
| MOVS | Copies [SI] to [ES:DI]; the only memory-to-memory move in the instruction set |
| LODS | Loads AL or AX from [SI], into the accumulator |
| STOS | Stores AL or AX into [ES:DI] |

Every string instruction automatically advances SI and/or DI afterward, by 1 for a byte operation or 2 for a word operation. "Advances" means increments or decrements, and which one depends on the direction flag, D, covered next.


---

## Slide 27

µP

Section 4

The Direction Flag and String Instructions

Week 4 · BMI3121 Microprocessor Systems

26

Recall the D (direction) flag from Week 2. It selects how SI and DI change after each string operation.
CLD clears D to 0: SI and DI automatically increment, stepping forward through memory.
STD sets D to 1: SI and DI automatically decrement, stepping backward through memory.

Most code processes strings forward, so CLD near the start of a routine is a common habit, even when D is already 0.


---

## Slide 28

µP

Section 4

REP: Repeating a String Instruction

Week 4 · BMI3121 Microprocessor Systems

27

A single string instruction moves only one byte or word. REP, placed before a string instruction, repeats it automatically.
REP uses CX as a loop counter: it repeats the instruction, decrementing CX each time, and stops when CX reaches 0.

REP MOVSB

Copies CX bytes from [SI] to [ES:DI], advancing SI and DI after each byte, until CX reaches 0.


---

## Slide 29

µP

Section 4 · Worked example

Copying a 10-Byte Block With REP MOVSB

Week 4 · BMI3121 Microprocessor Systems

28

CLD               ; step forward
LEA SI, SOURCE    ; SI = source offset
LEA DI, DEST      ; DI = destination offset
MOV CX, 10        ; 10 bytes to copy
REP MOVSB         ; copy CX bytes

After execution: SOURCE's 10 bytes have been copied to DEST, SI and DI have each advanced by 10, and CX is 0.


---

## Slide 30

µP

Section 4

MOVSX and MOVZX: Moving Between Sizes

Week 4 · BMI3121 Microprocessor Systems

29

Both instructions move a smaller value into a larger register, and both must decide what to put in the extra, wider bits.

MOVSX

Sign-extends: copies the source's sign bit into every new upper bit. A negative byte stays negative at the wider size.

MOVSX EAX, BL

MOVZX

Zero-extends: fills every new upper bit with 0, regardless of the source's sign bit. Used for unsigned values.

MOVZX EAX, BL


---

## Slide 31

µP

Section 4

CBW, CWD, CWDE, CDQ: Widening the Accumulator

Week 4 · BMI3121 Microprocessor Systems

30

These instructions sign-extend the accumulator into a specific, fixed wider destination, with no operand to specify: the source and destination are always implied.


| Instruction | Sign-extends |
| --- | --- |
| CBW | AL into AX (the sign bit of AL fills AH) |
| CWD | AX into DX:AX (the sign bit of AX fills all of DX) |
| CWDE | AX into EAX (32-bit form of CBW/CWD) |
| CDQ | EAX into EDX:EAX (32-bit form of CWD) |

These exist mainly to prepare the accumulator for signed division, which expects a full-width dividend.


---

## Slide 32

µP

Section 4

LAHF and SAHF: Flags Meet AL... AH

Week 4 · BMI3121 Microprocessor Systems

31

LAHF

Load AH from Flags: copies the low byte of the flags register (SF, ZF, AF, PF, CF) into AH.

SAHF

Store AH into Flags: copies AH back into the low byte of the flags register, the reverse of LAHF.


---

## Slide 33

µP

Section 4

XLAT: Table Lookup Translation

Week 4 · BMI3121 Microprocessor Systems

32

XLAT translates the byte in AL, using a 256-byte lookup table in memory.
BX holds the table's starting offset. XLAT replaces AL with the byte found at [BX + AL].

AL  ←  [BX + AL]

AL is used twice: first as an index into the table, then overwritten with the table's value at that index.


---

## Slide 34

µP

Section 4 · Worked example

XLAT for an Uppercase Lookup Table

Week 4 · BMI3121 Microprocessor Systems

33

LEA BX, UPPER_TABLE   ; BX = table base
MOV AL, 5             ; AL = index 5
XLAT                  ; AL = [BX + 5]

If UPPER_TABLE holds the byte values for 'A' through 'Z', index 5 retrieves 'F'. AL now holds 'F' instead of 5.

This pattern, a small index converted into a meaningful value through a table, is the same idea behind the BCD-to-ASCII and lookup techniques used throughout assembly programming.


---

## Slide 35

05 / 05

Putting Data Movement Instructions to Work

Choosing the right tool, avoiding the common mistakes, and a full quick reference

Week 4 · BMI3121 Microprocessor Systems

Section divider    34


---

## Slide 36

µP

Section 5

Choosing the Right Data Movement Instruction

Week 4 · BMI3121 Microprocessor Systems

35


| If you need to… | Reach for… |
| --- | --- |
| Swap two values | XCHG |
| Get a pointer to a computed address | LEA |
| Load a register and its segment together | LDS / LES / LFS / LGS / LSS |
| Save or restore every register at once | PUSHA / POPA |
| Copy a whole block of memory | REP MOVSB / MOVSW |
| Widen a value for arithmetic | MOVSX, MOVZX, or the CBW/CWD family |
| Convert an index into a value | XLAT |


---

## Slide 37

µP

Section 5

Common Pitfalls

Week 4 · BMI3121 Microprocessor Systems

36

Forgetting to CLD before a string operation. If D was left set from earlier code, SI/DI move the wrong direction.
Confusing LEA with MOV [address]. LEA loads an address; a plain MOV with brackets loads the data stored at that address.
Using MOVSX or MOVZX on the wrong signedness. Sign-extending an unsigned byte, or zero-extending a negative one, silently produces the wrong value.
Assuming REP MOVSB checks anything about the data. It only counts down CX; it will happily overwrite memory past a buffer's end if CX is wrong.


---

## Slide 38

µP

Section 5 · Reference

Data Movement Instructions: Quick Reference

Week 4 · BMI3121 Microprocessor Systems

37


| Instruction | Moves |
| --- | --- |
| MOV, XCHG | Register/memory contents |
| LEA, LDS/LES/LFS/LGS/LSS | An address (offset, or offset + segment) |
| PUSH/POP, PUSHA/POPA, PUSHF/POPF | Registers or flags, to and from the stack |
| IN/OUT | A byte or word, to and from an I/O port |
| MOVS/LODS/STOS, with REP | A byte or word, or a whole block, in memory |
| MOVSX/MOVZX, CBW/CWD/CWDE/CDQ | A value, resized wider |
| LAHF/SAHF, XLAT | Flags into AH; or a table lookup value into AL |


---

## Slide 39

µP

Section 5 · Practice

Predict the Result

Week 4 · BMI3121 Microprocessor Systems

38

MOV AX, 5
MOV BX, 9
XCHG AX, BX
PUSH AX
POP CX

Pause here and predict the final values of AX, BX, and CX before continuing.

Answer: AX = 9, BX = 5, CX = 9.  XCHG swaps AX and BX first; the PUSH/POP pair then just copies AX's new value (9) into CX.


---

## Slide 40

µP

Section 5 · Summary

Key Takeaways

Week 4 · BMI3121 Microprocessor Systems

39

This week, in brief

MOV cannot do memory-to-memory transfers or load a segment register from an immediate; other instructions fill those gaps.
XCHG swaps in place; LEA and the LDS family load addresses, not data.
PUSHA/POPA and PUSHF/POPF extend the Week 3 stack model to whole register sets and the flags.
String instructions, with REP, move whole blocks; conversion instructions resize values safely.

Remember

REP repeats a string instruction CX times, then stops.
MOVSX preserves sign; MOVZX always fills with zero.
CLD before a forward string operation is cheap insurance.

Next week: arithmetic and logic instructions, operating on the data these instructions move.

Sources: Brey, B. B. (2008). The Intel Microprocessors (8th ed.). Prentice Hall. Course notes, BMI3121.


---
