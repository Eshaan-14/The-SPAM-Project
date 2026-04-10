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
    .replace(/Mission/g, 'Task')
    .replace(/mission/g, 'task')
    .replace(/MISSIONS/g, 'TASKS')
    .replace(/Missions/g, 'Tasks')
    .replace(/missions/g, 'tasks');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
}
