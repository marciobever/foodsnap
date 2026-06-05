const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_, res) => res.status(200).json({ ok: true }));

app.post('/api/render', async (req, res) => {
    try {
        const payload = req.body.data || req.body;
        if (!payload) {
            return res.status(400).json({ error: 'Missing analysis data' });
        }

        // Extract parameters with robust defaults matching OpenAI and DB models
        const food_name = payload.food_name || payload.name || 'Prato Identificado';
        const calories = Math.round(payload.calories || payload.total_calories || 0);
        const protein = Math.round(payload.protein || payload.total_protein || 0);
        const carbs = Math.round(payload.carbs || payload.total_carbs || 0);
        const fat = Math.round(payload.fat || payload.total_fat || 0);
        const fiber = Math.round(payload.fiber || payload.total_fiber || 0);
        const sodium = Math.round(payload.sodium || payload.total_sodium_mg || 0);
        const score = payload.score || payload.nutrition_score || 0;
        const meal_type = payload.meal_type || '';
        const cuisine_origin = payload.cuisine_origin || '';
        const estimated_weight_g = payload.estimated_weight_g || 0;
        const satiety_index = payload.satiety_index || 'médio';
        const glycemic_index = payload.glycemic_index || 'médio';
        const energy_duration_minutes = payload.energy_duration_minutes || 0;
        const goal_fit = payload.goal_fit || { emagrecer: 0, ganhar_massa: 0, manter: 0 };
        const alerts = payload.alerts || [];
        const swap_suggestions = payload.swap_suggestions || [];
        const coach_humor = payload.coach_humor || payload.ai_raw_response || '';
        const image_url = payload.image_url || payload.img || null;
        const coach_personality = payload.coach_personality || 'gordon_ramsay';

        // Score display style
        let scoreClass = 'score-yellow';
        if (score >= 8) {
            scoreClass = 'score-green';
        } else if (score <= 4) {
            scoreClass = 'score-red';
        }

        // Coach Display Name & Emoji Mapping
        let coachName = 'Chef Gordon';
        let coachEmoji = '👨‍🍳';
        const coachPers = coach_personality.toLowerCase();
        if (coachPers.includes('vovo') || coachPers.includes('grandma') || coachPers.includes('carinhosa')) {
            coachName = 'Vovó Carinhosa';
            coachEmoji = '👵';
        } else if (coachPers.includes('cientifico') || coachPers.includes('science') || coachPers.includes('dr')) {
            coachName = 'Dr. Científico Frio';
            coachEmoji = '🔬';
        } else if (coachPers.includes('militar') || coachPers.includes('military') || coachPers.includes('sargento')) {
            coachName = 'Sargento Militar';
            coachEmoji = '🪖';
        } else {
            coachName = 'Chef Gordon (Cheff Titã)';
            coachEmoji = '👨‍🍳';
        }

        // SVGs for high fidelity rendering
        const fireIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const proteinIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1M6 8H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1M2 11h2M20 11h2M6 12h12M12 4v16" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const carbIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const fatIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const zapIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const fiberIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 2 2 7.7a7 7 0 0 1-10 10.3z" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 21c0-4.5 3.5-8 8-8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const sodiumIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3v18M4 7.5l16 9M20 7.5l-16 9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const satietyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 .5 3.1 1 1 0 0 0 1.4.3h0a1 1 0 0 0 .3-1.4A8 8 0 1 1 20.8 14a1 1 0 0 0 .3 1.4h0a1 1 0 0 0 1.4-.3A10 10 0 0 0 12 2z" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 13l4-4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="13" r="1.5"/></svg>`;
        const warningIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const swapIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const coachIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        // Build HTML template with website design aesthetics
        const html = `
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
                    background: #f8fafc;
                    font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    color: #0f172a;
                    -webkit-font-smoothing: antialiased;
                }
                
                .capture-wrapper {
                    width: 720px;
                    height: 1280px;
                    padding: 32px 32px 24px 32px;
                    background: #f8fafc;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    overflow: hidden;
                }
                
                .brand-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .brand {
                    font-size: 28px;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                }
                
                .brand-dot {
                    color: #10b981;
                }
                
                .brand-subtitle {
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 6px 14px;
                    border-radius: 10px;
                    border-width: 1px;
                    border-style: solid;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .brand-subtitle.score-green {
                    background: #ecfdf5;
                    color: #047857;
                    border-color: #a7f3d0;
                }
                .brand-subtitle.score-yellow {
                    background: #fef3c7;
                    color: #b45309;
                    border-color: #fde68a;
                }
                .brand-subtitle.score-red {
                    background: #fef2f2;
                    color: #b91c1c;
                    border-color: #fecaca;
                }
                
                .card {
                    background: #ffffff;
                    border-radius: 24px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    gap: 20px;
                    flex: 1;
                    margin-bottom: 16px;
                }
                
                /* Food Profile */
                .food-banner-img {
                    width: 100%;
                    height: 220px;
                    border-radius: 16px;
                    object-fit: cover;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
                    background-color: #f8fafc;
                }
                
                .food-info-header {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .food-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                }
                
                .food-meta-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .meta-pill {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background-color: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 6px 12px;
                    border-radius: 9999px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #475569;
                    text-transform: capitalize;
                }
                
                /* Metrics Grid (8 boxes) */
                .macros-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }
                
                .macro-box {
                    border-radius: 12px;
                    padding: 12px 4px;
                    text-align: center;
                    border-width: 1px;
                    border-style: solid;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 98px;
                }
                
                .macro-box.cal { background-color: #fef2f2; border-color: #fee2e2; }
                .macro-box.prot { background-color: #eff6ff; border-color: #dbeafe; }
                .macro-box.carb { background-color: #f5f3ff; border-color: #e0e7ff; }
                .macro-box.fat { background-color: #fffbeb; border-color: #fef3c7; }
                .macro-box.fib { background-color: #f0fdf4; border-color: #dcfce7; }
                .macro-box.sod { background-color: #ecfeff; border-color: #cffafe; }
                .macro-box.sac { background-color: #fff7ed; border-color: #ffedd5; }
                .macro-box.ene { background-color: #fefce8; border-color: #fef9c3; }
                
                .macro-icon { display: flex; justify-content: center; margin-bottom: 4px; }
                .macro-icon svg { width: 18px; height: 18px; }
                
                .font-red { color: #ef4444; }
                .font-blue { color: #2563eb; }
                .font-purple { color: #7c3aed; }
                .font-amber { color: #d97706; }
                .font-green { color: #16a34a; }
                .font-cyan { color: #0891b2; }
                .font-orange { color: #ea580c; }
                .font-gold { color: #ca8a04; }
                
                .macro-num { font-size: 16px; font-weight: 800; margin-bottom: 2px; }
                .macro-lbl { font-size: 8.5px; font-weight: 700; text-transform: uppercase; color: #64748b; }
                .macro-sub-lbl { font-size: 7.5px; font-weight: 750; text-transform: uppercase; color: #7c3aed; margin-top: 1px; }
                
                /* Details Col (Objectives) */
                .details-col {
                    background-color: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 20px 24px;
                }
                
                .section-title {
                    font-size: 10.5px;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #64748b;
                    letter-spacing: 0.08em;
                    margin-bottom: 16px;
                }
                
                /* Goal Bars */
                .goal-bars { display: flex; flex-direction: column; gap: 16px; }
                .goal-item { font-size: 12px; }
                .goal-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .goal-name { color: #475569; font-weight: 600; font-size: 12px; }
                .goal-score { font-weight: 750; color: #0f172a; font-size: 12px; }
                .goal-progress-bg { height: 10px; background-color: #e2e8f0; border-radius: 9999px; overflow: hidden; }
                .goal-progress-bar { height: 100%; border-radius: 9999px; }
                
                .bg-emerald { background-color: #10b981; }
                .bg-indigo { background-color: #6366f1; }
                .bg-amber { background-color: #f59e0b; }
                
                /* Alerts & Swaps */
                .alerts-swaps-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .alert-box, .swap-box { border-radius: 12px; padding: 10px 12px; border-width: 1px; border-style: solid; }
                
                .alert-box { background-color: #fef2f2; border-color: #fecaca; }
                .swap-box { background-color: #f0fdf4; border-color: #dcfce7; }
                
                .alert-title-box, .swap-title-box { display: flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 700; margin-bottom: 6px; }
                .alert-title-box svg, .swap-title-box svg { width: 14px; height: 14px; flex-shrink: 0; }
                .alert-title-box { color: #b91c1c; }
                .swap-title-box { color: #15803d; }
                
                .alert-list, .swap-list { list-style: none; font-size: 9.5px; line-height: 1.4; }
                .alert-list li { position: relative; padding-left: 10px; color: #991b1b; margin-bottom: 2px; }
                .swap-list li { position: relative; padding-left: 10px; color: #14532d; margin-bottom: 2px; }
                
                /* Coach Quote Box */
                .coach-quote-box {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 16px 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .coach-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .coach-icon-speech {
                    font-size: 16px;
                }
                
                .coach-name-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: #0f172a;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .coach-text {
                    font-size: 13px;
                    font-weight: 500;
                    font-style: italic;
                    color: #334155;
                    line-height: 1.45;
                    border-left: 3px solid #10b981;
                    padding-left: 12px;
                }
                
                .poster-footer {
                    text-align: center;
                    color: #94a3b8;
                    letter-spacing: 0.05em;
                    font-weight: 600;
                    font-size: 10.5px;
                    margin-top: 10px;
                }
                .score-badge-val {
                    font-size: 13px;
                    font-weight: 800;
                }
            </style>
        </head>
        <body>
            <div class="capture-wrapper" id="capture">
                <!-- Header -->
                <div class="brand-header">
                    <div class="brand">
                        <span>FoodSnap</span><span class="brand-dot">.ai</span>
                    </div>
                    <div class="brand-subtitle ${scoreClass}">
                        Nota Nutricional: <span class="score-badge-val">${score}</span>/10
                    </div>
                </div>
                
                <!-- Card content -->
                <div class="card">
                    ${image_url ? `<img src="${image_url}" class="food-banner-img" alt="${food_name}" />` : ''}
                    
                    <div class="food-info-header">
                        <h2 class="food-title">${food_name}</h2>
                        <div class="food-meta-row">
                            <span class="meta-pill weight">⚖️ ${estimated_weight_g}g</span>
                            ${meal_type ? `<span class="meta-pill meal">🍽️ ${meal_type}</span>` : ''}
                            ${cuisine_origin ? `<span class="meta-pill origin">📍 ${cuisine_origin}</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="macros-grid">
                        <div class="macro-box cal"><div class="macro-icon font-red">${fireIcon}</div><div class="macro-num font-red">${calories}</div><div class="macro-lbl">Calorias</div></div>
                        <div class="macro-box prot"><div class="macro-icon font-blue">${proteinIcon}</div><div class="macro-num font-blue">${protein}g</div><div class="macro-lbl">Proteína</div></div>
                        <div class="macro-box carb">
                            <div class="macro-icon font-purple">${carbIcon}</div>
                            <div class="macro-num font-purple">${carbs}g</div>
                            <div class="macro-lbl">Carboidratos</div>
                            <div class="macro-sub-lbl">IG: ${glycemic_index}</div>
                        </div>
                        <div class="macro-box fat"><div class="macro-icon font-amber">${fatIcon}</div><div class="macro-num font-amber">${fat}g</div><div class="macro-lbl">Gordura</div></div>
                        <div class="macro-box fib"><div class="macro-icon font-green">${fiberIcon}</div><div class="macro-num font-green">${fiber}g</div><div class="macro-lbl">Fibras</div></div>
                        <div class="macro-box sod"><div class="macro-icon font-cyan">${sodiumIcon}</div><div class="macro-num font-cyan">${sodium}mg</div><div class="macro-lbl">Sódio</div></div>
                        <div class="macro-box sac"><div class="macro-icon font-orange">${satietyIcon}</div><div class="macro-num font-orange">${satiety_index}</div><div class="macro-lbl">Saciedade</div></div>
                        <div class="macro-box ene"><div class="macro-icon font-gold">${zapIcon}</div><div class="macro-num font-gold">~${energy_duration_minutes}m</div><div class="macro-lbl">Energia</div></div>
                    </div>
                    
                    <div class="details-col">
                        <div class="section-title">Adequação por Objetivo</div>
                        <div class="goal-bars">
                            <div class="goal-item"><div class="goal-header"><span class="goal-name">Emagrecimento</span><span class="goal-score">${goal_fit.emagrecer || 0}/10</span></div><div class="goal-progress-bg"><div class="goal-progress-bar bg-emerald" style="width:${(goal_fit.emagrecer || 0) * 10}%"></div></div></div>
                            <div class="goal-item"><div class="goal-header"><span class="goal-name">Ganho de Massa</span><span class="goal-score">${goal_fit.ganhar_massa || 0}/10</span></div><div class="goal-progress-bg"><div class="goal-progress-bar bg-indigo" style="width:${(goal_fit.ganhar_massa || 0) * 10}%"></div></div></div>
                            <div class="goal-item"><div class="goal-header"><span class="goal-name">Manutenção</span><span class="goal-score">${goal_fit.manter || 0}/10</span></div><div class="goal-progress-bg"><div class="goal-progress-bar bg-amber" style="width:${(goal_fit.manter || 0) * 10}%"></div></div></div>
                        </div>
                    </div>
                    
                    ${(alerts && alerts.length > 0) || (swap_suggestions && swap_suggestions.length > 0) ? `
                    <div class="alerts-swaps-row">
                        ${alerts && alerts.length > 0 ? `
                        <div class="alert-box">
                            <div class="alert-title-box">${warningIcon}<span>Alertas da Refeição</span></div>
                            <ul class="alert-list">${alerts.slice(0, 3).map(a => `<li>${a.replace(/^[⚠️\s▪️\-\*]+/, '')}</li>`).join('')}</ul>
                        </div>` : ''}
                        ${swap_suggestions && swap_suggestions.length > 0 ? `
                        <div class="swap-box">
                            <div class="swap-title-box">${swapIcon}<span>Substituições Saudáveis</span></div>
                            <ul class="swap-list">${swap_suggestions.slice(0, 3).map(s => `<li>${s.replace(/^[🔄\s▪️\-\*]+/, '')}</li>`).join('')}</ul>
                        </div>` : ''}
                    </div>` : ''}
                    
                    ${coach_humor ? `
                    <div class="coach-quote-box">
                        <div class="coach-header">
                            <span class="coach-icon-speech">${coachEmoji}</span>
                            <span class="coach-name-label">${coachName} diz:</span>
                        </div>
                        <p class="coach-text">"${coach_humor}"</p>
                    </div>
                    ` : ''}
                </div>
                
                <div class="poster-footer">
                    Acesse foodsnap.com.br para o seu plano completo de dieta e treino
                </div>
            </div>
        </body>
        </html>
        `;

        const htmlToRender = payload.html || html;

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: "new"
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 720, height: 1280, deviceScaleFactor: 2 });
        await page.setContent(htmlToRender, { waitUntil: 'networkidle0' });

        const element = await page.$('#capture');
        const buffer = await element.screenshot({ type: 'png', omitBackground: true });

        await browser.close();

        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (err) {
        console.error("Puppeteer render error:", err);
        res.status(500).json({ error: 'Failed to generate image', details: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log("Image Renderer active on port", PORT);
});
