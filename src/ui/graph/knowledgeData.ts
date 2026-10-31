import { INSTRUCTIONS, InstructionDetail } from '../instructionData.js';

export type NodeKind = 'instruction' | 'flag_hub' | 'sub_hub' | 'mechanism_hub' | 'register' | 'hardware';

export type FlagImpactType = 
  | 'none'             // Hiçbir bayrağı etkilemez (MOV, PUSH, POP, LEA, JMP...)
  | 'all_arithmetic'   // CF, ZF, SF, OF, AF, PF tam güncellenir (ADD, SUB, CMP...)
  | 'no_cf'            // ZF, SF, OF, AF, PF güncellenir, CF korunur (INC, DEC)
  | 'logic'            // CF=0, OF=0, ZF, SF, PF güncellenir (AND, OR, XOR, TEST)
  | 'shift_rotate'     // CF, OF güncellenir, kaydırma miktarına göre (SHL, SHR...)
  | 'flag_control'     // Doğrudan bayrak baytını kurar/temizler (CLC, STC, CLI...)
  | 'flag_transfer'    // Yığın veya AH ile bayrak aktarımı (LAHF, SAHF, PUSHF...)
  | 'undefined_flags'; // Bayraklar tanımsızdır (MUL, DIV...)

export type MechanismType =
  | 'data_transfer'
  | 'arithmetic'
  | 'logic_bitwise'
  | 'stack_op'
  | 'memory_addressing'
  | 'control_jump'
  | 'io_port'
  | 'string_op'
  | 'bcd_ascii'
  | 'processor_control';

export type HardwareLayer = 'eu' | 'biu' | 'alu' | 'memory_stack' | 'io_interrupt';

export interface KnowledgeNode {
  id: string;
  label: string;
  kind: NodeKind;
  category: string;
  flagImpact: FlagImpactType;
  mechanism: MechanismType;
  hardwareLayer: HardwareLayer;
  summary: string;
  flagsText: string;
  rules?: string;
  variationsCount: number;
  sampleCode?: string;
  color: string;
  radius: number;
  // Sub-trait properties
  subTraitId?: string;
  memberCount?: number;
  // Physics coordinates
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null; // Fixed position if pinned
  fy?: number | null;
  clusterId?: string; // Current cluster key for grouping
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relation: 'has_flag_impact' | 'uses_mechanism' | 'belongs_layer' | 'shares_trait' | 'related_to';
  label?: string;
  strength?: number;
}

export interface ClusterInfo {
  id: string;
  label: string;
  color: string;
  description: string;
  anchorX: number;
  anchorY: number;
}

export type GroupingMode = 'subclusters' | 'flags' | 'mechanism' | 'category' | 'hardware';

// Sub-trait definitions: Intermediate junction nodes for common properties
export interface SubTraitDefinition {
  id: string;
  label: string;
  shortDesc: string;
  flagImpact: FlagImpactType;
  mechanism: MechanismType;
  hardwareLayer: HardwareLayer;
  category: string;
  color: string;
  anchorOffset: { x: number; y: number };
  instructions: string[];
}

