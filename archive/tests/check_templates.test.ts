import { describe, it, expect } from 'vitest';
import { Assembler } from '../src/assembler/assembler.js';
import {
  OS_GUIDE_TEMPLATE,
  BOOT_ASM_TEMPLATE,
  KERNEL_ASM_TEMPLATE,
  SCREEN_ASM_TEMPLATE,
  KEYBOARD_ASM_TEMPLATE,
  SHELL_ASM_TEMPLATE
} from '../src/os/starterTemplates.js';
import {
  REF_BIOS_ROM_TEMPLATE,
  REF_IVT_TABLE_TEMPLATE,
  REF_BDA_MAP_TEMPLATE
} from '../src/os/hardwareRefTemplates.js';

describe('OS Modül ve Donanım Referans Şablonları Derleme Doğrulaması', () => {
  const templates: Record<string, string> = {
    OS_GUIDE_TEMPLATE,
    BOOT_ASM_TEMPLATE,
    KERNEL_ASM_TEMPLATE,
    SCREEN_ASM_TEMPLATE,
    KEYBOARD_ASM_TEMPLATE,
    SHELL_ASM_TEMPLATE,
    REF_BIOS_ROM_TEMPLATE,
    REF_IVT_TABLE_TEMPLATE,
    REF_BDA_MAP_TEMPLATE
  };

  for (const [name, code] of Object.entries(templates)) {
    it(`${name} 8086 Assembly derleyicisi tarafından sıfır hatayla derlenir`, () => {
      const res = Assembler.assemble(code);
      expect(res.errors).toHaveLength(0);
      expect(res.bytes.length).toBeGreaterThan(0);
    });
  }
});
