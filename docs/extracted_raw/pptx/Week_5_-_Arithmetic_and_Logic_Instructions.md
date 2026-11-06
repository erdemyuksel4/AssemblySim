# Week 5 - Arithmetic and Logic Instructions

**Source File**: `Week 5 - Arithmetic and Logic Instructions.pptx`

**Total Slides**: 40

---

## Slide 1

µP

BMI3121 · MICROPROCESSOR SYSTEMS

Week 5

Arithmetic and Logic Instructions

ADD through ROL: how the microprocessor computes, compares, and manipulates bits.

Course content adapted from Brey, The Intel Microprocessors (2008), and supplementary course notes.


---

## Slide 2

µP

Week 5 · Learning outcomes

What You Will Be Able to Do

Week 5 · BMI3121 Microprocessor Systems

1

1

Use ADD, ADC, and INC to perform 8-, 16-, and wider-bit addition, and predict how each affects the flags.

2

Use SUB, SBB, DEC, and CMP to perform subtraction and comparison, and read the resulting flags correctly.

3

Use MUL, IMUL, DIV, and IDIV correctly, and recognize the conditions that cause a divide error.

4

Use AND, OR, XOR, TEST, NOT, and NEG to mask, set, test, and invert bits.

5

Use SHL, SHR, and the rotate instructions to shift data, including chaining them across multi-word values.


---

## Slide 3

µP

Week 5 · Agenda

Five Topics: Compute, Compare, and Manipulate

Week 5 · BMI3121 Microprocessor Systems

2

01

Addition instructions

ADD, INC, ADC, and their flags

02

Subtraction instructions

SUB, DEC, SBB, and CMP

03

Multiplication and division

MUL, IMUL, DIV, IDIV, and divide errors

04

Logic operations

AND, OR, XOR, TEST, NOT, NEG

05

Shift and rotate

SHL, SHR, ROL, ROR, RCL, RCR


---

## Slide 4

01 / 05

Addition Instructions

ADD, INC, and ADC: building up from a single byte to wide multi-word sums

Week 5 · BMI3121 Microprocessor Systems

Section divider    3


---

## Slide 5

µP

Section 1

ADD: The Basic Addition Instruction

Week 5 · BMI3121 Microprocessor Systems

4

ADD performs 8-, 16-, or 32-bit binary addition, between two registers, a register and memory, or a register and an immediate value.
Whenever an arithmetic or logic instruction executes, the flag register changes: the rightmost 8 flag bits and overflow update; interrupt, trap, and the other control flags do not.


| Form | Example |
| --- | --- |
| Register to register | ADD AL, BL |
| Immediate to register | ADD CL, 44H |
| Register to memory | ADD [BX], AL |


---

## Slide 6

µP

Section 1 · Worked example

Immediate Addition and Its Flags

Week 5 · BMI3121 Microprocessor Systems

5

MOV DL, 12H
ADD DL, 33H

12H + 33H = 45H


| Z | C | A | S | P | O |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 0 | 0 | 0 |

Z=0: the result, 45H, is not zero. C=0: no carry out of bit 7. A=0: no half-carry between bits 3 and 4.
S=0: the result is positive. P=0: 45H = 01000101b has three 1-bits, an odd count, so parity is odd. O=0: no signed overflow.


---

## Slide 7

µP

Section 1 · Worked example

Summing Two Bytes in Memory

Week 5 · BMI3121 Microprocessor Systems

6

MOV DI, OFFSET NUMB   ; DI addresses NUMB
MOV AL, 0             ; clear the running sum
ADD AL, [DI]          ; add NUMB
ADD AL, [DI+1]        ; add NUMB+1

This adds two consecutive bytes, stored at data-segment offsets NUMB and NUMB+1, into a running sum in AL. The same pattern extends to summing an entire array, one byte at a time.


---

## Slide 8

µP

Section 1

INC: Increment by One

Week 5 · BMI3121 Microprocessor Systems

