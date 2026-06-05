import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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

                <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>
                <p className="text-sm text-gray-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                <div className="prose prose-brand max-w-none text-gray-600 space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introdução</h2>
                        <p>
                            A sua privacidade é importante para nós. Esta Política de Privacidade explica como o FoodSnap coleta, usa, compartilha e protege as suas informações pessoais quando você utiliza nossos serviços, site e integração com o WhatsApp.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Coleta de Dados</h2>
                        <p>Os tipos de informações que coletamos incluem:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Informações de Contato:</strong> Número de telefone do WhatsApp para o envio das análises.</li>
                            <li><strong>Dados de Análise:</strong> Imagens de alimentos enviadas voluntariamente pelo usuário para processamento pela nossa Inteligência Artificial.</li>
                            <li><strong>Dados de Perfil:</strong> Altura, peso, gênero e objetivos, caso fornecidos para o plano alimentar.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Como Usamos Seus Dados</h2>
                        <p>Nós utilizamos os dados coletados para:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li>Processar e estimar as calorias dos pratos enviados via IA.</li>
                            <li>Fornecer respostas diretas no WhatsApp pelo modelo do Meta Cloud API.</li>
                            <li>Personalizar a sua experiência e ajustar nossos treinos e dietas gerados por IA.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Compartilhamento e Serviços de Terceiros</h2>
                        <p>
                            Suas imagens e textos podem ser processados com segurança por provedores de IA confiáveis (como Google Gemini) exclusivamente para o ato de gerar os resultados. Não vendemos suas informações para terceiros para fins publicitários em hipótese alguma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Segurança</h2>
                        <p>
                            Empregamos medidas de segurança técnicas e organizacionais para proteger as informações pessoais contra acesso, uso e divulgação não autorizados, em conformidade com as diretrizes da Meta e provedores de nuvem (Supabase).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Contato</h2>
                        <p>
                            Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato através dos nossos canais oficiais de suporte disponíveis no nosso site.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
