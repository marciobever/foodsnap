const fs = require('fs');
const path = require('path');

const dir = 'e:/Projetos/foodsnap/windmill_scripts';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(f => {
  const file = path.join(dir, f);
  let content = fs.readFileSync(file, 'utf8');

  // Remove escape de crase (\`)
  content = content.split('\\\\`').join('`');
  
  // Remove escape de cifrão (\$)
  content = content.split('\\\\$').join('$');
  
  // Remove escape de newlines(\\n)
  content = content.split('\\\\n').join('\\n');

  fs.writeFileSync(file, content);
  console.log('Fixed', f);
});