7

INC adds 1 to a register or a memory location. Unlike ADD, INC does not affect the carry flag.


| Form | Example |
| --- | --- |
| Register | INC BL |
| Memory, byte-sized | INC BYTE PTR [BX] |
| Memory, named location | INC DATA1 |

Extending the running-sum example from before, INC DI lets the loop step to the next byte without recomputing the address from scratch:

ADD AL, [DI]   →   INC DI   →   ADD AL, [DI]


---

## Slide 9

µP

Section 1

ADC: Addition With Carry

Week 5 · BMI3121 Microprocessor Systems

8

ADC adds the carry flag bit into the sum, on top of the two operands: destination = destination + source + carry.
This is the standard technique for adding numbers wider than the processor's native register width.

ADC AL, AH     ; AL = AL + AH + carry

ADC CX, BX     ; CX = CX + BX + carry


---

## Slide 10

µP

Section 1 · Worked example

32-Bit Addition From Two 16-Bit Additions

Week 5 · BMI3121 Microprocessor Systems

9

ADD AX, CX     ; low 16 bits, sets carry if it overflows
ADC BX, DX     ; high 16 bits, folds in that carry

Together, BX:AX holds a 32-bit sum of the two 32-bit values DX:CX and BX:AX started with.
The pattern generalizes: one ADD for the lowest word, then one ADC per additional, more-significant word, chains the carry all the way up.


---

## Slide 11

02 / 05

Subtraction Instructions

SUB, DEC, SBB, and CMP: the mirror image of addition

Week 5 · BMI3121 Microprocessor Systems

Section divider    10


---

## Slide 12

µP

Section 2

SUB: The Basic Subtraction Instruction

Week 5 · BMI3121 Microprocessor Systems

11

SUB performs 8-, 16-, or 32-bit subtraction, in the same set of forms as ADD.


| Form | Example |
| --- | --- |
| Register to register | SUB CL, BL |
| Register from memory | SUB [DI], CH |
| Immediate from register | SUB DH, 6FH |


---

## Slide 13

µP

Section 2 · Worked example

Immediate Subtraction and Its Flags

Week 5 · BMI3121 Microprocessor Systems

12

MOV CH, 22H
SUB CH, 44H

22H − 44H = DEH


| Z | C | A | S | P | O |
| --- | --- | --- | --- | --- | --- |
| 0 | 1 | 1 | 1 | 1 | 0 |

C=1: a borrow was needed, since 22H is smaller than 44H. A=1: the low nibble (2H) is also smaller than the subtrahend's low nibble (4H), so a half-borrow occurred.
S=1: DEH's top bit is set, so the result reads as negative. P=1: DEH = 11011110b has six 1-bits, an even count, so parity is even. O=0: within signed 8-bit range.


---

## Slide 14

µP

Section 2

DEC: Decrement by One

Week 5 · BMI3121 Microprocessor Systems

13

DEC subtracts 1 from a register or a memory location, the mirror image of INC.
Like INC, DEC does not affect the carry flag.

DEC BH     ; BH = BH − 1


---

## Slide 15

µP

Section 2

SBB: Subtraction With Borrow

Week 5 · BMI3121 Microprocessor Systems

14

SBB works like SUB, except the carry flag, which holds a pending borrow, is also subtracted from the difference.
This mirrors ADC: it is the standard technique for subtracting numbers wider than the processor's native register width.

SBB AH, AL     ; AH = AH − AL − carry

SUB AX, DI
SBB BX, SI     ; together, a 32-bit subtraction


---

## Slide 16

µP

Section 2

CMP: Compare Without Changing the Destination

Week 5 · BMI3121 Microprocessor Systems

15

CMP performs a subtraction that changes only the flag bits; the destination operand itself is never modified.
It is normally followed by a conditional jump that tests the resulting flags: JA, JB, JAE, JBE, and the others introduced in Week 4's discussion of flags.

