import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
    onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <button
                    onClick={onBack}
                    className="flex items-center text-sm text-gray-500 hover:text-brand-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Home
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">Termos de Serviço</h1>
                <p className="text-sm text-gray-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                <div className="prose prose-brand max-w-none text-gray-600 space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar ou utilizar a plataforma FoodSnap via site, aplicativo ou integração de WhatsApp, você confirma que leu, compreendeu e concorda em ficar vinculado a estes Termos de Serviço. Se não concordar, você não deve usar nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Descrição dos Serviços</h2>
                        <p>
                            O FoodSnap é uma plataforma que utiliza inteligência artificial para análise de imagens de pratos visando a estimativa de calorias e macros, e a geração de planos de exercícios e dieta. O envio pode ser feito primariamente pela interface web ou pelo nosso robô oficial (Cloud API) do WhatsApp.
                        </p>
                        <p>
                            Nota médica: As sugestões de dieta e calorias oferecidas pelo sistema baseiam-se em modelos matemáticos e de IA. <strong>Eles não substituem orientação de médicos e nutricionistas reais.</strong>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Contas de Usuário</h2>
                        <p>
                            Para acessar certos recursos, inclusive planos PRO, relatórios aprimorados e limites mais altos, você pode ser solicitado a criar uma conta. Você é responsável por manter a confidencialidade de sua senha (quando aplicável) e atividades. Contas podem ser encerradas ou limitadas se o serviço for abusado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Conduta no WhatsApp e Site</h2>
                        <p>
                            Ao usar a integração do WhatsApp, você concorda em usar os recursos apenas para o fim de escanear pratos e conversar com o "Coach" sobre treinos e dietas. Abuso visual (envio de imagens pornográficas, de ódio ou ilegais) para o modelo de IA pode resultar no banimento imediato e sem reembolso do número do WhatsApp e conta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Assinaturas e Pagamentos</h2>
                        <p>
                            Em compras do "Plano PRO", o acesso às funcionalidades premium é fornecido enquanto a respectiva assinatura ou compra estiver ativa e/ou válida conforme definido no checkout. Os valores e recorrências serão indicados em nosso "checkout".
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Limitação de Responsabilidade</h2>
                        <p>
                            Em nenhuma circunstância o FoodSnap se responsabilizará por danos diretos, indiretos, perdas de lucros ou físicos causados pela adoção imprudente dos treinos sugeridos ou lesões ocorridas. A adoção dos modelos é por conta e risco do usuário, avaliando sua própria saúde prévia.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
