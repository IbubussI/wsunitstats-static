import { existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';

const localPath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// ws-replay-analyzer: local source (dev server), installed package (build, mode "pulled") or stub
const ANALYZER_LOCAL_DIR = localPath('../../ws-replay-analyzer');
const ANALYZER_LOCAL_ENTRY = localPath('../../ws-replay-analyzer/src/index.ts');
const ANALYZER_PULLED_ENTRY = localPath('./node_modules/ws-replay-analyzer/dist/index.js');
const ANALYZER_STUB = localPath('./src/pages/ReplaysPage/ReplayInfo/replayAnalyzerStub.ts');

const resolveReplayAnalyzer = (useLocal: boolean): { source: string, alias?: string } => {
  if (useLocal && existsSync(ANALYZER_LOCAL_ENTRY)) {
    return { source: `local (${ANALYZER_LOCAL_DIR})`, alias: ANALYZER_LOCAL_ENTRY };
  }
  if (existsSync(ANALYZER_PULLED_ENTRY)) {
    return { source: 'pulled (node_modules)' };
  }
  return { source: 'stub (not installed)', alias: ANALYZER_STUB };
};

export default defineConfig(({ command, mode }) => {
  const analyzer = resolveReplayAnalyzer(command === 'serve' && mode !== 'pulled');
  console.log(`ws-replay-analyzer: ${analyzer.source}`);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        ...(analyzer.alias ? { 'ws-replay-analyzer': analyzer.alias } : {})
      }
    },
    server: {
      port: 3000,
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd()), ANALYZER_LOCAL_DIR]
      }
    },
    build: {
      // same deploy folder as the old UI
      outDir: '../output',
      // output also holds files that are not part of this build, so it is not cleaned
      emptyOutDir: false,
      chunkSizeWarningLimit: 2000
    }
  };
});