export const SUB_TRAITS: SubTraitDefinition[] = [
  // 1. Stack Operations
  {
    id: 'sub-stack-ops',
    label: '📚 Yığın İşlemleri',
    shortDesc: 'SS ve SP ile yığına veri iten/çeken ve alt yordam yöneten LIFO komutları.',
    flagImpact: 'none',
    mechanism: 'stack_op',
    hardwareLayer: 'memory_stack',
    category: 'data',
    color: '#f59e0b',
    anchorOffset: { x: -320, y: -260 },
    instructions: ['PUSH', 'POP', 'PUSHF', 'POPF', 'CALL', 'RET', 'RETN', 'RETF']
  },
  // 2. Effective Address Loaders
  {
    id: 'sub-addr-loaders',
    label: '🎯 Adres Yükleyiciler',
    shortDesc: 'Bellek değerini değil, doğrudan efektif ofset adresini veya segment pointerını yükleyen komutlar.',
    flagImpact: 'none',
    mechanism: 'memory_addressing',
    hardwareLayer: 'biu',
    category: 'data',
    color: '#10b981',
    anchorOffset: { x: -360, y: -120 },
    instructions: ['LEA', 'LDS', 'LES', 'XLAT', 'XLATB']
  },
  // 3. Raw Data Movement & Exchange
  {
    id: 'sub-raw-data',
    label: '📦 Veri Taşıma & Takas',
    shortDesc: 'Yazmaç, bellek ve sabitler arası bayrakları bozmadan değer kopyalayan ve takas eden çekirdek komutlar.',
    flagImpact: 'none',
    mechanism: 'data_transfer',
    hardwareLayer: 'eu',
    category: 'data',
    color: '#3b82f6',
    anchorOffset: { x: -220, y: -220 },
    instructions: ['MOV', 'XCHG']
  },
  // 4. Additive Arithmetic
  {
    id: 'sub-arith-add',
    label: '➕ Toplama & Artırma',
    shortDesc: 'İki sayıyı toplayan, eldeyi (CF) ekleyen veya sayacı 1 artıran komutlar.',
    flagImpact: 'all_arithmetic',
    mechanism: 'arithmetic',
    hardwareLayer: 'alu',
    category: 'arithmetic',
    color: '#ef4444',
    anchorOffset: { x: 240, y: -260 },
    instructions: ['ADD', 'ADC', 'INC']
  },
  // 5. Subtractive & Compare
  {
    id: 'sub-arith-sub',
    label: '➖ Çıkarma & Karşılaştırma',
    shortDesc: 'Fark hesaplayan, borç (CF) alan veya sonucu kaydetmeden sadece bayrak kuran (CMP) komutlar.',
    flagImpact: 'all_arithmetic',
    mechanism: 'arithmetic',
    hardwareLayer: 'alu',
    category: 'arithmetic',
    color: '#f43f5e',
    anchorOffset: { x: 340, y: -160 },
    instructions: ['SUB', 'SBB', 'DEC', 'NEG', 'CMP']
  },
  // 6. Multiplication & Division
  {
    id: 'sub-arith-muldiv',
    label: '✖️ Çarpma & Bölme',
    shortDesc: 'AX/DX yazmaçlarını kullanan, işaretli ve işaretsiz çarpma ve bölme komutları.',
    flagImpact: 'undefined_flags',
    mechanism: 'arithmetic',
    hardwareLayer: 'alu',
    category: 'arithmetic',
    color: '#e11d48',
    anchorOffset: { x: 300, y: -60 },
    instructions: ['MUL', 'IMUL', 'DIV', 'IDIV']
  },
  // 7. Zero Flag Branching
  {
    id: 'sub-branch-zero',
    label: '🎯 ZF Eşitlik Atlama',
    shortDesc: 'Sonuç sıfırsa veya karşılaştırma eşitse (ZF=1/0) dallanan koşullu sıçramalar.',
    flagImpact: 'none',
    mechanism: 'control_jump',
    hardwareLayer: 'eu',
    category: 'control',
    color: '#06b6d4',
    anchorOffset: { x: -140, y: 180 },
    instructions: ['JZ', 'JE', 'JNZ', 'JNE']
  },
  // 8. Carry Flag Branching
  {
    id: 'sub-branch-carry',
    label: '🚩 CF Elde Atlama',
    shortDesc: 'İşaretsiz sayılarda elde veya borç durumuna (CF=1/0) göre dallanan sıçramalar.',
    flagImpact: 'none',
    mechanism: 'control_jump',
    hardwareLayer: 'eu',
    category: 'control',
    color: '#0ea5e9',
    anchorOffset: { x: -40, y: 220 },
    instructions: ['JC', 'JB', 'JNC', 'JAE', 'JA', 'JBE']
  },
  // 9. Signed Branching
  {
    id: 'sub-branch-signed',
    label: '⚖️ İşaretli Atlama',
    shortDesc: 'İşaretli karşılaştırma sonuçlarına (SF ve OF bayraklarının ilişkisine) göre dallanmalar.',
    flagImpact: 'none',
    mechanism: 'control_jump',
    hardwareLayer: 'eu',
    category: 'control',
    color: '#38bdf8',
    anchorOffset: { x: 60, y: 220 },
    instructions: ['JG', 'JL', 'JGE', 'JLE']
  },
  // 10. Loop & Counter Branching
  {
    id: 'sub-branch-loop',
    label: '🔁 Döngü Sayaçları',
    shortDesc: 'CX yazmacını otomatik azaltarak sıfır olana kadar geri dönen donanımsal döngüler.',
    flagImpact: 'none',
    mechanism: 'control_jump',
    hardwareLayer: 'eu',
    category: 'control',
    color: '#67e8f9',
    anchorOffset: { x: -180, y: 260 },
    instructions: ['LOOP', 'LOOPE', 'LOOPNE', 'JCXZ']
  },
  // 11. Unconditional Branching
  {
    id: 'sub-branch-uncond',
    label: '🔀 Koşulsuz Dallanma',
    shortDesc: 'Bayrak durumuna bakılmaksızın IP göstergesini doğrudan yeni adrese yönlendiren komutlar.',
    flagImpact: 'none',
    mechanism: 'control_jump',
    hardwareLayer: 'eu',
    category: 'control',
    color: '#22d3ee',
    anchorOffset: { x: -280, y: 160 },
    instructions: ['JMP', 'CALL', 'RET', 'RETN', 'RETF']
  },
  // 12. Bitwise Logic Masks
  {
    id: 'sub-logic-masks',
    label: '🔲 Bit Maskeleme',
    shortDesc: 'AND, OR, XOR, TEST ve NOT ile bitleri maskeleyen veya tersleyen mantık komutları.',
    flagImpact: 'logic',
    mechanism: 'logic_bitwise',
    hardwareLayer: 'alu',
    category: 'logical',
    color: '#8b5cf6',
    anchorOffset: { x: 180, y: 160 },
    instructions: ['AND', 'OR', 'XOR', 'NOT', 'TEST']
  },
  // 13. Linear Bit Shifts
  {
    id: 'sub-shift-linear',
    label: '🔄 Doğrusal Kaydırma',
    shortDesc: 'Bitleri sağa/sola öteleyen ve atılan biti CF bayrağına aktaran hızlı çarpma/bölme komutları.',
    flagImpact: 'shift_rotate',
    mechanism: 'logic_bitwise',
    hardwareLayer: 'alu',
    category: 'logical',
    color: '#a855f7',
    anchorOffset: { x: 260, y: 240 },
    instructions: ['SHL', 'SAL', 'SHR', 'SAR']
  },
  // 14. Circular Bit Rotations
  {
    id: 'sub-shift-rotate',
    label: '🔁 Dairesel Döndürme',
    shortDesc: 'Bitleri uçtan uca veya CF bayrağını da halkaya dahil ederek döndüren komutlar.',
    flagImpact: 'shift_rotate',
    mechanism: 'logic_bitwise',
    hardwareLayer: 'alu',
    category: 'logical',
    color: '#c084fc',
    anchorOffset: { x: 340, y: 180 },
    instructions: ['ROL', 'ROR', 'RCL', 'RCR']
  },
  // 15. Flag Modifiers & Flippers
  {
    id: 'sub-flag-control',
    label: '🚩 Bayrak Kurucular',
    shortDesc: 'Doğrudan elde (CF), yön (DF) veya kesme (IF) bayrağını 1 veya 0 yapan 1 baytlık komutlar.',
    flagImpact: 'flag_control',
    mechanism: 'processor_control',
    hardwareLayer: 'eu',
    category: 'flags',
    color: '#ec4899',
    anchorOffset: { x: 0, y: -340 },
    instructions: ['CLC', 'STC', 'CMC', 'CLD', 'STD', 'CLI', 'STI']
  },
  // 16. Flag Stack & Transfer
  {
    id: 'sub-flag-transfer',
    label: '📥 Bayrak Aktarımı',
    shortDesc: 'Tüm bayrak yazmacını yığına kaydeden veya AH yazmacıyla transfer eden köprü komutlar.',
    flagImpact: 'flag_transfer',
    mechanism: 'stack_op',
    hardwareLayer: 'memory_stack',
    category: 'flags',
    color: '#6366f1',
    anchorOffset: { x: -140, y: -340 },
    instructions: ['LAHF', 'SAHF', 'PUSHF', 'POPF']
  },
  // 17. Block String Operations
  {
    id: 'sub-string-ops',
    label: '🧵 Dizi (String) Blokları',
    shortDesc: 'SI/DI ve DF bayrağını kullanarak ardışık bellek bloklarını otomatik kopyalayan/tarayan komutlar.',
    flagImpact: 'none',
    mechanism: 'string_op',
    hardwareLayer: 'biu',
    category: 'string',
    color: '#14b8a6',
    anchorOffset: { x: -40, y: 60 },
    instructions: ['MOVSB', 'MOVSW', 'LODSB', 'LODSW', 'STOSB', 'STOSW', 'CMPSB', 'CMPSW', 'SCASB', 'SCASW', 'REP', 'REPE', 'REPNE']
  },
  // 18. Hardware Port I/O
  {
    id: 'sub-port-io',
    label: '🔌 I/O Portları & Kesmeler',
    shortDesc: 'Harici donanım portlarına (IN/OUT) erişen ve yazılımsal kesmeler (INT) tetikleyen komutlar.',
    flagImpact: 'none',
    mechanism: 'io_port',
    hardwareLayer: 'io_interrupt',
    category: 'data',
    color: '#f43f5e',
    anchorOffset: { x: 120, y: -60 },
    instructions: ['IN', 'OUT', 'INT', 'INTO', 'IRET']
  },
  // 19. BCD & Decimal Adjusters
  {
    id: 'sub-bcd-adjust',
    label: '🔢 BCD / Onluk Düzeltme',
    shortDesc: 'İkili aritmetik sonuçlarını paketli veya paketsiz onluk basamaklara (BCD) dönüştüren düzelticiler.',
    flagImpact: 'all_arithmetic',
    mechanism: 'bcd_ascii',
    hardwareLayer: 'alu',
    category: 'bcd',
    color: '#fbbf24',
    anchorOffset: { x: 380, y: -20 },
    instructions: ['DAA', 'DAS', 'AAA', 'AAS', 'AAM', 'AAD']
  },
  // 20. CPU State & Synchronization
  {
    id: 'sub-cpu-state',
    label: '⚙️ İşlemci Kontrol & Kilit',
    shortDesc: 'İşlemciyi durduran (HLT), bus kilitleyen (LOCK) veya boş döngü atan (NOP) sistem komutları.',
    flagImpact: 'none',
    mechanism: 'processor_control',
    hardwareLayer: 'eu',
    category: 'control',
    color: '#64748b',
    anchorOffset: { x: 0, y: 0 },
    instructions: ['HLT', 'NOP', 'WAIT', 'LOCK', 'ESC']
  }
];

