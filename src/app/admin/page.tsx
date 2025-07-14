// src/app/admin/page.tsx - Simplified Admin Panel
'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Brain,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { adminApiGet, adminApiPost } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';

// Simplified interfaces
interface AdminMatch {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
  is_published: boolean;
  analysis_status: 'none' | 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at?: string;
}

interface RealMatch {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: 'PRE' | 'LIVE' | 'FT';
  submitted_for_analysis?: boolean;
}

// Available Matches Panel (Pool 1)
function AvailableMatchesPanel() {
  const [realMatches, setRealMatches] = useState<RealMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submittingMatches, setSubmittingMatches] = useState<Set<string>>(new Set());

  const fetchRealMatches = async () => {
    setIsLoading(true);
    try {
      const response = await adminApiGet('/api/v1/admin/real-matches?days=7');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRealMatches(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching real matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitForAnalysis = async (match: RealMatch) => {
    setSubmittingMatches(prev => new Set(prev).add(match.id));
    
    try {
      const response = await adminApiPost('/api/v1/admin/submit-for-analysis', {
        matchId: match.id,
        league: match.league,
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        kickoffUtc: match.kickoff_utc
      });

      if (response.ok) {
        setRealMatches(prev => 
          prev.map(m => 
            m.id === match.id 
              ? { ...m, submitted_for_analysis: true }
              : m
          )
        );
      }
    } catch (error) {
      console.error('Error submitting for analysis:', error);
    } finally {
      setSubmittingMatches(prev => {
        const newSet = new Set(prev);
        newSet.delete(match.id);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchRealMatches();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Jogos Disponíveis para Análise</span>
            </span>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {realMatches.length} jogos
              </Badge>
              <Button onClick={fetchRealMatches} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando jogos...</span>
            </div>
          ) : realMatches.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum jogo disponível para análise.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {realMatches.map((match) => (
                <Card key={match.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{match.league}</Badge>
                        <Badge variant="secondary">{match.status}</Badge>
                        {match.submitted_for_analysis && (
                          <Badge variant="default" className="bg-blue-500">
                            Submetido
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-lg">
                        {match.home_team} vs {match.away_team}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(match.kickoff_utc).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!match.submitted_for_analysis ? (
                        <Button
                          onClick={() => submitForAnalysis(match)}
                          disabled={submittingMatches.has(match.id)}
                          size="sm"
                        >
                          {submittingMatches.has(match.id) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Brain className="w-4 h-4 mr-2" />
                          )}
                          Analisar
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Submetido</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Analyzed Matches Panel (Pool 2)
function AnalyzedMatchesPanel() {
  const [analyzedMatches, setAnalyzedMatches] = useState<AdminMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalyzedMatches = async () => {
    setIsLoading(true);
    try {
      const response = await adminApiGet('/api/v1/admin/analyzed-matches');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalyzedMatches(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching analyzed matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async (match: AdminMatch) => {
    try {
      const response = await adminApiPost(`/api/v1/admin/matches/${match.id}/toggle-publish`, { 
        isPublished: !match.is_published 
      });

      if (response.ok) {
        setAnalyzedMatches(prev => 
          prev.map(m => 
            m.id === match.id 
              ? { ...m, is_published: !m.is_published }
              : m
          )
        );
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  useEffect(() => {
    fetchAnalyzedMatches();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Jogos Analisados</span>
            </span>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {analyzedMatches.length} jogos
              </Badge>
              <Badge variant="outline">
                {analyzedMatches.filter(m => m.is_published).length} publicados
              </Badge>
              <Button onClick={fetchAnalyzedMatches} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando jogos analisados...</span>
            </div>
          ) : analyzedMatches.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum jogo analisado disponível.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Submeta jogos para análise na aba "Jogos Disponíveis".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyzedMatches.map((match) => (
                <Card key={match.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{match.league}</Badge>
                        <Badge variant="secondary">{match.status}</Badge>
                        <Badge 
                          variant={match.analysis_status === 'completed' ? 'default' : 'destructive'}
                          className={match.analysis_status === 'completed' ? 'bg-green-500' : 'bg-red-500'}
                        >
                          {match.analysis_status === 'completed' ? 'Analisado' : 'Falhou'}
                        </Badge>
                        {match.is_published && (
                          <Badge variant="default" className="bg-blue-500">
                            Publicado
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-lg">
                        {match.home_team} vs {match.away_team}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(match.kickoff_utc).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => togglePublish(match)}
                        variant={match.is_published ? "destructive" : "default"}
                        size="sm"
                      >
                        {match.is_published ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Despublicar
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Publicar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main admin page component
export default function AdminPage() {
  const { user } = useAuth();
  const { isAdmin, isAuthenticated: isDemoAuthenticated } = useRoleSelector();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const finalIsAdmin = isAdmin || (user?.email && ['admin@bethub.com'].includes(user.email));
  const finalIsAuthenticated = isDemoAuthenticated || !!user;

  // Redirect non-admin users
  useEffect(() => {
    if (!finalIsAdmin && finalIsAuthenticated) {
      router.push('/');
    }
  }, [finalIsAdmin, finalIsAuthenticated, router]);

  // Show access denied for non-admin users
  if (!finalIsAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onLoginClick={() => setShowAuthModal(true)}
          showAuthModal={showAuthModal}
          setShowAuthModal={setShowAuthModal}
          currentPage="admin"
        />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Acesso Admin Necessário</h2>
              <p className="text-muted-foreground">Precisa de privilégios de administrador para aceder a esta página.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        onLoginClick={() => setShowAuthModal(true)}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        currentPage="admin"
      />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Painel Admin</h1>
            <p className="text-muted-foreground">Gerir análise e publicação de jogos</p>
          </div>
          
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">📅 Jogos para Analisar</TabsTrigger>
              <TabsTrigger value="analyzed">🧠 Jogos Analisados</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available" className="space-y-4">
              <AvailableMatchesPanel />
            </TabsContent>
            
            <TabsContent value="analyzed" className="space-y-4">
              <AnalyzedMatchesPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}