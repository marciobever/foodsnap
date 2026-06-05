'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { Search, PlusCircle, Users, X, Calendar } from 'lucide-react';

interface StudentsListProps {
    user: User;
}

export const StudentsList: React.FC<StudentsListProps> = ({ user }) => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // New Student Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');

    useEffect(() => {
        fetchStudents();
    }, [user.id]);

    const fetchStudents = async () => {
        try {
            setLoading(true);

            // First, ensure the professional profile exists (Auto-create logic if missing)
            const { data: proProfile } = await supabase
                .from('professionals')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (!proProfile) {
                // Auto-create professional profile if it doesn't exist (First Login)
                await supabase.from('professionals').insert({
                    id: user.id,
                    business_name: user.name,
                    primary_color: '#059669'
                });
            }

            const { data, error } = await supabase
                .from('pro_students')
                .select('*')
                .eq('professional_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStudents(data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('pro_students').insert({
                professional_id: user.id,
                name: newName,
                email: newEmail,
                phone: newPhone,
                status: 'active'
            });

            if (error) throw error;

            setIsCreateOpen(false);
            setNewName('');
            setNewEmail('');
            setNewPhone('');
            fetchStudents(); // Refresh list
        } catch (error) {
            console.error('Error creating student:', error);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Actions */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar aluno por nome ou email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <PlusCircle size={16} />
                        Novo Aluno
                    </button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="p-12 text-center text-gray-400">Carregando alunos...</div>
            ) : filteredStudents.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Users size={32} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Nenhum aluno encontrado</h3>
                    <p className="text-gray-500 text-sm mb-4">Comece adicionando seu primeiro aluno.</p>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="text-brand-600 font-bold text-sm hover:underline"
                    >
                        Adicionar Aluno
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Aluno</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Contato</th>
                                <th className="px-6 py-3">Entrou em</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                            {student.name.substring(0, 2)}
                                        </div>
                                        <span className="truncate max-w-[150px] sm:max-w-none">{student.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${student.status === 'active' ? 'bg-green-100 text-green-700' :
                                            student.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {student.status === 'active' ? 'Ativo' : student.status === 'pending' ? 'Pendente' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex flex-col">
                                            <span>{student.email}</span>
                                            <span className="text-xs">{student.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(student.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-brand-600 font-bold hover:underline">Gerenciar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Novo Aluno</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                                    placeholder="Ex: Maria Silva"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                                    placeholder="Ex: maria@email.com"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Telefone / WhatsApp</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                                    placeholder="Ex: 11 99999-9999"
                                    value={newPhone}
                                    onChange={e => setNewPhone(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors mt-2 shadow-lg shadow-brand-500/20"
                            >
                                Cadastrar Aluno
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