// Helper functions for classification
function determineFlagImpact(opcode: string, flagsStr: string): FlagImpactType {
  const op = opcode.toUpperCase().trim();
  const f = flagsStr.toLowerCase();

  if (['CLC', 'STC', 'CMC', 'CLD', 'STD', 'CLI', 'STI'].includes(op)) {
    return 'flag_control';
  }
  if (['LAHF', 'SAHF', 'PUSHF', 'POPF'].includes(op)) {
    return 'flag_transfer';
  }
  if (['INC', 'DEC'].includes(op)) {
    return 'no_cf';
  }
  if (['AND', 'OR', 'XOR', 'TEST', 'NOT'].includes(op)) {
    return op === 'NOT' ? 'none' : 'logic';
  }
  if (['SHL', 'SHR', 'SAL', 'SAR', 'ROL', 'ROR', 'RCL', 'RCR'].includes(op)) {
    return 'shift_rotate';
  }
  if (['MUL', 'IMUL', 'DIV', 'IDIV', 'AAM', 'AAD'].includes(op)) {
    return 'undefined_flags';
  }
  if (f.includes('etkilemez') || f.includes('hiçbir')) {
    return 'none';
  }
  if (f.includes('cf') && f.includes('zf') && f.includes('sf') && f.includes('of')) {
    return 'all_arithmetic';
  }
  return 'none';
}

