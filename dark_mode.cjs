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
    .replace(/bg-white/g, 'bg-slate-900')
    .replace(/text-slate-900/g, 'text-white')
    .replace(/bg-slate-50/g, 'bg-slate-800')
    .replace(/border-slate-200/g, 'border-slate-700')
    .replace(/text-slate-600/g, 'text-slate-300')
    .replace(/text-slate-500/g, 'text-slate-400')
    .replace(/bg-slate-100/g, 'bg-slate-800')
    .replace(/border-slate-100/g, 'border-slate-800')
    .replace(/bg-indigo-50/g, 'bg-indigo-900/30')
    .replace(/bg-emerald-50/g, 'bg-emerald-900/30')
    .replace(/bg-rose-50/g, 'bg-rose-900/30')
    .replace(/bg-orange-50/g, 'bg-orange-900/30')
    .replace(/bg-amber-50/g, 'bg-amber-900/30')
    .replace(/hover:bg-slate-50/g, 'hover:bg-slate-800')
    .replace(/hover:bg-slate-100/g, 'hover:bg-slate-700')
    .replace(/hover:bg-indigo-100/g, 'hover:bg-indigo-900/50')
    .replace(/hover:bg-emerald-100/g, 'hover:bg-emerald-900/50')
    .replace(/hover:bg-rose-100/g, 'hover:bg-rose-900/50')
    .replace(/hover:bg-orange-100/g, 'hover:bg-orange-900/50')
    .replace(/border-indigo-200/g, 'border-indigo-800')
    .replace(/border-emerald-200/g, 'border-emerald-800')
    .replace(/border-rose-200/g, 'border-rose-800')
    .replace(/border-orange-200/g, 'border-orange-800')
    .replace(/border-slate-300/g, 'border-slate-600')
    .replace(/bg-indigo-100/g, 'bg-indigo-900/50')
    .replace(/bg-emerald-100/g, 'bg-emerald-900/50')
    .replace(/bg-rose-100/g, 'bg-rose-900/50')
    .replace(/bg-orange-100/g, 'bg-orange-900/50')
    .replace(/text-slate-400/g, 'text-slate-500') // Actually, slate-400 to slate-500 might be too dark. Let's keep slate-400 as slate-400.
    ;
    
  // Fix double replacements
  newContent = newContent.replace(/text-slate-4000/g, 'text-slate-400');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
}
