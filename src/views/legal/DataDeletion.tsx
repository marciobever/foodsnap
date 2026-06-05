import React from 'react';
import { ArrowLeft, Trash2, Mail } from 'lucide-react';

interface DataDeletionProps {
    onBack: () => void;
}

const DataDeletion: React.FC<DataDeletionProps> = ({ onBack }) => {
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

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Exclusão de Dados</h1>
                </div>

                <p className="text-sm text-gray-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                <div className="prose prose-brand max-w-none text-gray-600 space-y-6">
                    <p className="text-lg text-gray-700">
                        De acordo com o Regulamento Geral sobre a Proteção de Dados (GDPR), a Lei Geral de Proteção de Dados Pessoais do Brasil (LGPD) e as políticas da Apple e da Meta, você tem o direito de solicitar a exclusão completa de todos os seus dados armazenados pela nossa plataforma.
                    </p>

                    <section className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            Como Solicitar a Exclusão?
                        </h2>

                        <p className="mb-4">
                            A exclusão de dados do "FoodSnap" engloba a deleção completa de:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 mb-6">
                            <li>Sua conta da plataforma Web (Email e Senha).</li>
                            <li>Todo o seu histórico de peso, perfil físico e objetivos registrados.</li>
                            <li>Ligação e histórico de WhatsApp do nosso banco de dados.</li>
                            <li>Dietas geradas e fotos de pratos não anonimizadas.</li>
                        </ul>

                        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-2">Método 1: Pela Plataforma</h3>
                        <p className="mb-4">
                            Se você possui uma conta de acesso na Dashboard:
                            <br />
                            1. Faça Login em no FoodSnap. <br />
                            2. Navegue até "Meu Perfil" no canto superior direito. <br />
                            3. Rolando até o fim, clique no botão vermelho "Excluir Minha Conta Permanentemente".
                        </p>

                        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-2 flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Método 2: Por E-Mail (Suporte)
                        </h3>
                        <p>
                            Você também pode optar por enviar um e-mail direto para nossa equipe de dados solicitando a exclusão manual.
                            <br /><br />
                            <strong>E-mail de Contato:</strong> <em>privacidade@foodsnap.com.br</em>
                            <br />(ou o email principal de suporte do aplicativo).
                            <br /><br />
                            No corpo do e-mail, inclua seu nome, número de telefone cadastrado no app e email associado. O prazo máximo para o processamento deste tipo de pedido de deleção é de 7 dias úteis.
                        </p>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">O que acontece após a Exclusão?</h2>
                        <p>
                            Assim que seus dados forem apagados, você perderá acesso ao seu histórico de dietas e treinos. Essa ação é irreversível. Por questões de exigências e documentações fiscais/contábeis (como recibos de planos adquiridos do Stripe), partes da sua transação financeira poderão ser retidas sob obrigações da legislação legal de armazenamento, mas desassociadas do seu uso diário do aplicativo.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DataDeletion;
