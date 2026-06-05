'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'pt' | 'en' | 'es';

interface PlanDetails {
  title: string;
  price: string;
  period: string;
  billingInfo: string;
  description: string;
  btnText: string;
  features: string[];
  highlight?: string;
  savings?: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

interface Translations {
  header: {
    howItWorks: string;
    features: string;
    pricing: string;
    login: string;
    cta: string;
    slogan: string;
    tools: string;
  };
  hero: {
    tag: string;
    titleStart: string;
    titleHighlight: string;
    subtitle: string;
    ctaUpload: string;
    ctaPlans: string;
    stats: string;
    analysis: string;
    demoTag: string;
    demoResult: string;
    demoAdvice: string;
    demoAdviceText: string;
    demoModalTitle: string;
    demoModalDesc: string;
    demoModalBtn: string;
    demoProcessing: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  features: {
    guruTitle: string;
    mainTitle: string;
    subtitle: string;
    f1Title: string;
    f1Desc: string;
    f2Title: string;
    f2Desc: string;
    f3Title: string;
    f3Desc: string;
    f4Title: string;
    f4Desc: string;
    f5Title: string;
    f5Desc: string;
    visualTipTitle: string;
    visualTipDesc: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
    r1Content: string;
    r1Role: string;
    r2Content: string;
    r2Role: string;
    r3Content: string;
    r3Role: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    secure: string;
    plans: {
      monthly: PlanDetails;
      quarterly: PlanDetails;
      annual: PlanDetails;
    }
  };
  faq: {
    title: string;
    q1: string; a1: string;
    q2: string; a2: string;
    q3: string; a3: string;
    q4: string; a4: string;
  };
  // New Full FAQ Page
  faqPage: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    backHome: string;
    categories: {
      general: FaqCategory;
      account: FaqCategory;
      billing: FaqCategory;
      technical: FaqCategory;
    };
  };
  footer: {
    ctaTitle: string;
    ctaDesc: string;
    ctaBtn: string;
    desc: string;
    platform: string;
    legal: string;
    connect: string;
    rights: string;
  };
  auth: {
    welcomeBack: string;
    createAccount: string;
    completeProfile: string;
    accessPanel: string;
    fillToAccess: string;
    confirmPhone: string;
    nameLabel: string;
    phoneLabel: string;
    emailLabel: string;
    passwordLabel: string;
    phonePlaceholder: string;
    phoneHelper: string;
    btnRegister: string;
    btnLogin: string;
    btnSave: string;
    btnSuccess: string;
    googleBtn: string;
    or: string;
    noAccount: string;
    hasAccount: string;
    registerLink: string;
    loginLink: string;
    security: string;
    errorRequired: string;
    errorPhone: string;
    successRegister: string;
    successLogin: string;
  };
  dashboard: {
    menuOverview: string;
    menuHistory: string;
    menuSubscription: string;
    logout: string;
    hello: string;
    status: string;
    statDishes: string;
    statDishesSub: string;
    statCals: string;
    statCalsSub: string;
    statPlan: string;
    activeSub: string;
    trialSub: string;
    upgradeSub: string;
    eatTitle: string;
    eatDesc: string;
    btnHistory: string;
    btnWhatsapp: string;
    recentTitle: string;
    viewAll: string;
    emptyRecent: string;
    historyTitle: string;
    historySubtitle: string;
    searchPlaceholder: string;
    emptyHistory: string;
    subTitle: string;
    subDesc: string;
    currentPlan: string;
    validUntil: string;
    limitedAccess: string;
    portalText: string;
    btnPortal: string;
    upgradeTitle: string;
    upgradeDesc: string;
    btnUpgrade: string;
    btnUpgradeShort: string;
    connectTitle: string;
    connectDesc: string;
    step1: string;
    step2: string;
    step3: string;
    scanLabel: string;
  };
  tools: {
    title: string;
    subtitle: string;
    bmi: {
      title: string;
      desc: string;
      labelWeight: string;
      labelHeight: string;
      result: string;
    };
    water: {
      title: string;
      desc: string;
      result: string;
      daily: string;
    };
    bmr: {
      title: string;
      desc: string;
      labelAge: string;
      labelGender: string;
      male: string;
      female: string;
      result: string;
    };
    tdee: {
      title: string;
      desc: string;
      activity: string;
      sedentary: string;
      light: string;
      moderate: string;
      active: string;
      veryActive: string;
      result: string;
    };
    orm: {
      title: string;
      desc: string;
      lift: string;
      reps: string;
      result: string;
    };
    bodyfat: {
      title: string;
      desc: string;
      waist: string;
      neck: string;
      hip: string;
      result: string;
    };
    hr: {
      title: string;
      desc: string;
      result: string;
      zone: string;
    };
    calculate: string;
    back: string;
  };
  coach: {
    title: string;
    subtitle: string;
    photosStep: {
      alert: string;
      front: string;
      side: string;
      back: string;
      camera: string;
      gallery: string;
    };
    goalStep: {
      title: string;
      hypertrophy: { title: string; desc: string; };
      definition: { title: string; desc: string; };
      maintenance: { title: string; desc: string; };
      strength: { title: string; desc: string; };
    };
    processing: {
      errorTitle: string;
      retry: string;
      analyzing: string;
      wait: string;
      steps: string[];
    };
    buttons: {
      next: string;
      back: string;
      generate: string;
    };
  };
}

const dictionary: Record<Language, Translations> = {
  pt: {
    header: {
      howItWorks: 'Como Funciona',
      features: 'Vantagens',
      pricing: 'Planos',
      login: 'Área do Membro',
      cta: 'Começar Transformação',
      slogan: 'Seu Nutricionista de Bolso',
      tools: 'Ferramentas'
    },
    hero: {
      tag: 'NOVA IA GERATIVA 2.0',
      titleStart: 'Transforme seu corpo',
      titleHighlight: 'com apenas uma foto.',
      subtitle: 'O FoodSnap.ai elimina a necessidade de pesar comida. Tire uma foto e nossa Inteligência Artificial calcula calorias, macros e te dá dicas em tempo real para atingir seu peso ideal.',
      ctaUpload: 'Testar IA Agora',
      ctaPlans: 'Ver Preços',
      stats: '25k+ refeições otimizadas',
      analysis: 'Raio-X Nutricional',
      demoTag: 'Análise FoodSnap',
      demoResult: 'Estimativa Precisa',
      demoAdvice: 'Dica FoodSnap:',
      demoAdviceText: 'Ótima proteína! Reduza o arroz pela metade no jantar para acelerar a queima de gordura.',
      demoModalTitle: 'Experimente a Mágica',
      demoModalDesc: 'Envie uma foto da sua refeição. O FoodSnap.ai identifica ingredientes e calcula tudo instantaneamente.',
      demoModalBtn: 'Enviar Foto',
      demoProcessing: 'FoodSnap analisando...'
    },
    howItWorks: {
      title: 'Nutrição simplificada em 3 passos',
      subtitle: 'Sem planilhas chatas, sem aplicativos complicados. Usamos o WhatsApp que você já ama.',
      step1Title: 'Fotografe',
      step1Desc: 'Vai comer? Aponte a câmera. Não precisa descrever nada, nossa visão computacional faz o trabalho pesado.',
      step2Title: 'Envie no Zap',
      step2Desc: 'Mande a foto para o nosso número oficial. É como conversar com um amigo nutricionista.',
      step3Title: 'Receba o Feedback',
      step3Desc: 'Em segundos, saiba se está dentro da meta e receba sugestões para melhorar a próxima refeição.'
    },
    features: {
      guruTitle: 'Tecnologia FoodSnap',
      mainTitle: 'Emagreça sem passar fome e sem neura.',
      subtitle: 'O FoodSnap não é apenas um contador de calorias. É um assistente que te ensina a comer melhor, refeição após refeição.',
      f1Title: 'Scanner de Calorias',
      f1Desc: 'Adeus balança! Nossa IA estima porções visualmente com alta precisão.',
      f2Title: 'Coach Nutricional',
      f2Desc: 'Receba elogios quando acertar e correções gentis quando exagerar. Feedback humano e motivador.',
      f3Title: 'Sugestões de Trocas',
      f3Desc: 'Exagerou no almoço? O FoodSnap sugere um lanche mais leve para compensar e manter o dia no verde.',
      f4Title: 'Diário Automático',
      f4Desc: 'Todo o seu histórico fica salvo. Gere relatórios de evolução para compartilhar com seu médico.',
      f5Title: 'Tire Dúvidas 24h',
      f5Desc: 'Pergunte qualquer coisa: "Quantas calorias tem uma maçã?" ou "O que comer antes do treino?".',
      visualTipTitle: 'Insight FoodSnap',
      visualTipDesc: 'Essa refeição está rica em fibras! Isso vai te manter saciado por mais tempo. Continue assim!'
    },
    testimonials: {
      title: 'Resultados Reais',
      subtitle: 'Milhares de pessoas já transformaram sua relação com a comida usando o FoodSnap.ai.',
      r1Content: 'Eu desisti de 5 dietas porque tinha preguiça de anotar tudo. Com o FoodSnap, só tiro foto e pronto. Perdi 8kg em 2 meses!',
      r1Role: 'Advogado',
      r2Content: 'Como nutricionista, recomendo aos pacientes. A adesão ao plano alimentar triplicou porque ficou divertido acompanhar.',
      r2Role: 'Nutricionista Funcional',
      r3Content: 'A precisão é impressionante. Ele identificou até o azeite na salada. Vale cada centavo pela praticidade.',
      r3Role: 'Personal Trainer'
    },
    pricing: {
      title: 'Invista na sua Saúde',
      subtitle: 'Menos que um café por dia para ter um nutricionista IA no seu bolso.',
      secure: 'Compra segura. Satisfação garantida ou seu dinheiro de volta em 7 dias.',
      plans: {
        monthly: {
          title: 'Plano Único PRO',
          price: 'R$ 5,00',
          period: '/primeiro mês',
          billingInfo: 'Depois R$ 14,99/mês. Cancele quando quiser.',
          description: 'Teste o plano completo FoodSnap PRO no primeiro mês por apenas R$ 5,00.',
          btnText: 'Assinar Agora',
          features: [
            'Fotos Ilimitadas',
            'Feedback Imediato',
            'Chat Nutricional 24h',
            'Histórico Completo'
          ]
        },
        quarterly: {
          title: 'Trimestral',
          price: 'R$ 39,90',
          period: '/mês',
          billingInfo: 'Cobrado a cada 3 meses',
          description: 'O empurrão que faltava.',
          btnText: 'Garantir Desconto',
          features: [
            'Tudo do Mensal',
            'Economia de 20%',
            'Prioridade no Suporte',
            'Acesso a Novas Features'
          ]
        },
        annual: {
          title: 'Anual',
          price: 'R$ 29,90',
          period: '/mês',
          billingInfo: 'Faturamento anual',
          description: 'Para transformar o estilo de vida.',
          btnText: 'Quero o Melhor Preço',
          highlight: 'Mais Vendido',
          savings: 'Economize 40%',
          features: [
            'Tudo do Trimestral',
            'Relatório Mensal em PDF',
            'Suporte VIP',
            'Menor valor mensal'
          ]
        }
      }
    },
    faq: {
      title: 'Dúvidas Comuns',
      q1: 'O FoodSnap substitui um nutricionista?',
      a1: 'O FoodSnap é uma ferramenta de apoio educacional e monitoramento. Para dietas prescritas para condições de saúde específicas, consulte sempre um profissional.',
      q2: 'Preciso baixar algum app?',
      a2: 'Não! Toda a mágica acontece no WhatsApp. Você não ocupa memória do celular e usa o app que já conhece.',
      q3: 'A IA acerta sempre?',
      a3: 'Nossa IA tem precisão superior a 90% para alimentos comuns. Em pratos muito misturados, ela faz a melhor estimativa possível baseada em padrões visuais.',
      q4: 'Como cancelo?',
      a4: 'Super simples. Dentro do seu painel de usuário, há um botão "Gerenciar Assinatura". Cancele quando quiser com um clique.'
    },
    faqPage: {
      title: 'Central de Ajuda',
      subtitle: 'Encontre respostas para suas dúvidas sobre o FoodSnap.ai',
      searchPlaceholder: 'Busque sua dúvida (ex: cancelamento, whatsapp...)',
      backHome: 'Voltar para Home',
      categories: {
        general: {
          title: 'Geral',
          items: [
            { q: 'O que é o FoodSnap.ai?', a: 'O FoodSnap.ai é um serviço de nutrição inteligente que usa inteligência artificial para analisar fotos de suas refeições, calcular calorias e macros, e fornecer feedback em tempo real via WhatsApp.' },
            { q: 'Como funciona a análise?', a: 'Basta enviar uma foto do seu prato para nosso número no WhatsApp. Nossa IA identifica os alimentos, estima as porções e retorna um relatório nutricional completo em segundos.' },
            { q: 'Preciso de um app?', a: 'Não. Tudo funciona dentro do WhatsApp. Você também tem acesso a um painel web para ver seu histórico completo e gráficos de evolução.' }
          ]
        },
        account: {
          title: 'Minha Conta',
          items: [
            { q: 'Como mudo minha senha?', a: 'Você pode redefinir sua senha na tela de login clicando em "Esqueci minha senha" ou dentro do painel do usuário nas configurações.' },
            { q: 'Posso compartilhar minha conta?', a: 'A assinatura é individual. O histórico e as recomendações são personalizados para o perfil de um único usuário.' },
            { q: 'Como mudo meu telefone cadastrado?', a: 'No momento, para mudar o telefone vinculado ao WhatsApp, entre em contato com nosso suporte via chat no painel.' }
          ]
        },
        billing: {
          title: 'Planos e Pagamento',
          items: [
            { q: 'Quais as formas de pagamento?', a: 'Aceitamos cartões de crédito (Visa, Mastercard, Elo, Amex) através da plataforma segura Stripe.' },
            { q: 'Tem fidelidade?', a: 'O plano mensal não tem fidelidade. Os planos trimestrais e anuais possuem o compromisso pelo período contratado em troca de um desconto maior.' },
            { q: 'Como cancelo?', a: 'Acesse o Painel do Usuário > Minha Assinatura > Portal do Cliente. Lá você pode cancelar a renovação automática a qualquer momento.' },
            { q: 'Tenho reembolso?', a: 'Sim, oferecemos garantia incondicional de 7 dias para novos assinantes. Se não gostar, devolvemos 100% do valor.' }
          ]
        },
        technical: {
          title: 'Suporte Técnico',
          items: [
            { q: 'O bot não responde no WhatsApp', a: 'Verifique se você salvou o número corretamente e se seu plano está ativo. Às vezes, pode haver uma breve fila de processamento. Tente enviar "Oi" para reiniciar.' },
            { q: 'A IA identificou errado meu prato', a: 'Embora rara, imprecisões podem ocorrer. Tente tirar fotos com boa iluminação e onde todos os ingredientes estejam visíveis. Você pode enviar uma mensagem de texto corrigindo (ex: "não é frango, é peixe") e a IA ajustará.' }
          ]
        }
      }
    },
    footer: {
      ctaTitle: 'Comece sua transformação hoje',
      ctaDesc: 'Não deixe para segunda-feira. Sua melhor versão começa com o próximo prato.',
      ctaBtn: 'Quero Experimentar o FoodSnap',
      desc: 'Tecnologia de ponta para simplificar a nutrição e promover saúde acessível para todos.',
      platform: 'Produto',
      legal: 'Legal',
      connect: 'Redes',
      rights: 'Todos os direitos reservados.'
    },
    auth: {
      welcomeBack: 'Login FoodSnap',
      createAccount: 'Criar Conta FoodSnap',
      completeProfile: 'Quase lá!',
      accessPanel: 'Gerencie sua assinatura e histórico.',
      fillToAccess: 'Preencha para liberar seu acesso.',
      confirmPhone: 'Confirme seu WhatsApp para sincronizar.',
      nameLabel: 'Nome Completo',
      phoneLabel: 'Seu WhatsApp (com DDD)',
      emailLabel: 'Melhor E-mail',
      passwordLabel: 'Senha Segura',
      phonePlaceholder: '11999999999',
      phoneHelper: 'Digite apenas números com DDD.',
      btnRegister: 'Criar Conta Grátis',
      btnLogin: 'Entrar no Painel',
      btnSave: 'Finalizar Cadastro',
      btnSuccess: 'Sucesso!',
      googleBtn: 'Entrar com Google',
      or: 'Ou',
      noAccount: 'Ainda não tem conta?',
      hasAccount: 'Já é cliente?',
      registerLink: 'Criar conta',
      loginLink: 'Fazer login',
      security: 'Seus dados estão 100% seguros.',
      errorRequired: 'Preencha todos os campos.',
      errorPhone: 'WhatsApp inválido.',
      successRegister: 'Conta criada! Acessando...',
      successLogin: 'Login efetuado!'
    },
    dashboard: {
      menuOverview: 'Visão Geral',
      menuHistory: 'Diário Alimentar',
      menuSubscription: 'Minha Assinatura',
      logout: 'Sair',
      hello: 'Olá',
      status: 'Status da Conta',
      statDishes: 'Refeições',
      statDishesSub: 'Registradas',
      statCals: 'Média Diária',
      statCalsSub: 'Calorias',
      statPlan: 'Seu Plano',
      activeSub: 'FoodSnap PRO',
      trialSub: 'Período Gratuito',
      upgradeSub: 'Conta Básica',
      eatTitle: 'Hora de comer?',
      eatDesc: 'Envie a foto no WhatsApp ou faça upload aqui para registrar seus macros.',
      btnHistory: 'Ver Diário',
      btnWhatsapp: 'Abrir WhatsApp',
      recentTitle: 'Últimas Refeições',
      viewAll: 'Ver tudo',
      emptyRecent: 'Nenhuma refeição registrada hoje.',
      historyTitle: 'Seu Diário Alimentar',
      historySubtitle: 'Acompanhe sua evolução nutricional.',
      searchPlaceholder: 'Buscar refeição...',
      emptyHistory: 'Seu histórico está vazio.',
      subTitle: 'Assinatura',
      subDesc: 'Gerencie seu plano FoodSnap.',
      currentPlan: 'Plano Atual',
      validUntil: 'Renova em:',
      limitedAccess: 'Você está no plano gratuito.',
      portalText: 'Gerenciar cartão ou cancelar assinatura?',
      btnPortal: 'Portal do Cliente',
      upgradeTitle: 'Seja FoodSnap PRO',
      upgradeDesc: 'Tenha análises ilimitadas, relatórios detalhados e suporte prioritário para atingir seus objetivos mais rápido.',
      btnUpgrade: 'Assinar Agora',
      btnUpgradeShort: 'Virar PRO',
      connectTitle: 'Ativar no WhatsApp',
      connectDesc: 'Sincronize sua conta para enviar fotos direto pelo Zap.',
      step1: 'Leia o QR Code',
      step2: 'Envie um "Oi"',
      step3: 'Mande a foto do prato',
      scanLabel: 'Ler QR Code'
    },
    tools: {
      title: 'Calculadoras Fit',
      subtitle: 'Ferramentas para seu planejamento.',
      bmi: {
        title: 'Calculadora de IMC',
        desc: 'Descubra seu Índice de Massa Corporal.',
        labelWeight: 'Peso (kg)',
        labelHeight: 'Altura (cm)',
        result: 'Seu IMC é'
      },
      water: {
        title: 'Hidratação Diária',
        desc: 'Descubra quanta água beber.',
        result: 'Sua meta é',
        daily: 'litros por dia'
      },
      bmr: {
        title: 'Gasto Calórico (TMB)',
        desc: 'Quantas calorias você queima em repouso.',
        labelAge: 'Idade',
        labelGender: 'Gênero',
        male: 'Homem',
        female: 'Mulher',
        result: 'Sua TMB é'
      },
      tdee: {
        title: 'Gasto Total (TDEE)',
        desc: 'Calorias diárias considerando atividade.',
        activity: 'Nível de Atividade',
        sedentary: 'Sedentário',
        light: 'Levemente Ativo',
        moderate: 'Moderadamente Ativo',
        active: 'Muito Ativo',
        veryActive: 'Atleta / Extremo',
        result: 'Gasto Diário'
      },
      orm: {
        title: 'Força Máxima (1RM)',
        desc: 'Carga máxima teórica para 1 repetição.',
        lift: 'Peso Levantado (kg)',
        reps: 'Repetições',
        result: 'Seu 1RM Estimado'
      },
      bodyfat: {
        title: 'Gordura Corporal',
        desc: 'Estimativa baseada no método da Marinha.',
        waist: 'Cintura (cm)',
        neck: 'Pescoço (cm)',
        hip: 'Quadril (cm)',
        result: 'Gordura Estimada'
      },
      hr: {
        title: 'Zonas de FC',
        desc: 'Frequência Cardíaca Máxima e Zonas.',
        result: 'FC Máxima',
        zone: 'Zona de Queima de Gordura'
      },
      calculate: 'Calcular',
      back: 'Voltar'
    },
    coach: {
      title: 'Personal Trainer IA',
      subtitle: 'Gere seu protocolo ideal baseado no seu biotipo.',
      photosStep: {
        alert: 'Fotos de Avaliação: Use roupas leves. Posicione a câmera na altura do peito, corpo relaxado.',
        front: 'Frente',
        side: 'Perfil',
        back: 'Costas',
        camera: 'Câmera',
        gallery: 'Galeria'
      },
      goalStep: {
        title: 'Qual seu objetivo principal?',
        hypertrophy: { title: 'Hipertrofia', desc: 'Ganhar massa muscular e volume.' },
        definition: { title: 'Definição', desc: 'Queimar gordura e definir músculos.' },
        maintenance: { title: 'Saúde e Manutenção', desc: 'Melhorar alimentação e energia.' },
        strength: { title: 'Força Pura', desc: 'Focar em progressão de carga.' }
      },
      processing: {
        errorTitle: 'Ops! Algo deu errado.',
        retry: 'Tentar Novamente',
        analyzing: 'Buscando biotipo...',
        wait: 'A IA está processando suas fotos. Isso pode levar até 30 segundos.',
        steps: [
          "Identificando Biotipo...",
          "Analisando Postura e Simetria...",
          "Calculando Estimativa de Gordura...",
          "Ajustando Macros para seu Objetivo...",
          "Gerando Treino Personalizado..."
        ]
      },
      buttons: {
        next: 'Próximo',
        back: 'Voltar',
        generate: 'Gerar Protocolo'
      }
    }
  },
  en: {
    header: {
      howItWorks: 'How it Works',
      features: 'Features',
      pricing: 'Pricing',
      login: 'Login',
      cta: 'Start for Free',
      slogan: 'Intelligence on your plate',
      tools: 'Tools'
    },
    hero: {
      tag: 'Computational Nutrition AI',
      titleStart: 'Calorie science,',
      titleHighlight: 'simplified in one snap.',
      subtitle: 'More than just calories. Our AI analyzes nutrient quality, suggests smart swaps, and optimizes your diet in real-time.',
      ctaUpload: 'Live Demo',
      ctaPlans: 'View Pro Plans',
      stats: '10k+ meals analyzed',
      analysis: 'Full Analysis',
      demoTag: 'Insight',
      demoResult: 'Estimate',
      demoAdvice: 'Tip:',
      demoAdviceText: 'Great choice! To lower the glycemic index, consider adding more fiber.',
      demoModalTitle: 'Try the Technology',
      demoModalDesc: 'Take a photo of your dish or choose from gallery. Our AI will analyze the nutrients in seconds.',
      demoModalBtn: 'Choose Photo',
      demoProcessing: 'Analyzing food items...'
    },
    howItWorks: {
      title: 'Frictionless Flow',
      subtitle: 'We eliminated the complexity of tracking your diet. Just point and send.',
      step1Title: 'Visual Capture',
      step1Desc: 'Take a clear photo of your dish. Our AI accepts varied angles and identifies multiple items.',
      step2Title: 'Instant Send',
      step2Desc: 'Share via WhatsApp. No forms, no complex logins, no barriers.',
      step3Title: 'Detailed Analysis',
      step3Desc: 'Receive the full nutritional report and ask questions to the assistant in real-time.'
    },
    features: {
      guruTitle: 'Advanced AI',
      mainTitle: 'Your pocket nutritionist, available 24/7.',
      subtitle: 'We don\'t just deliver numbers. Our AI understands the context of your diet and offers qualitative feedback to help you eat better.',
      f1Title: 'Nutritional X-Ray',
      f1Desc: 'Automatic ingredient identification with detailed breakdown of Proteins, Carbs, Fats, and Fiber.',
      f2Title: 'Improvement Suggestions',
      f2Desc: 'The AI doesn\'t just read, it opines. Get tips like: "Add green leaves for more satiety".',
      f3Title: 'Smart Swaps',
      f3Desc: 'Love eating well? The system suggests tasty substitutions to reduce calories without sacrificing pleasure.',
      f4Title: 'Visual Volumetrics',
      f4Desc: 'Intelligent weight estimation based on plate proportion. Retire the kitchen scale.',
      f5Title: 'Chat Consulting',
      f5Desc: 'Ask questions: "Can I eat this pre-workout?" or "What\'s the best option on this menu?".',
      visualTipTitle: 'Smart Insight',
      visualTipDesc: 'Great choice of fats! How about adding pumpkin seeds for more crunch and zinc?'
    },
    testimonials: {
      title: 'Approved by Users',
      subtitle: 'Join a community focused on real results.',
      r1Content: 'The accuracy of macro reading changed my game. I no longer waste time weighing food at restaurants.',
      r1Role: 'Crossfit Athlete',
      r2Content: 'I recommend it to all my patients who struggle with food diaries. Plan adherence increased by 40%.',
      r2Role: 'Sports Nutritionist',
      r3Content: 'Clean interface, fast, and frictionless. Exactly what I needed to stay in shape without stress.',
      r3Role: 'Software Engineer'
    },
    pricing: {
      title: 'Pro Plans',
      subtitle: 'Choose the flexibility your lifestyle demands.',
      secure: 'Secure payment via Stripe. Cancel anytime.',
      plans: {
        monthly: {
          title: 'PRO Subscription',
          price: '$4.99',
          period: '/first month',
          billingInfo: 'Then $14.99/mo. Cancel anytime.',
          description: 'Try the full FoodSnap PRO plan for just $4.99 in your first month.',
          btnText: 'Subscribe Now',
          features: [
            'Unlimited Queries',
            'AI Nutritionist Chat',
            'Unlimited History',
            'Micronutrient Analysis'
          ]
        },
        quarterly: {
          title: 'Quarterly',
          price: '$7.99',
          period: '/mo',
          billingInfo: 'Billed every 3 months',
          description: 'Medium term commitment.',
          btnText: 'Choose Quarterly',
          features: [
            'All Monthly features',
            'Priority Support',
            'Save 20%',
            'Access to Beta features'
          ]
        },
        annual: {
          title: 'Annual',
          price: '$5.99',
          period: '/mo',
          billingInfo: 'Billed annually',
          description: 'Best for real results.',
          btnText: 'Go Annual',
          highlight: 'Best Value',
          savings: 'Save 40%',
          features: [
            'All Quarterly features',
            'Evolution Reports',
            'VIP Support',
            'Price locked for 1 year'
          ]
        }
      }
    },
    faq: {
      title: 'Frequently Asked Questions',
      q1: 'Is the information 100% accurate?',
      a1: 'No. Analyses are estimates based on the visual image sent. Factors like preparation method and hidden oils can vary. Use as a guide.',
      q2: 'Does it work with any food?',
      a2: 'Yes! Works well with homemade meals, lunchboxes, restaurants, and fast food. The clearer the photo, the better.',
      q3: 'Do I need to install an app?',
      a3: 'No. Everything works directly through WhatsApp. You send the photo as if chatting with a friend.',
      q4: 'Can I cancel anytime?',
      a4: 'Yes, no strings attached. Cancel the Pro subscription anytime via the dashboard.'
    },
    faqPage: {
      title: 'Help Center',
      subtitle: 'Find answers to your questions about FoodSnap.ai',
      searchPlaceholder: 'Search your question (ex: cancel, whatsapp...)',
      backHome: 'Back to Home',
      categories: {
        general: {
          title: 'General',
          items: [
            { q: 'What is FoodSnap.ai?', a: 'FoodSnap.ai is an intelligent nutrition service that uses AI to analyze photos of your meals, calculate calories/macros, and provide real-time feedback via WhatsApp.' },
            { q: 'How does analysis work?', a: 'Just send a photo of your dish to our WhatsApp number. Our AI identifies foods, estimates portions, and returns a full nutritional report in seconds.' },
            { q: 'Do I need an app?', a: 'No. Everything works within WhatsApp. You also get a web dashboard to view your full history and progress charts.' }
          ]
        },
        account: {
          title: 'My Account',
          items: [
            { q: 'How do I change my password?', a: 'You can reset your password at the login screen by clicking "Forgot Password" or inside the user dashboard under settings.' },
            { q: 'Can I share my account?', a: 'Subscriptions are individual. History and recommendations are personalized for a single user profile.' },
            { q: 'How to change registered phone?', a: 'Currently, to change the phone linked to WhatsApp, please contact support via chat in the dashboard.' }
          ]
        },
        billing: {
          title: 'Plans & Billing',
          items: [
            { q: 'Payment methods?', a: 'We accept credit cards (Visa, Mastercard, Amex) via the secure Stripe platform.' },
            { q: 'Is there a contract?', a: 'The monthly plan has no contract. Quarterly and annual plans have a commitment for the contracted period in exchange for a discount.' },
            { q: 'How to cancel?', a: 'Go to User Dashboard > My Subscription > Customer Portal. You can cancel auto-renewal there anytime.' },
            { q: 'Refund policy?', a: 'Yes, we offer an unconditional 7-day guarantee for new subscribers. If you don\'t like it, we refund 100%.' }
          ]
        },
        technical: {
          title: 'Technical Support',
          items: [
            { q: 'Bot not responding on WhatsApp', a: 'Check if you saved the number correctly and your plan is active. Sometimes there may be a short processing queue. Try sending "Hi" to restart.' },
            { q: 'AI identified my dish wrong', a: 'Although rare, inaccuracies can happen. Try taking photos with good lighting where all ingredients are visible. You can send a text correcting it (e.g., "it\'s not chicken, it\'s fish") and the AI will adjust.' }
          ]
        }
      }
    },
    footer: {
      ctaTitle: 'Ready to take control?',
      ctaDesc: 'No complex spreadsheets, no scales. Just you, your food, and the best AI technology.',
      ctaBtn: 'Access FoodSnap',
      desc: 'Artificial Intelligence applied to nutrition to simplify life for those seeking health and real performance.',
      platform: 'Platform',
      legal: 'Legal',
      connect: 'Connect',
      rights: 'All rights reserved.'
    },
    auth: {
      welcomeBack: 'Welcome Back',
      createAccount: 'Create Account',
      completeProfile: 'Complete Profile',
      accessPanel: 'Access your dashboard and history.',
      fillToAccess: 'Fill to access AI features.',
      confirmPhone: 'Confirm your WhatsApp to receive analyses.',
      nameLabel: 'Full Name',
      phoneLabel: 'WhatsApp (with Country Code)',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      phonePlaceholder: '15551234567',
      phoneHelper: 'Numbers only, include country code.',
      btnRegister: 'Create Free Account',
      btnLogin: 'Login to Dashboard',
      btnSave: 'Save and Continue',
      btnSuccess: 'Success!',
      googleBtn: 'Google',
      or: 'Or continue with',
      noAccount: 'No account?',
      hasAccount: 'Already have an account?',
      registerLink: 'Sign up',
      loginLink: 'Login',
      security: 'Data protected and encrypted.',
      errorRequired: 'All fields are required.',
      errorPhone: 'Invalid WhatsApp.',
      successRegister: 'Account created! Redirecting...',
      successLogin: 'Login successful!'
    },
    dashboard: {
      menuOverview: 'Overview',
      menuHistory: 'Dish History',
      menuSubscription: 'Subscription',
      logout: 'Logout',
      hello: 'Hello',
      status: 'Status',
      statDishes: 'Dishes Analyzed',
      statDishesSub: 'Total registered',
      statCals: 'Average Calories',
      statCalsSub: 'kcal/meal',
      statPlan: 'Current Plan',
      activeSub: 'Active Subscription',
      trialSub: 'Free Trial',
      upgradeSub: 'Upgrade Available',
      eatTitle: 'Eating something now?',
      eatDesc: 'Send a photo to our WhatsApp or upload directly here to register.',
      btnHistory: 'View History',
      btnWhatsapp: 'WhatsApp',
      recentTitle: 'Recent',
      viewAll: 'View all',
      emptyRecent: 'No dishes registered yet. Take a photo!',
      historyTitle: 'Food History',
      historySubtitle: 'All your analyses saved automatically.',
      searchPlaceholder: 'Search dish...',
      emptyHistory: 'You haven\'t sent any photos yet.',
      subTitle: 'Manage Subscription',
      subDesc: 'Control your payments and plan via Stripe.',
      currentPlan: 'Current Plan',
      validUntil: 'Valid until:',
      limitedAccess: 'Limited access to free plan.',
      portalText: 'Do you want to change your credit card or cancel subscription?',
      btnPortal: 'Open Customer Portal',
      upgradeTitle: 'Upgrade to PRO',
      upgradeDesc: 'Unlock unlimited history, detailed micronutrient analysis, and priority support.',
      btnUpgrade: 'Subscribe for $9.90/mo',
      btnUpgradeShort: 'Get Pro',
      connectTitle: 'Connect Now',
      connectDesc: 'Follow steps to activate AI on WhatsApp.',
      step1: 'Scan QR Code',
      step2: 'Send "Hi"',
      step3: 'Send photo of your dish',
      scanLabel: 'Scan to start'
    },
    tools: {
      title: 'Free Tools',
      subtitle: 'Essential calculators for your journey.',
      bmi: {
        title: 'BMI Calculator',
        desc: 'Find out your Body Mass Index.',
        labelWeight: 'Weight (kg)',
        labelHeight: 'Height (cm)',
        result: 'Your BMI is'
      },
      water: {
        title: 'Daily Hydration',
        desc: 'Find out how much water to drink.',
        result: 'Your goal is',
        daily: 'liters per day'
      },
      bmr: {
        title: 'Caloric Burn (BMR)',
        desc: 'How many calories you burn at rest.',
        labelAge: 'Age',
        labelGender: 'Gender',
        male: 'Male',
        female: 'Female',
        result: 'Your BMR is'
      },
      tdee: {
        title: 'Total Energy (TDEE)',
        desc: 'Daily calories including activity level.',
        activity: 'Activity Level',
        sedentary: 'Sedentary',
        light: 'Lightly Active',
        moderate: 'Moderadamente Active',
        active: 'Very Active',
        veryActive: 'Athlete / Extreme',
        result: 'Daily Burn'
      },
      orm: {
        title: 'One Rep Max (1RM)',
        desc: 'Theoretical max load for 1 repetition.',
        lift: 'Weight Lifted (kg)',
        reps: 'Reps Performed',
        result: 'Estimated 1RM'
      },
      bodyfat: {
        title: 'Body Fat %',
        desc: 'Estimate based on US Navy method.',
        waist: 'Waist (cm)',
        neck: 'Neck (cm)',
        hip: 'Hip (cm)',
        result: 'Est. Body Fat'
      },
      hr: {
        title: 'Heart Rate Zones',
        desc: 'Max Heart Rate and Training Zones.',
        result: 'Max HR',
        zone: 'Fat Burn Zone'
      },
      calculate: 'Calculate',
      back: 'Back'
    },
    coach: {
      title: 'AI Personal Coach',
      subtitle: 'Generate your ideal protocol based on your biotype.',
      photosStep: {
        alert: 'Assessment Photos: Wear light clothing. Position camera at chest height, relaxed body and straight spine.',
        front: 'Front',
        side: 'Side',
        back: 'Back',
        camera: 'Camera',
        gallery: 'Gallery'
      },
      goalStep: {
        title: 'What is your main goal?',
        hypertrophy: { title: 'Hypertrophy', desc: 'Gain muscle mass and volume.' },
        definition: { title: 'Definition', desc: 'Burn fat and define muscles.' },
        maintenance: { title: 'Health & Maintenance', desc: 'Improve nutrition and energy.' },
        strength: { title: 'Pure Strength', desc: 'Focus on load progression.' }
      },
      processing: {
        errorTitle: 'Oops! Something went wrong.',
        retry: 'Try Again',
        analyzing: 'Finding biotype...',
        wait: 'AI is processing your photos. This may take up to 30 seconds.',
        steps: [
          "Identifying Biotype...",
          "Analyzing Posture and Symmetry...",
          "Calculating Fat Estimate...",
          "Adjusting Macros for your Goal...",
          "Generating Personalized Workout Plan..."
        ]
      },
      buttons: {
        next: 'Next',
        back: 'Back',
        generate: 'Generate Protocol'
      }
    }
  },
  es: {
    header: {
      howItWorks: 'Cómo Funciona',
      features: 'Funciones',
      pricing: 'Precios',
      login: 'Entrar',
      cta: 'Empezar Gratis',
      slogan: 'Inteligencia en tu plato',
      tools: 'Herramientas'
    },
    hero: {
      tag: 'IA de Nutrición Computacional',
      titleStart: 'La ciencia de las calorías,',
      titleHighlight: 'simplificada en una foto.',
      subtitle: 'Mucho más que calorías. Nuestra IA analiza la calidad de los nutrientes, sugiere cambios inteligentes y optimiza tu dieta en tiempo real.',
      ctaUpload: 'Demostración',
      ctaPlans: 'Ver Planes Pro',
      stats: '10k+ platos analizados',
      analysis: 'Análisis Completo',
      demoTag: 'Perspectiva',
      demoResult: 'Estimación',
      demoAdvice: 'Consejo:',
      demoAdviceText: '¡Excelente elección! Para reducir el índice glucémico, añade más fibra.',
      demoModalTitle: 'Prueba la Tecnología',
      demoModalDesc: 'Toma una foto de tu plato o elige de la galería. Nuestra IA analizará los nutrientes en segundos.',
      demoModalBtn: 'Elegir Foto',
      demoProcessing: 'Analizando alimentos...'
    },
    howItWorks: {
      title: 'Flujo sin fricción',
      subtitle: 'Eliminamos la complejidad de rastrear tu dieta. Solo apunta y envía.',
      step1Title: 'Captura Visual',
      step1Desc: 'Toma una foto clara de tu plato. Nuestra IA acepta varios ángulos e identifica múltiples elementos.',
      step2Title: 'Envío Instantáneo',
      step2Desc: 'Comparte vía WhatsApp. Sin formularios, sin inicios de sesión complejos, sin barreras.',
      step3Title: 'Análisis Detallado',
      step3Desc: 'Recibe el informe nutricional completo y haz preguntas al asistente en tiempo real.'
    },
    features: {
      guruTitle: 'IA Avançada',
      mainTitle: 'Tu nutricionista de bolsillo, 24/7.',
      subtitle: 'No solo entregamos números. Nuestra IA entiende el contexto de tu dieta y ofrece feedback cualitativo.',
      f1Title: 'Rayos-X Nutricional',
      f1Desc: 'Identificación automática de ingredientes con desglose detallado de Proteínas, Carbohidratos, Grasas y Fibra.',
      f2Title: 'Sugerencias de Mejora',
      f2Desc: 'La IA no solo lee, opina. Recibe consejos como: "Añade hojas verdes para más saciedad".',
      f3Title: 'Cambios Inteligentes',
      f3Desc: '¿Amas comer bien? La IA sugiere sustituciones sabrosas para reducir calorías sin sacrificar el placer.',
      f4Title: 'Volumetría Visual',
      f4Desc: 'Estimación inteligente de peso basada en la proporción del plato. Jubila la báscula de cocina.',
      f5Title: 'Consultoría Chat',
      f5Desc: 'Pregunta: "¿Puedo comer esto antes de entrenar?" o "¿Cuál es la mejor opción de este menú?".',
      visualTipTitle: 'Smart Insight',
      visualTipDesc: '¡Gran elección de grasas! ¿Qué tal añadir semillas de calabaza para más crujido y zinc?'
    },
    testimonials: {
      title: 'Quien usa, aprueba',
      subtitle: 'Únete a una comunidad enfocada en resultados reales.',
      r1Content: 'La precisión de lectura de macros cambió mi juego. Ya no pierdo tiempo pesando comida.',
      r1Role: 'Atleta de Crossfit',
      r2Content: 'Lo indico a todos mis pacientes. La adhesión al plan aumentó en 40%.',
      r2Role: 'Nutricionista Deportiva',
      r3Content: 'Interfaz limpia, rápida y sin fricción. Exactamente lo que necesitaba.',
      r3Role: 'Ingeniero de Software'
    },
    pricing: {
      title: 'Planes Pro',
      subtitle: 'Elige la flexibilidad que tu estilo de vida exige.',
      secure: 'Pago seguro vía Stripe. Cancela cuando quieras.',
      plans: {
        monthly: {
          title: 'Plan Único PRO',
          price: '€ 4,99',
          period: '/primer mes',
          billingInfo: 'Luego € 14,99/mes. Cancela cuando quieras.',
          description: 'Prueba el plan completo FoodSnap PRO el primer mes por solo € 4,99.',
          btnText: 'Suscribir Ahora',
          features: [
            'Consultas Ilimitadas',
            'Chat con Nutricionista IA',
            'Historial Ilimitado',
            'Análisis de Micronutrientes'
          ]
        },
        quarterly: {
          title: 'Trimestral',
          price: '€ 11,90',
          period: '/mes',
          billingInfo: 'Cobrado cada 3 meses',
          description: 'Compromiso a medio plazo.',
          btnText: 'Elegir Trimestral',
          features: [
            'Todo lo del Mensual',
            'Soporte Prioritario',
            'Ahorra 20%',
            'Acceso a funciones Beta'
          ]
        },
        annual: {
          title: 'Anual',
          price: '€ 9,90',
          period: '/mes',
          billingInfo: 'Cobrado anualmente',
          description: 'El favorito para resultados.',
          btnText: 'Suscribir Anual',
          highlight: 'Mejor Valor',
          savings: 'Ahorra 40%',
          features: [
            'Todo lo del Trimestral',
            'Reportes de Evolución',
            'Soporte VIP',
            'Precio congelado por 1 año'
          ]
        }
      }
    },
    faq: {
      title: 'Preguntas Frecuentes',
      q1: '¿La información es 100% precisa?',
      a1: 'No. Los análisis son estimaciones visuales. Factores como la preparación pueden variar. Úsalo como guía.',
      q2: '¿Funciona con cualquier comida?',
      a2: '¡Sí! Funciona con platos caseros, fiambreras, restaurantes y comida rápida.',
      q3: '¿Necesito instalar una app?',
      a3: 'No. Todo funciona directamente por WhatsApp.',
      q4: '¿Puedo cancelar cuando quiera?',
      a4: 'Sí, sin fidelidad. Cancela la suscripción Pro en cualquier momento.'
    },
    faqPage: {
      title: 'Centro de Ayuda',
      subtitle: 'Encuentra respuestas a tus dudas sobre FoodSnap.ai',
      searchPlaceholder: 'Busca tu duda (ej: cancelar, whatsapp...)',
      backHome: 'Volver al Inicio',
      categories: {
        general: {
          title: 'General',
          items: [
            { q: '¿Qué es FoodSnap.ai?', a: 'FoodSnap.ai es un servicio de nutrición inteligente que usa inteligencia artificial para analizar fotos de tus comidas, calcular calorías/macros y dar feedback en tiempo real vía WhatsApp.' },
            { q: '¿Cómo funciona el análisis?', a: 'Solo envía una foto de tu plato a nuestro número de WhatsApp. Nuestra IA identifica los alimentos, estima porciones y devuelve un informe nutricional completo en segundos.' },
            { q: '¿Necesito una app?', a: 'No. Todo funciona dentro de WhatsApp. También tienes acceso a un panel web para ver tu historial completo y gráficos de evolución.' }
          ]
        },
        account: {
          title: 'Mi Cuenta',
          items: [
            { q: '¿Cómo cambio mi contraseña?', a: 'Puedes restablecer tu contraseña en la pantalla de inicio de sesión haciendo clic en "¿Olvidaste tu contraseña?" o dentro del panel de usuario en configuración.' },
            { q: '¿Puedo compartir mi cuenta?', a: 'La suscripción es individual. El historial y las recomendaciones están personalizados para un único perfil de usuario.' },
            { q: '¿Cómo cambio mi teléfono registrado?', a: 'Actualmente, para cambiar el teléfono vinculado a WhatsApp, contacta con soporte vía chat en el panel.' }
          ]
        },
        billing: {
          title: 'Planes y Pagos',
          items: [
            { q: '¿Métodos de pago?', a: 'Aceptamos tarjetas de crédito (Visa, Mastercard, Amex) a través de la plataforma segura Stripe.' },
            { q: '¿Hay permanencia?', a: 'El plan mensual no tiene permanencia. Los planes trimestrales y anuales tienen compromiso por el período contratado a cambio de un descuento.' },
            { q: '¿Cómo cancelo?', a: 'Accede al Panel de Usuario > Mi Suscripción > Portal de Cliente. Puedes cancelar la renovación automática allí en cualquier momento.' },
            { q: '¿Política de reembolso?', a: 'Sí, ofrecemos garantía incondicional de 7 días para nuevos suscriptores. Si no te gusta, devolvemos el 100%.' }
          ]
        },
        technical: {
          title: 'Soporte Técnico',
          items: [
            { q: 'El bot no responde en WhatsApp', a: 'Verifica si guardaste el número correctamente y si tu plan está activo. A veces puede haber una breve cola de procesamiento. Intenta enviar "Hola" para reiniciar.' },
            { q: 'La IA identificó mal mi plato', a: 'Aunque raro, pueden ocurrir imprecisiones. Intenta tomar fotos con buena iluminación donde todos los ingredientes sean visibles. Puedes enviar un texto corrigiendo (ej: "no es pollo, es pescado") y la IA ajustará.' }
          ]
        }
      }
    },
    footer: {
      ctaTitle: '¿Listo para tomar el control?',
      ctaDesc: 'Sin hojas de cálculo complejas, sin básculas. Solo tú, tu comida y la mejor tecnología de IA.',
      ctaBtn: 'Acceder a FoodSnap',
      desc: 'Inteligencia Artificial aplicada a la nutrición para simplificar la vida de quien busca salud.',
      platform: 'Plataforma',
      legal: 'Legal',
      connect: 'Conectar',
      rights: 'Todos los derechos reservados.'
    },
    auth: {
      welcomeBack: 'Bienvenido de nuevo',
      createAccount: 'Crea tu cuenta',
      completeProfile: 'Completa tu perfil',
      accessPanel: 'Accede a tu panel e historial.',
      fillToAccess: 'Rellena para acceder a la IA.',
      confirmPhone: 'Confirma tu WhatsApp para recibir análisis.',
      nameLabel: 'Nombre Completo',
      phoneLabel: 'WhatsApp (con código país)',
      emailLabel: 'Correo Electrónico',
      passwordLabel: 'Contraseña',
      phonePlaceholder: '34600123456',
      phoneHelper: 'Solo números, incluye código de país.',
      btnRegister: 'Crear Cuenta Gratis',
      btnLogin: 'Entrar al Panel',
      btnSave: 'Guardar y Continuar',
      btnSuccess: '¡Éxito!',
      googleBtn: 'Google',
      or: 'O continúa con',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      registerLink: 'Regístrate',
      loginLink: 'Inicia sesión',
      security: 'Datos protegidos y encriptados.',
      errorRequired: 'Todos los campos son obligatorios.',
      errorPhone: 'WhatsApp inválido.',
      successRegister: '¡Cuenta creada!',
      successLogin: '¡Login exitoso!'
    },
    dashboard: {
      menuOverview: 'Visión General',
      menuHistory: 'Historial',
      menuSubscription: 'Suscripción',
      logout: 'Cerrar sesión',
      hello: 'Hola',
      status: 'Estado',
      statDishes: 'Platos Analisados',
      statDishesSub: 'Total registrado',
      statCals: 'Promedio Calorías',
      statCalsSub: 'kcal/comida',
      statPlan: 'Plan Actual',
      activeSub: 'Suscripción Activa',
      trialSub: 'Prueba Gratis',
      upgradeSub: 'Mejora Disponible',
      eatTitle: '¿Vas a comer algo ahora?',
      eatDesc: 'Envía una foto a nuestro WhatsApp o súbela directamente aquí para registrar.',
      btnHistory: 'Ver Historial',
      btnWhatsapp: 'WhatsApp',
      recentTitle: 'Recentes',
      viewAll: 'Ver todo',
      emptyRecent: 'Ningún plato registrado aún. ¡Toma una foto!',
      historyTitle: 'Historial de Comidas',
      historySubtitle: 'Todos tus análisis guardados automáticamente.',
      searchPlaceholder: 'Buscar plato...',
      emptyHistory: 'Aún no has enviado ninguna foto.',
      subTitle: 'Gestionar Suscripción',
      subDesc: 'Controla tus pagos y plan vía Stripe.',
      currentPlan: 'Plan Actual',
      validUntil: 'Válido hasta:',
      limitedAccess: 'Acceso limitado al plan gratuito.',
      portalText: '¿Deseas cambiar tu tarjeta de crédito o cancelar la suscripción?',
      btnPortal: 'Abrir Portal de Cliente',
      upgradeTitle: 'Mejora al PRO',
      upgradeDesc: 'Desbloquea historial ilimitado, análisis detallados y soporte prioritario.',
      btnUpgrade: 'Suscribir por € 9,90/mes',
      btnUpgradeShort: 'Obtener Pro',
      connectTitle: 'Conectar ahora',
      connectDesc: 'Sigue los pasos para activar la IA en WhatsApp.',
      step1: 'Escanea el Código QR',
      step2: 'Envía "Hola"',
      step3: 'Envía una foto de tu plato',
      scanLabel: 'Escanea para iniciar'
    },
    tools: {
      title: 'Herramientas Gratuitas',
      subtitle: 'Calculadoras esenciales para tu viaje.',
      bmi: {
        title: 'Calculadora de IMC',
        desc: 'Descubre tu Índice de Massa Corporal.',
        labelWeight: 'Peso (kg)',
        labelHeight: 'Altura (cm)',
        result: 'Tu IMC es'
      },
      water: {
        title: 'Hidratación Diaria',
        desc: 'Descubre cuánta agua debes beber.',
        result: 'Tu meta es',
        daily: 'litros al día'
      },
      bmr: {
        title: 'Gasto Calórico (TMB)',
        desc: 'Cuántas calorías quemas en reposo.',
        labelAge: 'Edad',
        labelGender: 'Género',
        male: 'Hombre',
        female: 'Mujer',
        result: 'Tu TMB es'
      },
      tdee: {
        title: 'Gasto Total (TDEE)',
        desc: 'Calorías diarias considerando actividad.',
        activity: 'Nivel de Actividad',
        sedentary: 'Sedentario',
        light: 'Ligeramente Activo',
        moderate: 'Moderadamente Activo',
        active: 'Muy Activo',
        veryActive: 'Atleta / Extremo',
        result: 'Gasto Diario'
      },
      orm: {
        title: 'Fuerza Máxima (1RM)',
        desc: 'Carga máxima teórica para 1 repetição.',
        lift: 'Peso Levantado (kg)',
        reps: 'Repeticiones',
        result: 'Tu 1RM Estimado'
      },
      bodyfat: {
        title: 'Grasa Corporal',
        desc: 'Estimación basada en el método de la Marina.',
        waist: 'Cintura (cm)',
        neck: 'Cuello (cm)',
        hip: 'Cadera (cm)',
        result: 'Grasa Estimada'
      },
      hr: {
        title: 'Zonas de FC',
        desc: 'Frecuencia Cardíaca Máxima y Zonas.',
        result: 'FC Máxima',
        zone: 'Zona Quema Grasa'
      },
      calculate: 'Calcular',
      back: 'Volver'
    },
    coach: {
      title: 'Entrenador Personal IA',
      subtitle: 'Genera tu protocolo ideal basado en tu biotipo.',
      photosStep: {
        alert: 'Fotos de Evaluación: Usa ropa ligera. Posiciona la cámara a la altura del pecho, cuerpo relajado.',
        front: 'Frente',
        side: 'Perfil',
        back: 'Espalda',
        camera: 'Cámara',
        gallery: 'Galería'
      },
      goalStep: {
        title: '¿Cuál es tu objetivo principal?',
        hypertrophy: { title: 'Hipertrofia', desc: 'Ganar masa muscular y volumen.' },
        definition: { title: 'Definición', desc: 'Quemar grasa y definir músculos.' },
        maintenance: { title: 'Salud y Mantenimiento', desc: 'Mejorar alimentación y energía.' },
        strength: { title: 'Fuerza Pura', desc: 'Enfocar en progresión de carga.' }
      },
      processing: {
        errorTitle: '¡Ups! Algo salió mal.',
        retry: 'Intentar de Nuevo',
        analyzing: 'Buscando biotipo...',
        wait: 'La IA está procesando tus fotos. Esto puede tardar hasta 30 segundos.',
        steps: [
          "Identificando Biotipo...",
          "Analizando Postura y Simetría...",
          "Calculando Estimación de Grasa...",
          "Ajustando Macros para tu Objetivo...",
          "Generando Rutina de Entrenamiento..."
        ]
      },
      buttons: {
        next: 'Siguiente',
        back: 'Volver',
        generate: 'Generar Protocolo'
      }
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: dictionary[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};