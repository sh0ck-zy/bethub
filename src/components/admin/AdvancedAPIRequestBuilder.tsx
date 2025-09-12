'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  RefreshCw, 
  Eye, 
  Code, 
  Play, 
  Copy,
  ExternalLink,
  Clock,
  Database,
  Globe,
  Zap,
  CheckCircle,
  AlertTriangle,
  Settings,
  FileText
} from 'lucide-react';

// Football-Data.org API configuration
const FOOTBALL_DATA_CONFIG = {
  baseUrl: 'https://api.football-data.org/v4',
  rateLimits: {
    free: { requests: 10, period: 'minute', dailyLimit: 10 },
    paid: { requests: 100, period: 'minute', dailyLimit: null }
  },
  competitions: [
    { code: 'WC', name: 'FIFA World Cup', area: 'World' },
    { code: 'CL', name: 'UEFA Champions League', area: 'Europe' },
    { code: 'EL', name: 'UEFA Europa League', area: 'Europe' },
    { code: 'EC', name: 'European Championship', area: 'Europe' },
    { code: 'PL', name: 'Premier League', area: 'England' },
    { code: 'ELC', name: 'Championship', area: 'England' },
    { code: 'DED', name: 'Eredivisie', area: 'Netherlands' },
    { code: 'BSA', name: 'Campeonato Brasileiro Série A', area: 'Brazil' },
    { code: 'PD', name: 'Primera División', area: 'Spain' },
    { code: 'BL1', name: 'Bundesliga', area: 'Germany' },
    { code: 'SA', name: 'Serie A', area: 'Italy' },
    { code: 'FL1', name: 'Ligue 1', area: 'France' },
    { code: 'PPL', name: 'Primeira Liga', area: 'Portugal' }
  ],
  endpoints: {
    competitions: '/competitions',
    matches: '/matches',
    teams: '/teams',
    persons: '/persons',
    areas: '/areas'
  }
};

interface APIRequest {
  endpoint: string;
  method: 'GET';
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  fullUrl: string;
}

interface APIResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
  timing: number;
  requestId: string;
}

interface RequestLog {
  id: string;
  timestamp: string;
  request: APIRequest;
  response?: APIResponse;
  error?: string;
  status: 'pending' | 'success' | 'error';
}