function determineMechanism(opcode: string, category: string): MechanismType {
  const op = opcode.toUpperCase().trim();
  if (['PUSH', 'POP', 'PUSHF', 'POPF', 'CALL', 'RET', 'RETN', 'RETF'].includes(op)) {
    return 'stack_op';
  }
  if (['LEA', 'LDS', 'LES', 'XLAT', 'XLATB'].includes(op)) {
    return 'memory_addressing';
  }
  if (['IN', 'OUT'].includes(op)) {
    return 'io_port';
  }
  if (['INT', 'INTO', 'IRET'].includes(op)) {
    return 'io_port';
  }
  if (['MOVS', 'MOVSB', 'MOVSW', 'CMPS', 'CMPSB', 'CMPSW', 'LODS', 'LODSB', 'LODSW', 'STOS', 'STOSB', 'STOSW', 'SCAS', 'SCASB', 'SCASW', 'REP', 'REPE', 'REPNE', 'REPZ', 'REPNZ'].includes(op)) {
    return 'string_op';
  }
  if (['DAA', 'DAS', 'AAA', 'AAS', 'AAM', 'AAD', 'CBW', 'CWD'].includes(op)) {
    return 'bcd_ascii';
  }
  if (['HLT', 'WAIT', 'ESC', 'LOCK', 'NOP', 'CLC', 'STC', 'CMC', 'CLD', 'STD', 'CLI', 'STI'].includes(op)) {
    return 'processor_control';
  }
  if (category === 'control' || op.startsWith('J') || op.startsWith('LOOP')) {
    return 'control_jump';
  }
  if (category === 'arithmetic') {
    return 'arithmetic';
  }
  if (category === 'logical') {
    return 'logic_bitwise';
  }
  return 'data_transfer';
}

function determineHardwareLayer(opcode: string, category: string): HardwareLayer {
  const mech = determineMechanism(opcode, category);
  if (mech === 'stack_op' || mech === 'memory_addressing') return 'memory_stack';
  if (mech === 'io_port') return 'io_interrupt';
  if (mech === 'arithmetic' || mech === 'logic_bitwise' || mech === 'bcd_ascii') return 'alu';
  if (category === 'data' || mech === 'string_op') return 'biu';
  return 'eu';
}

