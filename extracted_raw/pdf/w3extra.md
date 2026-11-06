# w3extra

**Source File**: `w3extra.pdf`

**Total Pages**: 1

---

## Page 1

Data Addressing Modes 
These are how you grab or store bytes/words in registers or memory using instructions like MOV. Source 
is on the right, destination on the left (yeah, it's backwards from how we read). MOV copies data without 
changing the source. 
• 
Register: Copies between registers. Ex: MOV CX, DX – Puts DX's word into CX. 
• 
Immediate: Hardcodes a value into a register/memory. Ex: MOV AL, 22H – Sticks 22 hex into 
AL. 
• 
Direct: Moves between register and specific memory spot. No memory-to-memory direct (use 
MOVS for that). Ex: MOV CX, LIST – Grabs word from memory at LIST into CX. 
• 
Register Indirect: Uses a register (like BX, SI) as a pointer to memory. Ex: MOV AX, [BX] – 
Loads word from memory address in BX into AX. 
• 
Base-Plus-Index: Adds base (BX/BP) and index (DI/SI) for the address. Ex: MOV [BX+DI], CL 
– Puts CL's byte into memory at BX + DI. 
• 
Register Relative: Register plus a fixed offset. Ex: MOV AX, [BX+4] – Gets word from BX + 4 
into AX. Or MOV AX, ARRAY[BX] for array access. 
• 
Base Relative-Plus-Index: Base + index + offset. Ex: MOV AX, ARRAY[BX+DI] – Loads from 
ARRAY + BX + DI. Great for arrays or tables. 
• 
Indexed with Displacement: Similar, combines base, index, and extra offset. Ex: MOV AX, 
ARRAY[BX+DI+10] – For multi-dimensional stuff. 
Effective address (EA) is calculated like EA = base + index + displacement to find the spot in memory. 
Program Memory Addressing Modes 
For jumps (JMP) or calls (CALL) to change where the code runs next. 
• 
Direct: Jumps to a fixed address (far jump if across segments). Ex: JMP 10000H – Goes to 
CS:10000H, storing full address after opcode. 
• 
Relative: Jumps relative to current instruction pointer (IP). Short (1-byte offset) or near (2-byte). 
Ex: JMP short label – Adds offset to IP for intra-segment hop. 
• 
Indirect: Jumps via a register or memory pointer. Ex: JMP [BX] – Goes to address stored in BX. 
Near calls/jumps stay in the same segment (IP changes); far ones switch segments (CS and IP update). 
Stack Memory Addressing 
Stack is LIFO for temp data or procedure returns, using SS (segment) and SP (pointer). PUSH decrements 
SP by 2, stores word; POP increments SP by 2, retrieves. 
• 
Ex: Swap AX and BX – PUSH AX; PUSH BX; POP AX; POP BX. (AX gets BX's value, vice 
versa.) 
• 
In procedures: CALL pushes return address; RET pops it back. Can't POP into CS. 
Quick Example: Array Processing 
MOV CX, 5 ; Loop count MOV SI, OFFSET LIST ; SI points to array start LOOP: ADD AX, [SI] ; Add 
array element (indirect) ADD SI, 2 ; Next word DEC CX JNZ LOOP ; Repeat till CX=0


---
