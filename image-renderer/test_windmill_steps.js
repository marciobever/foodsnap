const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env keys
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
    // Try to get service role key or anon key
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        supabaseKey = line.split('=')[1].trim().replace(/['"]/g, '');
    }
}

if (!supabaseKey) {
    for (const line of lines) {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
            supabaseKey = line.split('=')[1].trim().replace(/['"]/g, '');
        }
    }
}

console.log("Supabase URL:", supabaseUrl);
console.log("Using Key length:", supabaseKey ? supabaseKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseKey);

// Same mock data from user WhatsApp request
const foodData = {
  fat: 5,
  carbs: 10,
  fiber: 1,
  score: 3,
  alerts: ["⚠️ Baixa quantidade de vegetais"],
  sodium: 150,
  is_food: true,
  protein: 8,
  calories: 120,
  goal_fit: {
    manter: 3,
    emagrecer: 3,
    ganhar_massa: 2
  },
  food_name: "Restos de macarrão com carne",
  meal_type: "almoço",
  coach_humor: "Isso é um prato ou uma obra de arte abstrata? Vamos melhorar essa apresentação!",
  satiety_index: "baixo",
  cuisine_origin: "indefinida",
  glycemic_index: "médio",
  swap_suggestions: [
    "Adicionar vegetais frescos",
    "Usar macarrão integral"
  ],
  estimated_weight_g: 70,
  energy_duration_minutes: 30
};

const uploadedImageUrl = "https://mnhgpnqkwuqzpvfrwftp.supabase.co/storage/v1/object/public/consultas/91a1667f-2b76-41e8-a688-fc1b4cc6f03d/food_1780609819398.jpeg";
const coach_personality = null;
const user_id = "91a1667f-2b76-41e8-a688-fc1b4cc6f03d";

function buildHtmlTemplate(payload, coach_personality) {
    const food_name = payload.food_name || 'Prato Identificado';
    const calories = Math.round(payload.calories || 0);
    const protein = Math.round(payload.protein || 0);
    const carbs = Math.round(payload.carbs || 0);
    const fat = Math.round(payload.fat || 0);
    const fiber = Math.round(payload.fiber || 0);
    const sodium = Math.round(payload.sodium || 0);
    const score = payload.score || 0;
    const meal_type = payload.meal_type || '';
    const cuisine_origin = payload.cuisine_origin || '';
    const estimated_weight_g = payload.estimated_weight_g || 0;
    const satiety_index = payload.satiety_index || 'médio';
    const glycemic_index = payload.glycemic_index || 'médio';
    const energy_duration_minutes = payload.energy_duration_minutes || 0;
    const goal_fit = payload.goal_fit || { emagrecer: 0, ganhar_massa: 0, manter: 0 };
    const alerts = payload.alerts || [];
    const swap_suggestions = payload.swap_suggestions || [];
    const coach_humor = payload.coach_humor || '';
    const image_url = payload.image_url || null;

    let scoreClass = 'score-yellow';
    if (score >= 8) {
        scoreClass = 'score-green';
    } else if (score <= 4) {
        scoreClass = 'score-red';
    }

    let coachName = 'Chef Gordon';
    const coachPers = (coach_personality || "gordon_ramsay").toLowerCase();
    if (coachPers.includes('vovo') || coachPers.includes('grandma') || coachPers.includes('carinhosa')) {
        coachName = 'Vovó Carinhosa';
    } else if (coachPers.includes('cientifico') || coachPers.includes('science') || coachPers.includes('dr')) {
        coachName = 'Dr. Científico Frio';
    } else if (coachPers.includes('militar') || coachPers.includes('military') || coachPers.includes('sargento')) {
        coachName = 'Sargento Militar';
    } else {
        coachName = 'Chef Gordon (Cheff Titã)';
    }

    const fireIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const proteinIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1M6 8H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1M2 11h2M20 11h2M6 12h12M12 4v16" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const carbIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const fatIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const zapIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const warningIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const swapIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const coachIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
            
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            body {
                background: transparent;
                font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                color: #0f172a;
                -webkit-font-smoothing: antialiased;
            }
            
            .capture-wrapper {
                width: 740px;
                padding: 20px;
                background: transparent;
            }
            
            .card {
                background: #ffffff;
                border-radius: 24px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 8px 16px -6px rgba(15, 23, 42, 0.04);
                overflow: hidden;
                padding: 32px;
            }
            
            /* Header */
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                padding-bottom: 20px;
                border-bottom: 1px solid #f1f5f9;
            }
            
            .brand {
                font-size: 26px;
                font-weight: 800;
                letter-spacing: -0.03em;
                color: #0f172a;
                display: flex;
                align-items: center;
            }
            
            .brand-dot {
                color: #10b981;
            }
            
            .score-badge {
                font-size: 13px;
                font-weight: 700;
                padding: 6px 16px;
                border-radius: 9999px;
                border-width: 1px;
                border-style: solid;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .score-green {
                background-color: #ecfdf5;
                color: #047857;
                border-color: #a7f3d0;
            }
            
            .score-yellow {
                background-color: #fef3c7;
                color: #b45309;
                border-color: #fde68a;
            }
            
            .score-red {
                background-color: #fef2f2;
                color: #b91c1c;
                border-color: #fecaca;
            }
            
            .score-badge-val {
                font-size: 16px;
                font-weight: 800;
            }
            
            /* Food Profile */
            .food-profile {
                display: flex;
                gap: 20px;
                margin-bottom: 24px;
                align-items: center;
            }
            
            .food-img {
                width: 100px;
                height: 100px;
                border-radius: 16px;
                object-fit: cover;
                border: 1px solid #e2e8f0;
                background-color: #f8fafc;
            }
            
            .food-info {
                flex: 1;
            }
            
            .food-title {
                font-size: 22px;
                font-weight: 800;
                color: #0f172a;
                letter-spacing: -0.02em;
                margin-bottom: 8px;
                line-height: 1.25;
            }
            
            .food-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .meta-badge {
                font-size: 10px;
                font-weight: 700;
                background-color: #f8fafc;
                color: #475569;
                border: 1px solid #e2e8f0;
                padding: 4px 10px;
                border-radius: 6px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            /* Macros Grid */
            .macros-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .macro-box {
                border-radius: 16px;
                padding: 16px 8px;
                text-align: center;
                border-width: 1px;
                border-style: solid;
            }
            
            .macro-box.cal {
                background-color: #fef2f2;
                border-color: #fee2e2;
            }
            .macro-box.prot {
                background-color: #eff6ff;
                border-color: #dbeafe;
            }
            .macro-box.carb {
                background-color: #f5f3ff;
                border-color: #e0e7ff;
            }
            .macro-box.fat {
                background-color: #fffbeb;
                border-color: #fef3c7;
            }
            
            .macro-icon {
                display: flex;
                justify-content: center;
                margin-bottom: 6px;
            }
            
            .macro-icon svg {
                width: 20px;
                height: 20px;
            }
            
            .font-red { color: #ef4444; }
            .font-blue { color: #2563eb; }
            .font-purple { color: #7c3aed; }
            .font-amber { color: #d97706; }
            
            .macro-num {
                font-size: 20px;
                font-weight: 800;
                margin-bottom: 2px;
                letter-spacing: -0.02em;
            }
            
            .macro-lbl {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #64748b;
            }
            
            /* Micros Row */
            .micros-row {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid #f1f5f9;
            }
            
            .micro-pill {
                font-size: 11px;
                background-color: #f8fafc;
                border: 1px solid #f1f5f9;
                padding: 6px 12px;
                border-radius: 8px;
                display: flex;
                gap: 4px;
                align-items: center;
            }
            
            .micro-label {
                color: #64748b;
                font-weight: 600;
            }
            
            .micro-value {
                color: #0f172a;
                font-weight: 700;
            }
            
            .text-capitalize {
                text-transform: capitalize;
            }
            
            /* Details Grid */
            .details-grid {
                display: grid;
                grid-template-columns: 1.2fr 0.8fr;
                gap: 20px;
                margin-bottom: 24px;
            }
            
            .details-col {
                background-color: #f8fafc;
                border: 1px solid #f1f5f9;
                border-radius: 16px;
                padding: 16px;
            }
            
            .section-title {
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                color: #64748b;
                letter-spacing: 0.08em;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            /* Goal Bars */
            .goal-bars {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .goal-item {
                font-size: 12px;
            }
            
            .goal-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
            }
            
            .goal-name {
                color: #475569;
                font-weight: 600;
            }
            
            .goal-score {
                font-weight: 700;
                color: #0f172a;
            }
            
            .goal-progress-bg {
                height: 6px;
                background-color: #e2e8f0;
                border-radius: 9999px;
                overflow: hidden;
            }
            
            .goal-progress-bar {
                height: 100%;
                border-radius: 9999px;
            }
            
            .bg-emerald { background-color: #10b981; }
            .bg-indigo { background-color: #6366f1; }
            .bg-amber { background-color: #f59e0b; }
            
            /* Energy Box */
            .energy-box {
                display: flex;
                gap: 12px;
                align-items: center;
                height: calc(100% - 24px);
                padding: 4px;
            }
            
            .energy-icon-wrapper {
                background-color: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 12px;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #d97706;
                flex-shrink: 0;
            }
            
            .energy-icon-wrapper svg {
                width: 20px;
                height: 20px;
            }
            
            .energy-content {
                flex: 1;
            }
            
            .energy-title {
                font-size: 15px;
                font-weight: 800;
                color: #d97706;
                margin-bottom: 2px;
            }
            
            .energy-subtitle {
                font-size: 10px;
                color: #64748b;
                line-height: 1.35;
            }
            
            /* Alerts & Swaps */
            .alerts-swaps-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .alert-box, .swap-box {
                border-radius: 16px;
                padding: 16px;
                border-width: 1px;
                border-style: solid;
            }
            
            .alert-box {
                background-color: #fef2f2;
                border-color: #fecaca;
            }
            
            .swap-box {
                background-color: #f0fdf4;
                border-color: #dcfce7;
            }
            
            .alert-title-box, .swap-title-box {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                font-weight: 700;
                margin-bottom: 8px;
            }
            
            .alert-title-box svg, .swap-title-box svg {
                width: 14px;
                height: 14px;
            }
            
            .alert-title-box { color: #b91c1c; }
            .swap-title-box { color: #15803d; }
            
            .alert-list, .swap-list {
                list-style: none;
                font-size: 11px;
                line-height: 1.5;
            }
            
            .alert-list li {
                position: relative;
                padding-left: 14px;
                color: #991b1b;
                margin-bottom: 4px;
            }
            
            .alert-list li::before {
                content: "•";
                position: absolute;
                left: 4px;
                color: #ef4444;
            }
            
            .swap-list li {
                position: relative;
                padding-left: 14px;
                color: #14532d;
                margin-bottom: 4px;
            }
            
            .swap-list li::before {
                content: "•";
                position: absolute;
                left: 4px;
                color: #16a34a;
            }
            
            /* Coach Container */
            .coach-container {
                background-color: #0f172a;
                border-radius: 16px;
                padding: 20px;
                color: #ffffff;
            }
            
            .coach-header {
                display: flex;
                gap: 12px;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .coach-avatar {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                background-color: #1e293b;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #10b981;
                flex-shrink: 0;
            }
            
            .coach-avatar svg {
                width: 20px;
                height: 20px;
            }
            
            .coach-meta {
                flex: 1;
            }
            
            .coach-title {
                font-size: 9px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #94a3b8;
            }
            
            .coach-name {
                font-size: 13px;
                font-weight: 700;
                color: #ffffff;
            }
            
            .coach-bubble {
                font-size: 12px;
                font-style: italic;
                line-height: 1.5;
                color: #cbd5e1;
                padding: 12px;
                background-color: #1e293b;
                border-radius: 8px;
                border-left: 3px solid #10b981;
            }
        </style>
    </head>
    <body>
        <div class="capture-wrapper" id="capture">
            <div class="card">
                <div class="header">
                    <div class="brand">
                        <span>FoodSnap</span><span class="brand-dot">.ai</span>
                    </div>
                    <div class="score-badge ${scoreClass}">
                        Nota Nutricional: <span class="score-badge-val">${score}</span>/10
                    </div>
                </div>
                
                <div class="food-profile">
                    ${image_url ? `<img src="${image_url}" class="food-img" alt="${food_name}" />` : ''}
                    <div class="food-info">
                        <h2 class="food-title">${food_name}</h2>
                        <div class="food-meta">
                            <span class="meta-badge">${estimated_weight_g}g</span>
                            ${meal_type ? `<span class="meta-badge">${meal_type}</span>` : ''}
                            ${cuisine_origin ? `<span class="meta-badge">${cuisine_origin}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="macros-grid">
                    <div class="macro-box cal">
                        <div class="macro-icon font-red">${fireIcon}</div>
                        <div class="macro-num font-red">${calories}</div>
                        <div class="macro-lbl">Kcal</div>
                    </div>
                    <div class="macro-box prot">
                        <div class="macro-icon font-blue">${proteinIcon}</div>
                        <div class="macro-num font-blue">${protein}g</div>
                        <div class="macro-lbl">Proteínas</div>
                    </div>
                    <div class="macro-box carb">
                        <div class="macro-icon font-purple">${carbIcon}</div>
                        <div class="macro-num font-purple">${carbs}g</div>
                        <div class="macro-lbl">Carboidratos</div>
                    </div>
                    <div class="macro-box fat">
                        <div class="macro-icon font-amber">${fatIcon}</div>
                        <div class="macro-num font-amber">${fat}g</div>
                        <div class="macro-lbl">Gorduras</div>
                    </div>
                </div>
                
                <div class="micros-row">
                    <div class="micro-pill">
                        <span class="micro-label">Fibras:</span>
                        <span class="micro-value">${fiber}g</span>
                    </div>
                    <div class="micro-pill">
                        <span class="micro-label">Sódio:</span>
                        <span class="micro-value">${sodium}mg</span>
                    </div>
                    <div class="micro-pill">
                        <span class="micro-label">IG:</span>
                        <span class="micro-value text-capitalize">${glycemic_index}</span>
                    </div>
                    <div class="micro-pill">
                        <span class="micro-label">Saciedade:</span>
                        <span class="micro-value text-capitalize">${satiety_index}</span>
                    </div>
                </div>
                
                <div class="details-grid">
                    <div class="details-col">
                        <div class="section-title">Adequação por Objetivo</div>
                        <div class="goal-bars">
                            <div class="goal-item">
                                <div class="goal-header">
                                    <span class="goal-name">Emagrecimento</span>
                                    <span class="goal-score">${goal_fit.emagrecer || 0}/10</span>
                                </div>
                                <div class="goal-progress-bg">
                                    <div class="goal-progress-bar bg-emerald" style="width: ${(goal_fit.emagrecer || 0) * 10}%"></div>
                                </div>
                            </div>
                            <div class="goal-item">
                                <div class="goal-header">
                                    <span class="goal-name">Ganho de Massa</span>
                                    <span class="goal-score">${goal_fit.ganhar_massa || 0}/10</span>
                                </div>
                                <div class="goal-progress-bg">
                                    <div class="goal-progress-bar bg-indigo" style="width: ${(goal_fit.ganhar_massa || 0) * 10}%"></div>
                                </div>
                            </div>
                            <div class="goal-item">
                                <div class="goal-header">
                                    <span class="goal-name">Manutenção</span>
                                    <span class="goal-score">${goal_fit.manter || 0}/10</span>
                                </div>
                                <div class="goal-progress-bg">
                                    <div class="goal-progress-bar bg-amber" style="width: ${(goal_fit.manter || 0) * 10}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="details-col">
                        <div class="section-title">Energia Estimada</div>
                        <div class="energy-box">
                            <div class="energy-icon-wrapper">
                                ${zapIcon}
                            </div>
                            <div class="energy-content">
                                <div class="energy-title">~${energy_duration_minutes} min</div>
                                <div class="energy-subtitle">Duração da liberação da energia.</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${(alerts && alerts.length > 0) || (swap_suggestions && swap_suggestions.length > 0) ? `
                <div class="alerts-swaps-row">
                    ${alerts && alerts.length > 0 ? `
                    <div class="alert-box">
                        <div class="alert-title-box">
                            ${warningIcon}
                            <span class="alert-text-title">Alertas do Prato</span>
                        </div>
                        <ul class="alert-list">
                            ${alerts.map(a => `<li>${a.replace(/^[⚠️\\s▪️\\-\\*]+/, '')}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${swap_suggestions && swap_suggestions.length > 0 ? `
                    <div class="swap-box">
                        <div class="swap-title-box">
                            ${swapIcon}
                            <span class="swap-text-title">Substituições Recomendadas</span>
                        </div>
                        <ul class="swap-list">
                            ${swap_suggestions.map(s => `<li>${s.replace(/^[🔄\\s▪️\\-\\*]+/, '')}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                ${coach_humor ? `
                <div class="coach-container">
                    <div class="coach-header">
                        <div class="coach-avatar">
                            ${coachIcon}
                        </div>
                        <div class="coach-meta">
                            <div class="coach-title">Nutricionista & Coach IA</div>
                            <div class="coach-name">${coachName}</div>
                        </div>
                    </div>
                    <div class="coach-bubble">
                        "${coach_humor}"
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    </body>
    </html>
    `;
}

function estimateCardHeight(foodData) {
    let height = 550; // Base layout height (Header, title, image, macros grid, glycemic row, goal bars column)

    const alertsCount = foodData.alerts?.length || 0;
    const swapsCount = foodData.swap_suggestions?.length || 0;

    if (alertsCount > 0 || swapsCount > 0) {
        // Height for the side-by-side alerts & swaps box
        const maxItems = Math.max(alertsCount, swapsCount);
        height += 50 + (maxItems * 22); // Header padding + item list heights
    }

    if (foodData.coach_humor) {
        // Base coach box layout (avatar, title, paddings)
        height += 90;
        // Estimate lines of coach humor text (approx 65 characters per line inside container)
        const charCount = foodData.coach_humor.length;
        const estimatedLines = Math.ceil(charCount / 65);
        height += estimatedLines * 18;
    }

    // Add extra padding safety margin
    height += 30;

    return Math.max(500, Math.min(1500, Math.round(height)));
}

async function runRender() {
    try {
        console.log("Generating HTML...");
        const html = buildHtmlTemplate({ ...foodData, image_url: uploadedImageUrl }, coach_personality);
        const estimatedHeight = estimateCardHeight(foodData);
        console.log("Estimated Card Height:", estimatedHeight);
        
        console.log("Posting to https://puppeteer.foodsnap.com.br/api/render ...");
        const renderRes = await fetch("https://puppeteer.foodsnap.com.br/api/render", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                html: html,
                width: 740,
                height: estimatedHeight
            })
        });
        
        console.log("Render response status:", renderRes.status);
        if (!renderRes.ok) {
            console.error("Render failed:", await renderRes.text());
            return;
        }
        
        const cardArrayBuffer = await renderRes.arrayBuffer();
        const cardBuffer = Buffer.from(cardArrayBuffer);
        
        console.log("Buffer size:", cardBuffer.length);
        
        const cardFileName = `card_${Date.now()}.png`;
        const cardStoragePath = `${user_id}/${cardFileName}`;
        
        console.log("Uploading to Supabase Storage: consultas/" + cardStoragePath);
        const { data, error } = await supabase.storage
            .from('consultas')
            .upload(cardStoragePath, cardBuffer, {
                contentType: 'image/png',
                upsert: true
            });
            
        if (error) {
            console.error("Supabase Upload Error:", error);
            return;
        }
        
        console.log("Upload success:", data);
        
        const { data: cardUrlData } = supabase.storage
            .from('consultas')
            .getPublicUrl(cardStoragePath);
            
        console.log("Public URL:", cardUrlData.publicUrl);
    } catch (e) {
        console.error("Execution Exception:", e);
    }
}

runRender();
