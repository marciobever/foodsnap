const { createClient } = require('@supabase/supabase-js');

// We can read variables from local files or environment. Let's see if we can read them from e:/Projetos/foodsnap/.env or similar, or just read the supabase URL and service key from the windmill file!
// Let's open 3_Process_Food_AI.ts to check if we can get the keys? No, they are retrieved from wmill.getVariable which is runtime-only.
// Let's see if we can find the dotenv file in the workspace root.
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        let envContent = '';
        if (fs.existsSync('e:/Projetos/foodsnap/.env')) {
            envContent = fs.readFileSync('e:/Projetos/foodsnap/.env', 'utf8');
        } else if (fs.existsSync('e:/Projetos/foodsnap/.env.local')) {
            envContent = fs.readFileSync('e:/Projetos/foodsnap/.env.local', 'utf8');
        }
        
        const lines = envContent.split('\n');
        let supabaseUrl = '';
        let supabaseKey = '';
        
        for (const line of lines) {
            if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
                supabaseUrl = line.split('=')[1].trim().replace(/['"]/g, '');
            }
            if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
                supabaseKey = line.split('=')[1].trim().replace(/['"]/g, '');
            }
            // also look for service role key if available
            if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
                supabaseKey = line.split('=')[1].trim().replace(/['"]/g, '');
            }
        }
        
        console.log("Supabase URL:", supabaseUrl);
        
        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing keys in .env. Checking windmill variables...");
            // Let's check master_reset.sql or other configs
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase
            .from('food_analyses')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);
            
        if (error) throw error;
        
        console.log("Latest food analysis:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error reading DB:", e);
    }
}

main();
