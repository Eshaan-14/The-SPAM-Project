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

const replacements = {
  'bg-white': 'bg-white dark:bg-slate-900',
  'text-slate-900': 'text-slate-900 dark:text-white',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-800',
  'border-slate-200': 'border-slate-200 dark:border-slate-700',
  'text-slate-600': 'text-slate-600 dark:text-slate-300',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
  'border-slate-100': 'border-slate-100 dark:border-slate-800',
  'bg-indigo-50': 'bg-indigo-50 dark:bg-indigo-900/30',
  'bg-emerald-50': 'bg-emerald-50 dark:bg-emerald-900/30',
  'bg-rose-50': 'bg-rose-50 dark:bg-rose-900/30',
  'bg-orange-50': 'bg-orange-50 dark:bg-orange-900/30',
  'bg-amber-50': 'bg-amber-50 dark:bg-amber-900/30',
  'hover:bg-slate-50': 'hover:bg-slate-50 dark:hover:bg-slate-800',
  'hover:bg-slate-100': 'hover:bg-slate-100 dark:hover:bg-slate-700',
  'hover:bg-indigo-100': 'hover:bg-indigo-100 dark:hover:bg-indigo-900/50',
  'hover:bg-emerald-100': 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
  'hover:bg-rose-100': 'hover:bg-rose-100 dark:hover:bg-rose-900/50',
  'hover:bg-orange-100': 'hover:bg-orange-100 dark:hover:bg-orange-900/50',
  'border-indigo-200': 'border-indigo-200 dark:border-indigo-800',
  'border-emerald-200': 'border-emerald-200 dark:border-emerald-800',
  'border-rose-200': 'border-rose-200 dark:border-rose-800',
  'border-orange-200': 'border-orange-200 dark:border-orange-800',
  'border-slate-300': 'border-slate-300 dark:border-slate-600',
  'bg-indigo-100': 'bg-indigo-100 dark:bg-indigo-900/50',
  'bg-emerald-100': 'bg-emerald-100 dark:bg-emerald-900/50',
  'bg-rose-100': 'bg-rose-100 dark:bg-rose-900/50',
  'bg-orange-100': 'bg-orange-100 dark:bg-orange-900/50',
};

const files = walkSync('.');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  for (const [key, value] of Object.entries(replacements)) {
    // Only replace if it doesn't already have dark: right after it
    const regex = new RegExp(`\\b${key}(?!\\s+dark:)`, 'g');
    newContent = newContent.replace(regex, value);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
}
