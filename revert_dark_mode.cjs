const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (dirFile.endsWith('.ts') || dirFile.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const files = walkSync('.');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/bg-slate-900/g, 'bg-white')
    .replace(/text-white/g, 'text-slate-900')
    .replace(/bg-slate-800/g, 'bg-slate-50')
    .replace(/border-slate-700/g, 'border-slate-200')
    .replace(/text-slate-300/g, 'text-slate-600')
    .replace(/text-slate-400/g, 'text-slate-500')
    .replace(/bg-slate-800/g, 'bg-slate-100')
    .replace(/border-slate-800/g, 'border-slate-100')
    .replace(/bg-indigo-900\/30/g, 'bg-indigo-50')
    .replace(/bg-emerald-900\/30/g, 'bg-emerald-50')
    .replace(/bg-rose-900\/30/g, 'bg-rose-50')
    .replace(/bg-orange-900\/30/g, 'bg-orange-50')
    .replace(/bg-amber-900\/30/g, 'bg-amber-50')
    .replace(/hover:bg-slate-800/g, 'hover:bg-slate-50')
    .replace(/hover:bg-slate-700/g, 'hover:bg-slate-100')
    .replace(/hover:bg-indigo-900\/50/g, 'hover:bg-indigo-100')
    .replace(/hover:bg-emerald-900\/50/g, 'hover:bg-emerald-100')
    .replace(/hover:bg-rose-900\/50/g, 'hover:bg-rose-100')
    .replace(/hover:bg-orange-900\/50/g, 'hover:bg-orange-100')
    .replace(/border-indigo-800/g, 'border-indigo-200')
    .replace(/border-emerald-800/g, 'border-emerald-200')
    .replace(/border-rose-800/g, 'border-rose-200')
    .replace(/border-orange-800/g, 'border-orange-200')
    .replace(/border-slate-600/g, 'border-slate-300')
    .replace(/bg-indigo-900\/50/g, 'bg-indigo-100')
    .replace(/bg-emerald-900\/50/g, 'bg-emerald-100')
    .replace(/bg-rose-900\/50/g, 'bg-rose-100')
    .replace(/bg-orange-900\/50/g, 'bg-orange-100')
    .replace(/text-slate-500/g, 'text-slate-400');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Reverted ${file}`);
  }
}
