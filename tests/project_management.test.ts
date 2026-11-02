import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspaceManager } from '../src/workspace/workspaceManager';

describe('Workspace Project Management (New Project, Open Project, Export/Import)', () => {
  let ws: WorkspaceManager;

  beforeEach(() => {
    // Clear global localStorage mock if present
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    ws = new WorkspaceManager();
  });

  it('initializes with a default project', () => {
    const proj = ws.getProject();
    expect(proj.name).toBe('8086 Projesi');
    expect(proj.files.length).toBe(1);
    expect(proj.files[0].name).toBe('main.asm');
  });

  it('creates a new project and switches to it', () => {
    const firstProjId = ws.getProject().id;
    const newProj = ws.createProject('Hesap Makinesi');

    expect(newProj.name).toBe('Hesap Makinesi');
    expect(newProj.id).not.toBe(firstProjId);
    expect(newProj.files.length).toBe(1);
    expect(newProj.files[0].name).toBe('main.asm');
    expect(ws.getProject().id).toBe(newProj.id);
  });

  it('maintains a list of projects', () => {
    ws.createProject('Proje A');
    ws.createProject('Proje B');

    const list = ws.getProjectsList();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list.some(p => p.name === 'Proje A')).toBe(true);
    expect(list.some(p => p.name === 'Proje B')).toBe(true);
  });

  it('switches between projects via openProject', () => {
    const proj1 = ws.getProject();
    ws.createFile('modul1.asm', 'MOV AX, 1');

    const proj2 = ws.createProject('İkinci Proje');
    expect(ws.getProject().id).toBe(proj2.id);

    // Switch back to proj1
    const ok = ws.openProject(proj1.id);
    expect(ok).toBe(true);
    expect(ws.getProject().id).toBe(proj1.id);
    expect(ws.getAllFiles().some(f => f.name === 'modul1.asm')).toBe(true);
  });

  it('renames current project', () => {
    ws.renameCurrentProject('Yeni İsim');
    expect(ws.getProject().name).toBe('Yeni İsim');
  });

  it('exports and imports project JSON', () => {
    ws.renameCurrentProject('Dışa Aktarılacak Proje');
    ws.createFile('ekran.asm', 'MOV AH, 09H\nINT 21H');
    const jsonStr = ws.exportProjectJson();

    expect(jsonStr).toContain('Dışa Aktarılacak Proje');
    expect(jsonStr).toContain('ekran.asm');

    // Create a fresh workspace and import
    const newWs = new WorkspaceManager();
    const ok = newWs.importProjectJson(jsonStr);

    expect(ok).toBe(true);
    expect(newWs.getProject().name).toBe('Dışa Aktarılacak Proje');
    expect(newWs.getAllFiles().some(f => f.name === 'ekran.asm')).toBe(true);
  });

  it('prevents deleting active project but allows deleting other projects', () => {
    const proj1 = ws.getProject();
    const proj2 = ws.createProject('Silinecek Proje');

    // Trying to delete active proj2 fails
    const failDelete = ws.deleteProject(proj2.id);
    expect(failDelete).toBe(false);

    // Switch to proj1
    ws.openProject(proj1.id);

    // Now deleting proj2 succeeds
    const successDelete = ws.deleteProject(proj2.id);
    expect(successDelete).toBe(true);

    const list = ws.getProjectsList();
    expect(list.some(p => p.id === proj2.id)).toBe(false);
  });
});