CMP CL, BL     ; computes CL − BL, discards the result, keeps the flags


---

## Slide 17

µP

Section 2 · Worked example

CMP Followed by a Conditional Jump

Week 5 · BMI3121 Microprocessor Systems

16

CMP AL, 10H     ; compare AL against 10H
JAE FUNC        ; if AL >= 10H, jump to FUNC

AL itself never changes. CMP only sets the flags as if AL − 10H had been computed.
JAE (jump above or equal) reads those flags, and branches to FUNC only when the comparison holds.


---

## Slide 18

03 / 05

Multiplication and Division

MUL, IMUL, DIV, and IDIV: the instructions that most often surprise a new programmer

Week 5 · BMI3121 Microprocessor Systems

Section divider    17


---

## Slide 19

µP

Section 3

MUL vs. IMUL: Unsigned and Signed

Week 5 · BMI3121 Microprocessor Systems

18

Multiplication works on bytes, words, or doublewords, and comes in two forms: MUL for unsigned integers, IMUL for signed integers.
Multiplication changes the flags, but only C and O are meaningful; the rest are unpredictable and should not be relied on.
If the upper half of the result is all zero bits, both C and O are 0, showing the result actually needed only the lower half's width. If the upper half holds significant bits, C and O are both 1.


---

## Slide 20

µP

Section 3

8-Bit Multiplication

Week 5 · BMI3121 Microprocessor Systems

19

MUL CL      ; AL × CL, unsigned product in AX
IMUL DH     ; AL × DH, signed product in AX

Both forms use AL as the implied first operand, and always deliver the full-width product in AX.


---

## Slide 21

µP

Section 3 · Worked example

8-Bit Multiplication, Traced

Week 5 · BMI3121 Microprocessor Systems

20

MOV BL, 5      ; load the multiplier
MOV CL, 10
MOV AL, CL     ; AL = 10 (the multiplicand)
MUL BL         ; AX = AL × BL = 10 × 5 = 50
MOV DX, AX     ; DX = 0032H

After MUL BL: AX = 0032H (50 decimal). The 8-bit product of two values under 16 fits comfortably in AL alone here, so AH is 00H.


---

## Slide 22

µP

Section 3

16-Bit Multiplication

Week 5 · BMI3121 Microprocessor Systems

21

16-bit multiplication works the same way, one size class up: AX holds the multiplicand instead of AL, and the 32-bit product lands in DX-AX.
DX holds the most significant 16 bits of the product; AX holds the least significant 16 bits.


| Instruction | Effect |
| --- | --- |
| MUL CX | AX × CX, unsigned product in DX-AX |
| IMUL DI | AX × DI, signed product in DX-AX |
| MUL WORD PTR [SI] | AX × the word at [SI], unsigned product in DX-AX |


---

## Slide 23

µP

Section 3

Division: Where Errors Creep In

Week 5 · BMI3121 Microprocessor Systems

22

Division works on 8-bit or 16-bit divisors. None of the flag bits change predictably after a division; do not rely on them.
Two error conditions are unique to division: divide by zero, and divide overflow, where the quotient is too wide to fit in its destination.
8-bit division divides a 16-bit number by an 8-bit number. 16-bit division divides a 32-bit number by a 16-bit number.


---

## Slide 24

µP

Section 3 · Worked example

How a Divide Overflow Happens

Week 5 · BMI3121 Microprocessor Systems

23

AX = 3000, dividing by 2 (8-bit division)

Quotient = 3000 ÷ 2 = 1500

But an 8-bit division's quotient must fit in AL, which holds at most 255.

1500 does not fit in AL: this is a divide overflow.

On most systems, a divide error triggers an interrupt, which typically displays an error message and halts the offending program.


---

## Slide 25

µP

Section 3

8-Bit Division

Week 5 · BMI3121 Microprocessor Systems

24

