import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates');

// ---- Helpers ----

/** Creates a unique temp directory and returns its path */
function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'context-kit-test-'));
}

/** Lists all relative file/dir paths (files and empty dirs) inside a directory recursively */
function listAllPaths(dir) {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(dir, full);
    result.push(rel);
    if (entry.isDirectory()) {
      const children = listAllPaths(full);
      for (const child of children) {
        result.push(path.join(rel, child));
      }
    }
  }
  return result.sort();
}

// ---- Tests ----

describe('install', () => {
  let install;
  let tempDir;

  beforeEach(async () => {
    // Re-import to get a fresh module reference each test
    const module = await import('../lib/install.js');
    install = module.install;
    tempDir = createTempDir();
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('happy path: creates .ai/ structure', () => {
    it('should create .ai/ directory at the target cwd', () => {
      install({ cwd: tempDir, args: [], exit: () => {} });

      const aiPath = path.join(tempDir, '.ai');
      expect(fs.existsSync(aiPath)).toBe(true);
    });

    it('should copy all template files and folders to .ai/', () => {
      install({ cwd: tempDir, args: [], exit: () => {} });

      const templatePaths = listAllPaths(TEMPLATE_PATH);
      const targetPaths = listAllPaths(path.join(tempDir, '.ai'));

      expect(targetPaths).toEqual(templatePaths);
    });

    it('should create expected subdirectories and files', () => {
      install({ cwd: tempDir, args: [], exit: () => {} });

      const aiPath = path.join(tempDir, '.ai');
      expect(fs.existsSync(path.join(aiPath, '00_CONSTITUTION.md'))).toBe(true);
      expect(fs.existsSync(path.join(aiPath, 'manifest.json'))).toBe(true);

      // directories
      for (const sub of [
        'context',
        'context/business',
        'context/data',
        'context/technical',
        'requirements',
        'requirements/active',
        'requirements/backlog',
        'state',
        'state/decisions',
        'templates',
      ]) {
        expect(fs.existsSync(path.join(aiPath, sub)), `missing dir: ${sub}`).toBe(true);
      }

      // files
      for (const f of [
        'state/active_session.md',
        'state/backlog.md',
        'templates/adr_template.md',
        'templates/new_feature_template.md',
      ]) {
        expect(fs.existsSync(path.join(aiPath, f)), `missing file: ${f}`).toBe(true);
      }
    });

    it('should print success message with expected structure', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      install({ cwd: tempDir, args: [], exit: () => {} });

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('✅ Estructura .ai/ creada exitosamente');
      expect(output).toContain('context/ (business, data, technical)');
      expect(output).toContain('state/ (backlog, active_session, decisions)');
      expect(output).toContain('templates/ (para ADRs y nuevas features)');
      expect(output).toContain('🚀 ¡Listo para abrir Obsidian y empezar a documentar!');

      consoleSpy.mockRestore();
    });
  });

  describe('when .ai/ already exists', () => {
    it('should fail with error message and exit(1) when no --force', () => {
      // Pre-create .ai/ directory
      const aiPath = path.join(tempDir, '.ai');
      fs.mkdirSync(aiPath);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      let exitCode = null;
      const exit = (code) => { exitCode = code; };

      install({ cwd: tempDir, args: [], exit });

      expect(exitCode).toBe(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ La carpeta ".ai/" ya existe en este proyecto.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('💡 Usa --force para sobrescribirla (pierdes los cambios locales no trackeados).');

      consoleErrorSpy.mockRestore();
    });

    it('should not overwrite existing .ai/ without --force', () => {
      const aiPath = path.join(tempDir, '.ai');
      fs.mkdirSync(aiPath);
      fs.writeFileSync(path.join(aiPath, 'custom.txt'), 'keep me');

      install({ cwd: tempDir, args: [], exit: () => {} });

      // Custom file should still be there
      expect(fs.existsSync(path.join(aiPath, 'custom.txt'))).toBe(true);
      // But no templates should have been copied
      expect(fs.existsSync(path.join(aiPath, '00_CONSTITUTION.md'))).toBe(false);
    });

    it('should overwrite with --force flag', () => {
      const aiPath = path.join(tempDir, '.ai');
      fs.mkdirSync(aiPath);
      fs.writeFileSync(path.join(aiPath, 'custom.txt'), 'old stuff');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      install({ cwd: tempDir, args: ['--force'], exit: () => {} });

      // Old custom file should be gone
      expect(fs.existsSync(path.join(aiPath, 'custom.txt'))).toBe(false);
      // Templates should be present
      expect(fs.existsSync(path.join(aiPath, '00_CONSTITUTION.md'))).toBe(true);
      expect(fs.existsSync(path.join(aiPath, 'manifest.json'))).toBe(true);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('⚠️  Carpeta .ai/ antigua eliminada.');
      expect(output).toContain('✅ Estructura .ai/ creada exitosamente');

      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should work on a fresh project (no .ai/ yet)', () => {
      let exitCalled = false;
      const exit = () => { exitCalled = true; };

      install({ cwd: tempDir, args: [], exit });

      expect(exitCalled).toBe(false);
      expect(fs.existsSync(path.join(tempDir, '.ai'))).toBe(true);
    });

    it('should only create .ai/ (no side effects elsewhere)', () => {
      const before = fs.readdirSync(tempDir);

      install({ cwd: tempDir, args: [], exit: () => {} });

      const after = fs.readdirSync(tempDir);
      expect(after.filter(f => !before.includes(f))).toEqual(['.ai']);
    });
  });
});
