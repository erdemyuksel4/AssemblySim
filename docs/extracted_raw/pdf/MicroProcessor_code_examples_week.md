# MicroProcessor code examples week

**Source File**: `MicroProcessor code examples week.pdf`

**Total Pages**: 8

---

## Page 1

Week 9: Direct Memory Access (DMA) Simulation
1. Simulated DMA Byte Transfer with Offset: Transfers data from a source array to a destination
array with an added offset, similar to a DMA with an offset function.
asm
org 100h
source DB 'DMA Transfer', 0
destination DB 12 DUP('?')       ; destination for the transferred data
mov si, offset source
mov di, offset destination + 2   ; start destination with an offset of 2 bytes
mov cx, 12                       ; number of bytes to transfer
cld                              ; clear direction flag
rep movsb                        ; transfer bytes from source to destination
hlt
2. Block Copy Using `movsw` (Word Transfers): Copies a block of data in 2-byte (word) units to
simulate DMA operations with word-sized transfers.
asm
org 100h
dataBlock DW 1234h, 5678h, 9ABCh, DEF0h
destinationBlock DW 4 DUP(?)
mov si, offset dataBlock
mov di, offset destinationBlock
mov cx, 4                        ; word count for the transfer
cld                              ; clear direction flag
rep movsw                        ; transfer words
hlt
3. DMA Data Transfer with Masking: Simulates a DMA-like transfer with an added mask to each
byte.
asm
org 100h
source DB 0Fh, 1Eh, 2Dh, 3Ch     ; source block
destination DB 4 DUP('?')        ; destination block
mask DB 0FFh                     ; mask value
mov si, offset source
mov di, offset destination
mov cx, 4                        ; number of bytes to transfer
cld                              ; clear direction flag
transfer:
    lodsb                        ; load source byte into al
    and al, mask                 ; apply mask
    stosb 
hlt                       ; store result in destination


---

## Page 2

Week 10: Arithmetic and Logic Instructions
1. Mixed Arithmetic Operations: Uses various arithmetic instructions to calculate a complex
expression.
asm
org 100h
mov ax, 5
add ax, 3                        ; ax = 5 + 3
mov bx, 4
mul bx                           ; ax = ax * 4
sub ax, 6                        ; ax = ax - 6
hlt
2. Shift Operations: Shifts bits in `ax` to demonstrate bitwise shift operations for multiplication
and division.
asm
org 100h
mov ax, 4
shl ax, 1                        ; ax = ax * 2 (multiply by 2)
shr ax, 2                        ; ax = ax / 4 (divide by 4)
hlt
3. Bitwise Logic Combination: Uses `AND`, `OR`, `XOR`, and `NOT` to manipulate individual bits in a
register.
asm
org 100h
mov ax, 0AAAAh                   ; initial value with alternate bits set
and ax, 0F0F0h                   ; clear specific bits with AND
or ax, 0F00Fh                    ; set specific bits with OR
xor ax, 0FFFFh                   ; invert all bits with XOR
not ax                           ; bitwise NOT to flip all bits
hlt


---

## Page 3

org 100h
mov ax, 5
cmp ax, 3
ja greater                       ; jump if ax > 3
mov ax, 1                        ; executed if ax <= 3
jmp end
greater:
    mov ax, 10                   ; executed if ax > 3
end:
hlt
2. Loop with Nested Calls: Demonstrates nested function calls and returns within a loop.
asm
org 100h
mov cx, 3                        ; loop 3 times
loop_start:
    call display_message
    loop loop_start
hlt
display_message:
    ; assume a print routine here
    ret
3. Recursive Call Simulation: Uses `CALL` and `RET` to simulate recursion by looping over a
decrementing register.
asm
org 100h
mov ax, 5                        ; initial value
call decrement
hlt
decrement:
    dec ax
    cmp ax, 0
    jne decrement                ; recurse if ax != 0
    ret
1. Conditional Jump Example: Uses `JMP` and conditional jumps to control program flow based on
a comparison.
Week 11: Control Flow Instructions (JMP, LOOP, CALL, RET)


---

## Page 4

