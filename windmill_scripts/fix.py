import os

dir_path = 'e:/Projetos/foodsnap/windmill_scripts'
for filename in os.listdir(dir_path):
    if filename.endswith('.ts'):
        filepath = os.path.join(dir_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # fix backticks
        content = content.replace(r"\`", "`")
        # fix dollars
        content = content.replace(r"\$", "$")
        # fix newlines (convert literal backslash-n to actual \n in string if needed, 
        # or leave as is if we just wanted \n instead of \\n)
        content = content.replace(r"\\n", r"\n")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed", filename)
