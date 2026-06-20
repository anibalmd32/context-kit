import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates');

/**
 * Instala la estructura .ai/ de context-kit en el directorio destino.
 *
 * @param {object} [opts]
 * @param {string}  [opts.cwd]  - Directorio raíz donde instalar (default: process.cwd())
 * @param {string[]} [opts.args] - Argumentos CLI (soporta '--force')
 * @param {(code: number) => void} [opts.exit] - Función de salida (default: process.exit)
 */
export function install({ cwd = process.cwd(), args = process.argv.slice(2), exit = process.exit.bind(process) } = {}) {
  const target = path.join(cwd, '.ai');
  const force = args.includes('--force');

  // 1. Verificar existencia
  if (fs.existsSync(target)) {
    if (!force) {
      console.error('❌ La carpeta ".ai/" ya existe en este proyecto.');
      console.error('💡 Usa --force para sobrescribirla (pierdes los cambios locales no trackeados).');
      exit(1);
      return;
    }
    // Si force, borrar primero
    fs.rmSync(target, { recursive: true, force: true });
    console.log('⚠️  Carpeta .ai/ antigua eliminada.');
  }

  // 2. Copiar la plantilla completa
  fs.cpSync(TEMPLATE_PATH, target, { recursive: true });

  console.log('✅ Estructura .ai/ creada exitosamente en la raíz del proyecto.');
  console.log('📂 Carpetas generadas:');
  console.log('   - context/ (business, data, technical)');
  console.log('   - state/ (backlog, active_session, decisions)');
  console.log('   - templates/ (para ADRs y nuevas features)');
  console.log('🚀 ¡Listo para abrir Obsidian y empezar a documentar!');
}