8-bit division uses AX as the dividend, divided by any 8-bit register or memory location. The quotient lands in AL; the remainder lands in AH.
The dividend must first be widened to fill AX. CBW (Week 4) sign-extends AL into AX for signed values. For unsigned values, simply zero AH.

MOV AL, NUMB     ; get the dividend byte
MOV AH, 0        ; zero-extend to a 16-bit dividend
DIV NUMB1        ; divide by NUMB1
MOV ANSQ, AL     ; save the quotient
MOV ANSR, AH     ; save the remainder


---

## Slide 26

µP

Section 3 · Worked example

Signed Division With IDIV

Week 5 · BMI3121 Microprocessor Systems

25

AX = 0010H (+16), BL = 0FDH (−3)

IDIV BL

+16 ÷ (−3) = quotient −5, remainder 1

AL = FBH (−5)     AH = 01H (1)     AX = 01FBH

As with unsigned division, the quotient lands in AL and the remainder in AH; here both happen to carry a sign.


---

## Slide 27

µP

Section 3

16-Bit Division and CWD

Week 5 · BMI3121 Microprocessor Systems

26

16-bit division mirrors 8-bit division one size class up: the 32-bit dividend is DX-AX, the quotient lands in AX, and the remainder lands in DX.
CWD (Week 4) sign-extends AX into DX-AX for a signed 16-bit dividend. For unsigned values, zero DX instead.

MOV AX, -100    ; load the dividend
MOV CX, 9       ; load the divisor
CWD             ; sign-extend AX into DX-AX
IDIV CX         ; DX-AX ÷ CX


---

## Slide 28

04 / 05

Logic Operations

AND, OR, XOR, TEST, NOT, and NEG: bit-level tools for masking, setting, and testing

Week 5 · BMI3121 Microprocessor Systems

Section divider    27


---

## Slide 29

µP

Section 4

AND: Masking Bits

Week 5 · BMI3121 Microprocessor Systems

28

AND performs logical multiplication, bit by bit. A result bit is 1 only when both input bits are 1.
AND is most often used to clear (mask off) selected bits of a value, a technique called masking.

AND AL, BL     ; AL = AL AND BL
AND CX, DX     ; CX = CX AND DX


---

## Slide 30

µP

Section 4 · Worked example

Converting ASCII Digits to BCD With AND

Week 5 · BMI3121 Microprocessor Systems

29

ASCII digits '0' through '9' occupy the range 30H–39H. Masking off the upper nibble of each byte, using AND, converts ASCII directly to BCD (Week 1).

MOV BX, 3135H     ; load two ASCII digits: '1' '5'
AND BX, 0F0FH     ; mask both upper nibbles at once

3135H AND 0F0FH = 0105H

BX now holds 0105H: the packed BCD digits 1 and 5, both converted in a single instruction.


---

## Slide 31

µP

Section 4

OR: Setting Bits

Week 5 · BMI3121 Microprocessor Systems

30

OR performs logical addition, bit by bit. A result bit is 1 whenever either input bit is 1.
OR is most often used to set selected bits of a value to 1, without disturbing the other bits.

OR AL, BL     ; AL = AL OR BL
OR DX, [BX]   ; DX = DX OR the word at [BX]


---

## Slide 32

µP

Section 4

XOR: Inverting Selected Bits

Week 5 · BMI3121 Microprocessor Systems

31

XOR performs exclusive-OR, bit by bit. A result bit is 1 when the two input bits differ.
This makes XOR a selective bit inverter: XORing a bit with 1 flips it; XORing a bit with 0 leaves it unchanged.

XOR CH, DL     ; CH = CH XOR DL


---

## Slide 33

µP

Section 4 · Worked example

OR, AND, and XOR Working Together

Week 5 · BMI3121 Microprocessor Systems

32

Three instructions, three different bit-level goals:

OR CX, 0600H

Sets bits 9 and 10

AND CX, 0FFFCH

Clears bits 0 and 1

XOR CX, 1000H