org 100h
mov ah, 0                        ; function for waiting key press
int 16h                          ; BIOS interrupt for keyboard input
hlt
2. Display Character on Screen (`INT 10h`): Uses BIOS interrupt to display a character on the
screen.
asm
org 100h
mov ah, 0Eh                      ; function to print character
mov al, 'A'                      ; character to display
int 10h                          ; BIOS interrupt for display
hlt
3. Software Interrupt to Trigger a Handler: Demonstrates the use of a software interrupt to
trigger a routine, simulating interrupt-driven execution.
asm
org 100h
int 3                            ; software interrupt (often used for breakpoints)
hlt
1. Keyboard Input Interrupt (`INT 16h`): Waits for a key press using a BIOS interrupt, commonly
used in older systems.
Week 12: Interrupts and Exception Handling


---

## Page 5

mov cx, 30
add ax, bx                       ; independent operations for pipelining simulation
add cx, bx
sub bx, ax
hlt
3. Independent Operations within a Loop: Demonstrates pipelining by separating operations in a
loop.
asm
org 100h
mov cx, 4
loop_start:
    add ax, 2                    ; first independent operation
    sub bx, 1                    ; second independent operation
    add dx, 3                    ; third independent operation
    loop loop_start
hlt
org 100h
mov ax, 10
mov bx, 20
asm
2. Multiple Sequential Instructions: Arranges independent instructions in sequence to mimic a
simple pipeline.
add ax, 1                        ; first iteration
add ax, 1                        ; second iteration
add ax, 1                        ; third iteration
add ax, 1                        ; fourth iteration
hlt
org 100h
mov ax, 0
asm
1. Loop Unrolling for Faster Execution: Simulates pipelining by manually unrolling a loop.
Week 13: Instruction Pipelining Simulation


---

## Page 6

Purpose: This program finds the largest element in an array, which ends with `0xaa` as an end
marker. The largest element found is stored in the `dx` register.
asm
; Find the largest element in an array ending with 0xaa
org 100h   
ARRAY DB 11h, 22h, 88h, 99h, 33h, 77h, 44h, 55h, 0xaa  
cld                ; clear direction flag
mov si, offset ARRAY 
mov bx, 0          ; initialize max storage
l0: lodsb          ; load next byte to al
    cmp al, 0xaa   ; check if end of array
    jz end
    cmp al, bx     ; compare with current max in bx
    jb continue
    mov bx, al     ; update max if al is greater
continue: jmp l0 
end: mov dx, bx    ; store max in dx
hlt
2.
cmp ax, bx
jc DIFF2             ; jump if ax < bx
DIFF1: mov dx, ax
       sub dx, bx
       jmp DONE
DIFF2: mov dx, bx
       sub dx, ax
DONE: ret
; Calculate absolute difference of ax and bx, store in dx
mov ax, 5678h
mov bx, 1234h
asm
Purpose: This program calculates the absolute difference between the values in `ax` and `bx`,
storing the result in `dx`.
1.


---

## Page 7

Purpose: Adds values in `ax` and `bx` and stores the sum in `dx`.
asm
; Sum of ax and bx, result in dx
org 100h  
mov ax, 1234h
mov bx, 4321h
call sumAxBx   
hlt
sumAxBx proc  
        mov dx, 0
        add dx, ax
        add dx, bx
        ret
sumAxBx endp
Purpose: Demonstrates `push` and `pop` with registers `ax` and `bx`.
asm
; Demonstrate push and pop with ax and bx
mov ax, 34h
mov bx, 78h
push ax
push bx
pop ax
pop bx
3. 
4.


---

## Page 8

Purpose: Counts odd and even numbers in an array, storing the counts in `bx` (odd) and `dx`
(even).
asm
; Count odd and even numbers in an array
org 100h   
ARRAY DW 8, 11, 43, 56, 507, 608, 0, 123, 17, 13
count DW 10   
cld                  ; auto-increment
mov cx, count
mov si, offset ARRAY 
mov bx, 0            ; odd count
mov dx, 0            ; even count
l0: lodsw            ; load word
    shr ax, 1        ; check LSB for even/odd
    jnc even         ; jump if even
    inc bx           ; increment odd count
    jmp cnt
even: inc dx         ; increment even count
cnt: loop l0
mov ax, 0
hlt
5.


---
