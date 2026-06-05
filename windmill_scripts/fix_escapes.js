const fs = require('fs');
const path = require('path');

const dir = 'e:/Projetos/foodsnap/windmill_scripts';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(f => {
  const file = path.join(dir, f);
  let content = fs.readFileSync(file, 'utf8');

  // Fix escaped backticks \` -> `
  content = content.replace(/\\\\`/g, '`');
  
  // Fix escaped dollar signs \$ -> $
  content = content.replace(/\\\\\\$/g, '$');
  
  // Fix escaped newlines \\n -> \n
  content = content.replace(/\\\\n/g, '\\n');

  fs.writeFileSync(file, content);
  console.log('Fixed', f);
});
