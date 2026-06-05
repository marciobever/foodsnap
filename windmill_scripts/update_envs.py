import os, glob, re

dir_path = 'e:/Projetos/foodsnap/windmill_scripts'
for filepath in glob.glob(os.path.join(dir_path, '*.ts')):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import * as wmill from' not in content:
        content = 'import * as wmill from "windmill-client";\n' + content
        
    def replacer(match):
        var_name = match.group(1)
        return f'await wmill.getVariable("u/bevervansomarcio/{var_name}")'

    content = re.sub(r'process\.env\.([A-Z0-9_]+)', replacer, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated env variables in', os.path.basename(filepath))