export function AdvancedAPIRequestBuilder() {
  // Request Builder State
  const [selectedEndpoint, setSelectedEndpoint] = useState('matches');
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>(['PL', 'CL']);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    return tomorrow.toISOString().split('T')[0];
  });
  const [customParams, setCustomParams] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState('');

  // Request Execution State
  const [isExecuting, setIsExecuting] = useState(false);
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Rate Limiting State
  const [requestsUsed, setRequestsUsed] = useState(0);
  const [resetTime, setResetTime] = useState<Date | null>(null);

  // Current Request Preview
  const [currentRequest, setCurrentRequest] = useState<APIRequest | null>(null);

  // Load API key from environment or localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('football-data-api-key') || '';
    setApiKey(savedKey);
  }, []);

  // Update request preview when parameters change
  useEffect(() => {
    buildRequest();
  }, [selectedEndpoint, selectedCompetitions, dateFrom, dateTo, customParams, apiKey]);

  const buildRequest = () => {
    let endpoint = '';
    const queryParams: Record<string, string> = { ...customParams };

    switch (selectedEndpoint) {
      case 'matches':
        endpoint = '/matches';
        if (dateFrom) queryParams.dateFrom = dateFrom;
        if (dateTo) queryParams.dateTo = dateTo;
        if (selectedCompetitions.length === 1) {
          endpoint = `/competitions/${selectedCompetitions[0]}/matches`;
        }
        break;
      case 'competitions':
        endpoint = '/competitions';
        break;
      case 'teams':
        if (selectedCompetitions.length === 1) {
          endpoint = `/competitions/${selectedCompetitions[0]}/teams`;
        } else {
          endpoint = '/teams';
        }
        break;
      case 'standings':
        if (selectedCompetitions.length === 1) {
          endpoint = `/competitions/${selectedCompetitions[0]}/standings`;
        } else {
          endpoint = '/competitions/PL/standings'; // Default
        }
        break;
    }

    const queryString = Object.keys(queryParams).length > 0 
      ? '?' + Object.entries(queryParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
      : '';

    const request: APIRequest = {
      endpoint,
      method: 'GET',
      headers: {
        'X-Auth-Token': apiKey || '[API_KEY]',
        'Accept': 'application/json'
      },
      queryParams,
      fullUrl: `${FOOTBALL_DATA_CONFIG.baseUrl}${endpoint}${queryString}`
    };

    setCurrentRequest(request);
  };

  const executeRequest = async () => {
    if (!currentRequest || !apiKey) return;

    const requestId = Date.now().toString();
    const startTime = Date.now();

    const logEntry: RequestLog = {
      id: requestId,
      timestamp: new Date().toISOString(),
      request: currentRequest,
      status: 'pending'
    };

    setRequestLogs(prev => [logEntry, ...prev]);
    setSelectedLogId(requestId);
    setIsExecuting(true);

    try {
      const response = await fetch(currentRequest.fullUrl, {
        method: 'GET',
        headers: {
          'X-Auth-Token': apiKey,
          'Accept': 'application/json'
        }
      });

      const timing = Date.now() - startTime;
      const data = await response.json();
      const responseHeaders: Record<string, string> = {};
      
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Update rate limiting info
      if (responseHeaders['x-requests-available-minute']) {
        setRequestsUsed(10 - parseInt(responseHeaders['x-requests-available-minute']));
      }

      const apiResponse: APIResponse = {
        status: response.status,
        data,
        headers: responseHeaders,
        timing,
        requestId
      };

      setRequestLogs(prev => 
        prev.map(log => 
          log.id === requestId 
            ? { ...log, response: apiResponse, status: 'success' }
            : log
        )
      );

    } catch (error) {
      setRequestLogs(prev => 
        prev.map(log => 
          log.id === requestId 
            ? { ...log, error: error instanceof Error ? error.message : 'Unknown error', status: 'error' }
            : log
        )
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const copyRequestURL = () => {
    if (currentRequest) {
      navigator.clipboard.writeText(currentRequest.fullUrl);
    }
  };

  const ingestMatches = async () => {
    if (!selectedLog?.response?.data?.matches) {
      alert('Please execute a matches request first and ensure it returns match data.');
      return;
    }

    const matches = selectedLog.response.data.matches;
    if (!Array.isArray(matches) || matches.length === 0) {
      alert('No matches found in the response to ingest.');
      return;
    }

    if (!confirm(`Are you sure you want to ingest ${matches.length} matches into the database?`)) {
      return;
    }

    try {
      const response = await fetch('/api/v1/admin/ingest-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Successfully ingested ${result.data?.matches_upserted || 0} matches!`);
      } else {
        alert(`❌ Error: ${result.error || 'Failed to ingest matches'}`);
      }
    } catch (error) {
      console.error('Error ingesting matches:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };

  const selectedLog = requestLogs.find(log => log.id === selectedLogId);

  return (
    <div className="space-y-6">
      {/* API Configuration Header */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Football-Data.org API Explorer</span>
              <Badge variant="outline" className="bg-blue-100">
                v4
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={requestsUsed >= 8 ? "destructive" : "secondary"}>
                {requestsUsed}/10 requests used
              </Badge>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://docs.football-data.org/', '_blank')}
              >
                <FileText className="w-4 h-4 mr-2" />
                API Docs
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Request Builder */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Request Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Key */}
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    localStorage.setItem('football-data-api-key', e.target.value);
                  }}
                  placeholder="Enter your Football-Data.org API key"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get your free API key at football-data.org
                </p>
              </div>

              {/* Endpoint Selection */}
              <div>
                <Label>Endpoint</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(FOOTBALL_DATA_CONFIG.endpoints).map(([key, path]) => (
                    <Button
                      key={key}
                      variant={selectedEndpoint === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedEndpoint(key)}
                      className="justify-start"
                    >
                      <Code className="w-3 h-3 mr-2" />
                      {key}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Competition Selection */}
              <div>
                <Label>Competitions ({selectedCompetitions.length} selected)</Label>
                <div className="max-h-32 overflow-y-auto border rounded-lg p-2 mt-2">
                  <div className="grid grid-cols-1 gap-1">
                    {FOOTBALL_DATA_CONFIG.competitions.map((comp) => (
                      <label key={comp.code} className="flex items-center gap-2 text-sm hover:bg-muted/50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCompetitions.includes(comp.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCompetitions(prev => [...prev, comp.code]);
                            } else {
                              setSelectedCompetitions(prev => prev.filter(c => c !== comp.code));
                            }
                          }}
                          className="rounded"
                        />
                        <Badge variant="outline" className="text-xs min-w-[40px] justify-center">
                          {comp.code}
                        </Badge>
                        <span className="truncate">{comp.name}</span>
                        <span className="text-muted-foreground text-xs ml-auto">
                          {comp.area}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date Range */}
              {selectedEndpoint === 'matches' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date-from">Date From</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-to">Date To</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Custom Parameters */}
              <div>
                <Label>Custom Query Parameters</Label>
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Parameter name"
                      onBlur={(e) => {
                        const key = e.target.value;
                        if (key && !customParams[key]) {
                          setCustomParams(prev => ({ ...prev, [key]: '' }));
                        }
                      }}
                    />
                    <div className="text-sm text-muted-foreground flex items-center">
                      Enter parameter name and press Tab
                    </div>
                  </div>
                  {Object.entries(customParams).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 gap-2">
                      <Input
                        value={key}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          const { [key]: oldValue, ...rest } = customParams;
                          setCustomParams({ ...rest, [newKey]: oldValue });
                        }}
                      />
                      <Input
                        value={value}
                        onChange={(e) => {
                          setCustomParams(prev => ({ ...prev, [key]: e.target.value }));
                        }}
                        placeholder="Value"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Preview */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                Request Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentRequest && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">HTTP Method</Label>
                    <div className="font-mono text-sm bg-muted p-2 rounded">
                      GET
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Full URL</Label>
                    <div className="font-mono text-sm bg-muted p-2 rounded break-all">
                      {currentRequest.fullUrl}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Headers</Label>
                    <div className="font-mono text-sm bg-muted p-2 rounded space-y-1">
                      {Object.entries(currentRequest.headers).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-blue-600">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={executeRequest}
                      disabled={!apiKey || isExecuting}
                      className="flex-1"
                    >
                      {isExecuting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Execute Request
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={copyRequestURL}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Response & Logs */}
        <div className="space-y-6">
          {/* Request History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Request History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {requestLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="w-8 h-8 mx-auto mb-2" />
                    <p>No requests executed yet</p>
                  </div>
                ) : (
                  requestLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedLogId === log.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedLogId(log.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {log.status === 'pending' && (
                            <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
                          )}
                          {log.status === 'success' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {log.status === 'error' && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-mono text-sm">{log.request.endpoint}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      {log.response && (
                        <div className="mt-1 flex items-center gap-4 text-xs">
                          <Badge variant="outline">
                            {log.response.status}
                          </Badge>
                          <span>{log.response.timing}ms</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Response Details */}
          {selectedLog && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Response Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedLog.response ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Badge variant={
                        selectedLog.response.status >= 200 && selectedLog.response.status < 300 
                          ? "default" 
                          : "destructive"
                      }>
                        {selectedLog.response.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedLog.response.timing}ms
                      </span>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Response Data</Label>
                      <div className="max-h-96 overflow-auto bg-muted p-3 rounded font-mono text-sm">
                        <pre>{JSON.stringify(selectedLog.response.data, null, 2)}</pre>
                      </div>
                    </div>
                    
                    {/* Ingest Button for Matches */}
                    {selectedLog.response.data?.matches && Array.isArray(selectedLog.response.data.matches) && (
                      <div className="pt-3 border-t">
                        <Button
                          onClick={ingestMatches}
                          className="w-full"
                          variant="default"
                        >
                          <Database className="w-4 h-4 mr-2" />
                          Ingest {selectedLog.response.data.matches.length} Matches to Database
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          This will add the matches to your database for review and publishing
                        </p>
                      </div>
                    )}
                  </div>
                ) : selectedLog.error ? (
                  <div className="text-red-500 p-3 bg-red-50 rounded">
                    <div className="font-medium">Error</div>
                    <div className="text-sm">{selectedLog.error}</div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p>Request in progress...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}