// Color palette
export const GRAPH_COLORS = {
  flagNone: '#10b981',       // Emerald Green
  flagAll: '#ef4444',        // Red
  flagNoCf: '#f59e0b',       // Amber
  flagLogic: '#8b5cf6',      // Violet
  flagShift: '#06b6d4',      // Cyan
  flagControl: '#ec4899',    // Pink
  flagTransfer: '#6366f1',   // Indigo
  flagUndefined: '#64748b',  // Slate
  
  hubNode: '#3b82f6',
  subHubNode: '#f59e0b',
  registerNode: '#f97316',
  hardwareNode: '#14b8a6',
  
  linkDefault: 'rgba(148, 163, 184, 0.22)',
  linkHighlight: '#38bdf8'
};

export function build8086KnowledgeGraph(): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  const instructionNodeMap = new Map<string, KnowledgeNode>();

  // 1. PRIMARY FLAG HUBS (Global Theme Anchors)
  const flagHubs: Array<{ id: string; label: string; flagType: FlagImpactType; desc: string; color: string; x: number; y: number }> = [
    {
      id: 'hub-flag-none',
      label: '🚫 Bayrakları Etkilemez',
      flagType: 'none',
      desc: 'İşlemci durum bayraklarını (CF, ZF, SF, OF, AF, PF) değiştirmeyen, güvenle veri aktaran veya atlayan komutlar.',
      color: GRAPH_COLORS.flagNone,
      x: -280,
      y: -180
    },
    {
      id: 'hub-flag-all',
      label: '⚡ Tüm Aritmetik Bayraklar',
      flagType: 'all_arithmetic',
      desc: 'İşlem sonucuna göre tüm durum bayraklarını (CF, ZF, SF, OF, AF, PF) eksiksiz güncelleyen temel matematiksel komutlar.',
      color: GRAPH_COLORS.flagAll,
      x: 280,
      y: -180
    },
    {
      id: 'hub-flag-no-cf',
      label: '⚠️ CF Hariç Güncellenenler',
      flagType: 'no_cf',
      desc: 'Döngü indekslerini bozmamak için Carry (CF) bayrağına dokunmayan, diğer bayrakları güncelleyen komutlar (INC, DEC).',
      color: GRAPH_COLORS.flagNoCf,
      x: 260,
      y: 120
    },
    {
      id: 'hub-flag-logic',
      label: '🧩 Mantıksal İşlemler (CF=0, OF=0)',
      flagType: 'logic',
      desc: 'Mantıksal bit işlemleri. CF ve OF bayraklarını daima sıfırlar; ZF, SF, PF bayraklarını sonuca göre ayarlar.',
      color: GRAPH_COLORS.flagLogic,
      x: 0,
      y: 280
    },
    {
      id: 'hub-flag-shift',
      label: '🔄 Kaydırma & Döndürme',
      flagType: 'shift_rotate',
      desc: 'Bitleri sağa/sola kaydıran ve son atılan biti Carry (CF) bayrağında saklayan kaydırma ve rotasyon komutları.',
      color: GRAPH_COLORS.flagShift,
      x: -280,
      y: 160
    },
    {
      id: 'hub-flag-control',
      label: '🚩 Bayrak Kurma / Temizleme',
      flagType: 'flag_control',
      desc: 'Doğrudan işlemci bayraklarını değiştiren kontrol komutları (CLC, STC, CMC, CLD, STD, CLI, STI).',
      color: GRAPH_COLORS.flagControl,
      x: -80,
      y: -320
    },
    {
      id: 'hub-flag-transfer',
      label: '📥 Bayrak Aktarımı & Yığın',
      flagType: 'flag_transfer',
      desc: 'Tüm bayrak yazmacını yığına atan veya AH yazmacıyla bayrak transferi yapan komutlar (LAHF, SAHF, PUSHF, POPF).',
      color: GRAPH_COLORS.flagTransfer,
      x: 100,
      y: -320
    }
  ];

  flagHubs.forEach(hub => {
    nodes.push({
      id: hub.id,
      label: hub.label,
      kind: 'flag_hub',
      category: 'flags',
      flagImpact: hub.flagType,
      mechanism: 'processor_control',
      hardwareLayer: 'eu',
      summary: hub.desc,
      flagsText: hub.label,
      variationsCount: 0,
      color: hub.color,
      radius: 22,
      x: hub.x,
      y: hub.y,
      vx: 0,
      vy: 0
    });
  });

  // 2. SUB-TRAIT JUNCTION NODES (The User's Requested "Alt Maddeler / Ortak Düğümler")
  SUB_TRAITS.forEach(st => {
    nodes.push({
      id: st.id,
      label: st.label,
      kind: 'sub_hub',
      category: st.category,
      flagImpact: st.flagImpact,
      mechanism: st.mechanism,
      hardwareLayer: st.hardwareLayer,
      summary: `${st.shortDesc} — ${st.instructions.length} ortak komut bu kavşakta toplanır.`,
      flagsText: `Alt Küme: ${st.label}`,
      variationsCount: st.instructions.length,
      memberCount: st.instructions.length,
      color: st.color,
      radius: 17,
      x: st.anchorOffset.x,
      y: st.anchorOffset.y,
      vx: 0,
      vy: 0
    });

    // Link Sub-Trait to its Parent Flag Hub
    let parentHubId: string | null = null;
    if (st.flagImpact === 'none') parentHubId = 'hub-flag-none';
    else if (st.flagImpact === 'all_arithmetic') parentHubId = 'hub-flag-all';
    else if (st.flagImpact === 'no_cf') parentHubId = 'hub-flag-no-cf';
    else if (st.flagImpact === 'logic') parentHubId = 'hub-flag-logic';
    else if (st.flagImpact === 'shift_rotate') parentHubId = 'hub-flag-shift';
    else if (st.flagImpact === 'flag_control') parentHubId = 'hub-flag-control';
    else if (st.flagImpact === 'flag_transfer') parentHubId = 'hub-flag-transfer';

    if (parentHubId) {
      edges.push({
        id: `tree-${st.id}-${parentHubId}`,
        source: st.id,
        target: parentHubId,
        relation: 'has_flag_impact',
        label: 'Alt Grup',
        strength: 0.5
      });
    }
  });

  // 3. INSTRUCTION NODES
  let nodeIndex = 0;
  INSTRUCTIONS.forEach((inst) => {
    const subOpcodes = inst.opcode.includes('/')
      ? inst.opcode.split('/').map(s => s.trim()).filter(Boolean)
      : [inst.opcode.trim()];

    const createdNodeIds: string[] = [];

    subOpcodes.forEach((op) => {
      const flagImpact = determineFlagImpact(op, inst.flags);
      const mech = determineMechanism(op, inst.category);
      const hw = determineHardwareLayer(op, inst.category);

      let color = GRAPH_COLORS.flagNone;
      if (flagImpact === 'all_arithmetic') color = GRAPH_COLORS.flagAll;
      else if (flagImpact === 'no_cf') color = GRAPH_COLORS.flagNoCf;
      else if (flagImpact === 'logic') color = GRAPH_COLORS.flagLogic;
      else if (flagImpact === 'shift_rotate') color = GRAPH_COLORS.flagShift;
      else if (flagImpact === 'flag_control') color = GRAPH_COLORS.flagControl;
      else if (flagImpact === 'flag_transfer') color = GRAPH_COLORS.flagTransfer;
      else if (flagImpact === 'undefined_flags') color = GRAPH_COLORS.flagUndefined;

      // Find primary sub-trait for this instruction
      const matchingSubTrait = SUB_TRAITS.find(st => st.instructions.includes(op));

      // Initial placement near its sub-trait anchor or dispersed
      let initX = (Math.random() - 0.5) * 600;
      let initY = (Math.random() - 0.5) * 500;
      if (matchingSubTrait) {
        initX = matchingSubTrait.anchorOffset.x + (Math.random() - 0.5) * 90;
        initY = matchingSubTrait.anchorOffset.y + (Math.random() - 0.5) * 90;
      }

      const radius = Math.min(15, Math.max(9, 8 + Math.round(inst.variations.length * 0.7)));
      nodeIndex++;

      const sample = inst.variations[0]?.example || (inst.variations[0] ? `${inst.variations[0].syntax}` : `${op} AX, BX`);
      const nodeId = `inst-${op.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      createdNodeIds.push(nodeId);

      const instructionNode: KnowledgeNode = {
        id: nodeId,
        label: op,
        kind: 'instruction',
        category: inst.category,
        flagImpact,
        mechanism: mech,
        hardwareLayer: hw,
        subTraitId: matchingSubTrait?.id,
        summary: `${inst.name} — ${inst.summary}`,
        flagsText: inst.flags,
        rules: inst.rules,
        variationsCount: inst.variations.length,
        sampleCode: sample,
        color,
        radius,
        x: initX,
        y: initY,
        vx: 0,
        vy: 0
      };

      nodes.push(instructionNode);
      instructionNodeMap.set(op, instructionNode);

      // Connect instruction to its Sub-Trait Junction Nodes
      // An instruction can connect to MULTIPLE sub-traits if it shares multiple traits!
      SUB_TRAITS.forEach(st => {
        if (st.instructions.includes(op)) {
          edges.push({
            id: `edge-${nodeId}-${st.id}`,
            source: nodeId,
            target: st.id,
            relation: 'shares_trait',
            label: st.label,
            strength: 0.55
          });
        }
      });
    });

    // Link sibling opcodes from compound definitions
    if (createdNodeIds.length > 1) {
      for (let i = 0; i < createdNodeIds.length - 1; i++) {
        edges.push({
          id: `sibling-${createdNodeIds[i]}-${createdNodeIds[i + 1]}`,
          source: createdNodeIds[i],
          target: createdNodeIds[i + 1],
          relation: 'related_to',
          label: 'Eşdeğer Varyant',
          strength: 0.75
        });
      }
    }
  });

  // 4. CROSS-SUBTRAIT SYNAPSE BRIDGES (Connecting complementary pairs)
  // e.g. CMP <-> JZ, CMP <-> JC, TEST <-> JZ, LEA <-> MOV, PUSH <-> POP
  const bridgePairs: Array<[string, string, string]> = [
    ['CMP', 'JZ', 'Karşılaştır ve Eşitse'],
    ['CMP', 'JNZ', 'Karşılaştır ve Farklıysa'],
    ['CMP', 'JC', 'Karşılaştır ve Elde Varsa'],
    ['TEST', 'JZ', 'Bit Testi ve Sıfırsa'],
    ['MOV', 'LEA', 'Değer vs Efektif Adres'],
    ['PUSH', 'POP', 'LIFO Yığın İkilisi'],
    ['CALL', 'RET', 'Yordam Çağır/Dön'],
    ['IN', 'OUT', 'I/O Port Giriş/Çıkış'],
    ['MOVSB', 'REP', 'Tekrarlı Blok Taşıma'],
    ['ADD', 'ADC', 'Eldeli Toplama'],
    ['SUB', 'SBB', 'Borçlu Çıkarma']
  ];

  bridgePairs.forEach(([op1, op2, label]) => {
    const n1 = instructionNodeMap.get(op1);
    const n2 = instructionNodeMap.get(op2);
    if (n1 && n2) {
      edges.push({
        id: `bridge-${n1.id}-${n2.id}`,
        source: n1.id,
        target: n2.id,
        relation: 'related_to',
        label,
        strength: 0.65
      });
    }
  });

  return { nodes, edges };
}

// Compute cluster anchors based on chosen Grouping Mode
export function getClusterDefinitions(mode: GroupingMode): ClusterInfo[] {
  switch (mode) {
    case 'subclusters':
      // The 20 specific sub-clusters requested by user!
      return SUB_TRAITS.map(st => ({
        id: st.id,
        label: st.label,
        color: st.color,
        description: st.shortDesc,
        anchorX: st.anchorOffset.x,
        anchorY: st.anchorOffset.y
      }));

    case 'flags':
      return [
        {
          id: 'none',
          label: '🚫 Bayrakları Etkilemeyenler',
          color: GRAPH_COLORS.flagNone,
          description: 'MOV, PUSH, POP, LEA, JMP, IN, OUT vb. İşlemci durumunu bozmaz.',
          anchorX: -260,
          anchorY: -180
        },
        {
          id: 'all_arithmetic',
          label: '⚡ Tüm Aritmetik Bayraklar',
          color: GRAPH_COLORS.flagAll,
          description: 'ADD, SUB, CMP, NEG vb. CF, ZF, SF, OF, AF, PF günceller.',
          anchorX: 260,
          anchorY: -180
        },
        {
          id: 'no_cf',
          label: '⚠️ CF Hariç Güncellenenler',
          color: GRAPH_COLORS.flagNoCf,
          description: 'INC, DEC. Döngü sayacını güncellerken Carry bayrağını korur.',
          anchorX: 280,
          anchorY: 140
        },
        {
          id: 'logic',
          label: '🧩 Mantıksal İşlemler (CF=0, OF=0)',
          color: GRAPH_COLORS.flagLogic,
          description: 'AND, OR, XOR, TEST. Bit maskeleme yapar, CF ve OF sıfırlar.',
          anchorX: 0,
          anchorY: 260
        },
        {
          id: 'shift_rotate',
          label: '🔄 Kaydırma & Döndürme',
          color: GRAPH_COLORS.flagShift,
          description: 'SHL, SHR, SAR, ROL, ROR. Bitleri öteler, CF ve OF bayraklarını etkiler.',
          anchorX: -280,
          anchorY: 140
        },
        {
          id: 'flag_control',
          label: '🚩 Bayrak Kurma/Temizleme',
          color: GRAPH_COLORS.flagControl,
          description: 'CLC, STC, CLI, STI, CLD, STD. Doğrudan kontrol bayraklarını yönetir.',
          anchorX: -100,
          anchorY: -300
        },
        {
          id: 'flag_transfer',
          label: '📥 Bayrak Aktarımı',
          color: GRAPH_COLORS.flagTransfer,
          description: 'LAHF, SAHF, PUSHF, POPF. Bayrakları yığınla veya AH ile taşır.',
          anchorX: 100,
          anchorY: -300
        },
        {
          id: 'undefined_flags',
          label: '⚙️ Özel / Tanımsız',
          color: GRAPH_COLORS.flagUndefined,
          description: 'MUL, DIV vb. Bayrakları özel ve tanımsız bırakan işlemler.',
          anchorX: 0,
          anchorY: 0
        }
      ];

    case 'mechanism':
      return [
        { id: 'data_transfer', label: '📦 Veri Aktarımı', color: '#3b82f6', description: 'Yazmaç, bellek ve sabitler arası veri kopyalama.', anchorX: -280, anchorY: -200 },
        { id: 'arithmetic', label: '➕ Aritmetik', color: '#ef4444', description: 'Toplama, çıkarma, çarpma, bölme.', anchorX: 280, anchorY: -200 },
        { id: 'logic_bitwise', label: '🔲 Mantıksal & Bit', color: '#8b5cf6', description: 'VE, VEYA, ÖZEL VEYA, DEĞİL bit operasyonları.', anchorX: 280, anchorY: 160 },
        { id: 'stack_op', label: '📚 Yığın (Stack)', color: '#f59e0b', description: 'LIFO prensibiyle PUSH/POP ve alt yordam çağrıları.', anchorX: -280, anchorY: 160 },
        { id: 'control_jump', label: '🔀 Atlama & Döngü', color: '#06b6d4', description: 'Şartlı/şartsız dallanmalar ve döngüler.', anchorX: 0, anchorY: -280 },
        { id: 'memory_addressing', label: '💾 Bellek & Pointer', color: '#10b981', description: 'Adres hesaplama (LEA, LDS, LES, XLAT).', anchorX: -160, anchorY: 280 },
        { id: 'io_port', label: '🔌 I/O & Kesmeler', color: '#ec4899', description: 'Port erişimi (IN/OUT) ve yazılımsal kesmeler (INT).', anchorX: 160, anchorY: 280 },
        { id: 'string_op', label: '🧵 Dizi (String)', color: '#14b8a6', description: 'Ardışık bellek blokları üzerinde otomatik artan işlemler.', anchorX: 0, anchorY: 0 }
      ];

    case 'category':
      return [
        { id: 'data', label: 'Veri Transferi', color: '#3b82f6', description: 'Veri hareketi', anchorX: -280, anchorY: -160 },
        { id: 'arithmetic', label: 'Aritmetik', color: '#ef4444', description: 'Matematiksel komutlar', anchorX: 280, anchorY: -160 },
        { id: 'logical', label: 'Mantıksal', color: '#8b5cf6', description: 'Mantık ve bit işlemleri', anchorX: 280, anchorY: 160 },
        { id: 'control', label: 'Kontrol & Atlama', color: '#06b6d4', description: 'Dallanma komutları', anchorX: -280, anchorY: 160 },
        { id: 'string', label: 'Dizgiler', color: '#10b981', description: 'String komutları', anchorX: 0, anchorY: -280 },
        { id: 'bcd', label: 'BCD / ASCII', color: '#f59e0b', description: 'Onluk düzeltmeler', anchorX: 0, anchorY: 280 },
        { id: 'flags', label: 'Bayraklar', color: '#ec4899', description: 'Bayrak yönetimi', anchorX: 0, anchorY: 0 }
      ];

    case 'hardware':
      return [
        { id: 'alu', label: '⚙️ Aritmetik Mantık Birimi (ALU)', color: '#ef4444', description: 'Tüm hesaplamaların ve bayrak güncellemelerinin kalbi.', anchorX: 260, anchorY: -160 },
        { id: 'biu', label: '🚌 Veri Yolu Arayüzü (BIU)', color: '#3b82f6', description: 'Bellekten komut getirme, segmentasyon ve adres üretimi.', anchorX: -260, anchorY: -160 },
        { id: 'memory_stack', label: '💾 Bellek & Yığın Segmenti', color: '#10b981', description: 'Yığın işaretçisi (SP) ve işaretçi bazlı bellek erişimi.', anchorX: -260, anchorY: 180 },
        { id: 'io_interrupt', label: '🔌 I/O ve Kesme Birimi', color: '#ec4899', description: 'Harici çevre birimleri ve IVT kesme vektör tablosu.', anchorX: 260, anchorY: 180 },
        { id: 'eu', label: '🧠 Yürütme Birimi (EU Kontrol)', color: '#8b5cf6', description: 'Komut çözücü ve genel amaçlı yazmaçlar.', anchorX: 0, anchorY: 0 }
      ];
  }
}
