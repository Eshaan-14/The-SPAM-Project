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
    .replace(/bg-indigo-600 text-slate-900 dark:text-white/g, 'bg-indigo-600 text-white')
    .replace(/bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white/g, 'bg-indigo-600 hover:bg-indigo-700 text-white')
    .replace(/bg-indigo-600 flex items-center justify-center text-slate-900 dark:text-white/g, 'bg-indigo-600 flex items-center justify-center text-white')
    .replace(/bg-indigo-600 hover:bg-indigo-50 dark:bg-indigo-900\/300 text-slate-900 dark:text-white/g, 'bg-indigo-600 hover:bg-indigo-700 text-white')
    .replace(/hover:bg-indigo-600 hover:text-slate-900 dark:text-white/g, 'hover:bg-indigo-600 hover:text-white');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
}