Inverts bit 12


---

## Slide 34

µP

Section 4

TEST: Checking Bits Without Changing Data

Week 5 · BMI3121 Microprocessor Systems

33

TEST performs an AND operation, but like CMP, it never changes the destination. Only the flags update.
TEST is to a single bit what CMP is to a whole byte, word, or doubleword: the zero flag becomes 1 exactly when the tested bit is 0, and 0 when the bit is set.
TEST is normally followed by JZ (jump if zero) or JNZ (jump if not zero).

TEST AL, 1       ; test the rightmost bit
JNZ RIGHT        ; jump if it is set

TEST AL, 128     ; test the leftmost bit
JNZ LEFT         ; jump if it is set


---

## Slide 35

µP

Section 4

NOT and NEG: Two Different Kinds of Inversion

Week 5 · BMI3121 Microprocessor Systems

34

NOT

Logical inversion: one's complement. Every bit flips.

NOT CH     ; CH is one's complemented

NEG

Arithmetic sign inversion: two's complement. The value's sign flips.

NEG AX     ; AX is two's complemented


---

## Slide 36

05 / 05

Shift and Rotate

Moving bits left or right, within a register or across several

Week 5 · BMI3121 Microprocessor Systems

Section divider    35


---

## Slide 37

µP

Section 5

Shift: SHL and SHR

Week 5 · BMI3121 Microprocessor Systems

36

A shift moves every bit in a register or memory location left or right by a specified count.
A left shift multiplies by 2 for each position shifted. A right shift divides by 2 for each position shifted.
Logical shifts treat the data as unsigned. Arithmetic shifts treat the data as signed, preserving the sign bit on a right shift.

SHL AX, 1      ; AX shifted left 1 place
SHR BX, 12     ; BX shifted right 12 places


---

## Slide 38

µP

Section 5

Rotate: ROL, ROR, RCL, RCR

Week 5 · BMI3121 Microprocessor Systems

37

A rotate moves bits from one end of a register or memory location back around to the other end, so no bits are lost, unlike a shift.
ROL and ROR rotate directly, end to end. RCL and RCR rotate through the carry flag, treating carry as an extra bit in the rotation.

ROL SI, 14     ; SI rotates left 14 places
RCL BL, 6      ; BL rotates left through carry, 6 places


---

## Slide 39

µP

Section 5 · Worked example

Shifting a 48-Bit Number Left, One Place

Week 5 · BMI3121 Microprocessor Systems

38

A 48-bit value spread across DX, BX, and AX shifts left as one unit by chaining SHL with two RCLs, carrying each register's overflow bit into the next.

SHL AX, 1     ; AX's top bit moves into carry
RCL BX, 1     ; carry moves into BX's bottom bit; BX's top bit moves into carry
RCL DX, 1     ; carry moves into DX's bottom bit

Before:  DX:BX:AX = 0001 : 8000 : 0001

After:   DX:BX:AX = 0003 : 0000 : 0002

Check: the 48-bit value doubled, exactly as a single left shift should.


---

## Slide 40

µP

Section 5 · Summary

Key Takeaways

Week 5 · BMI3121 Microprocessor Systems

39

This week, in brief

ADC and SBB extend addition and subtraction beyond the native register width, by chaining the carry flag.
CMP and TEST change flags without changing data, setting up conditional jumps.
MUL/IMUL and DIV/IDIV widen or split across register pairs; watch for divide overflow.
AND masks, OR sets, XOR inverts. Shifts multiply and divide by powers of two; rotates chain across registers.

Remember

8-bit MUL/DIV use AX; 16-bit MUL/DIV use DX-AX.
Only C and O are meaningful after a multiplication.
No flag is reliable after a division.

Next week: program control instructions, using the flags this week's instructions set.

Sources: Brey, B. B. (2008). The Intel Microprocessors (8th ed.). Prentice Hall. Course notes, BMI3121.


---
