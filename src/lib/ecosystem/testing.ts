/**
 * Pipeline Testing Module - Comprehensive Testing for Autonomous Pipeline
 * Provides testing utilities and validation for the entire content pipeline
 */

import { eventBus } from './event-bus';
import { pipelineOrchestrator } from './orchestrator';
import { discoveryModule } from './discovery';
import { intelligenceModule } from './intelligence';
import { newsAggregationModule } from './news-aggregation';
import { aiAnalysisModule } from './ai-analysis';
import { qualityControlModule } from './quality-control';
import { publicationModule } from './publication';
import { competitionManager } from './competition-config';
import { supabase } from '../supabase';

export interface TestResult {
  test_id: string;
  test_name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number; // milliseconds
  details: string;
  error?: string;
  timestamp: string;
}

export interface TestSuite {
  suite_name: string;
  total_tests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
  overall_status: 'passed' | 'failed' | 'partial';
}

export interface PipelineTestReport {
  test_run_id: string;
  test_suites: TestSuite[];
  overall_status: 'passed' | 'failed' | 'partial';
  total_duration: number;
  environment: string;
  timestamp: string;
  pipeline_health_before: any;
  pipeline_health_after: any;
}

/**
 * Pipeline Testing Module - Comprehensive testing for autonomous pipeline
 */
export class PipelineTestingModule {
  private testResults: TestResult[] = [];
  private currentTestRun: string = '';

  /**
   * Run comprehensive pipeline tests
   */
  async runFullTestSuite(): Promise<PipelineTestReport> {
    const testRunId = `test_run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentTestRun = testRunId;
    this.testResults = [];

    console.log(`[Testing] Starting comprehensive pipeline test suite: ${testRunId}`);
    const startTime = Date.now();

    // Get initial pipeline health
    const healthBefore = await pipelineOrchestrator.getStatus();

    const testSuites: TestSuite[] = [];

    try {
      // Run test suites
      testSuites.push(await this.runModuleTests());
      testSuites.push(await this.runIntegrationTests());
      testSuites.push(await this.runPerformanceTests());
      testSuites.push(await this.runDataQualityTests());
      testSuites.push(await this.runErrorHandlingTests());

      // Calculate overall results
      const totalTests = testSuites.reduce((sum, suite) => sum + suite.total_tests, 0);
      const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passed, 0);
      const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failed, 0);

      const overallStatus: 'passed' | 'failed' | 'partial' = 
        totalFailed === 0 ? 'passed' : 
        totalPassed === 0 ? 'failed' : 'partial';

      // Get final pipeline health
      const healthAfter = await pipelineOrchestrator.getStatus();

      const report: PipelineTestReport = {
        test_run_id: testRunId,
        test_suites: testSuites,
        overall_status: overallStatus,
        total_duration: Date.now() - startTime,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        pipeline_health_before: healthBefore,
        pipeline_health_after: healthAfter
      };

      console.log(`[Testing] Test suite completed: ${overallStatus} (${totalPassed}/${totalTests} passed)`);
      return report;

    } catch (error) {
      console.error('[Testing] Test suite failed:', error);
      throw error;
    }
  }

  /**
   * Test individual modules
   */
  private async runModuleTests(): Promise<TestSuite> {
    console.log('[Testing] Running module tests...');
    const startTime = Date.now();
    const results: TestResult[] = [];

    // Test Discovery Module
    results.push(await this.testModule('discovery', async () => {
      const stats = await discoveryModule.getStats();
      if (typeof stats.is_running !== 'boolean') throw new Error('Invalid stats format');
      return 'Discovery module responding correctly';
    }));

    // Test Intelligence Module
    results.push(await this.testModule('intelligence', async () => {
      const stats = await intelligenceModule.getStats();
      if (typeof stats.queue_size !== 'number') throw new Error('Invalid stats format');
      return 'Intelligence module responding correctly';
    }));

    // Test News Aggregation Module
    results.push(await this.testModule('news-aggregation', async () => {
      const stats = await newsAggregationModule.getStats();
      if (typeof stats.is_processing !== 'boolean') throw new Error('Invalid stats format');
      return 'News aggregation module responding correctly';
    }));

    // Test AI Analysis Module
    results.push(await this.testModule('ai-analysis', async () => {
      const stats = await aiAnalysisModule.getStats();
      if (typeof stats.queue_size !== 'number') throw new Error('Invalid stats format');
      return 'AI analysis module responding correctly';
    }));

    // Test Quality Control Module
    results.push(await this.testModule('quality-control', async () => {
      const stats = await qualityControlModule.getStats();
      if (typeof stats.queue_size !== 'number') throw new Error('Invalid stats format');
      return 'Quality control module responding correctly';
    }));

    // Test Publication Module
    results.push(await this.testModule('publication', async () => {
      const stats = await publicationModule.getStats();
      if (typeof stats.total_published !== 'number') throw new Error('Invalid stats format');
      return 'Publication module responding correctly';
    }));

    return this.createTestSuite('Module Tests', results, Date.now() - startTime);
  }

  /**
   * Test module integration and event flow
   */
  private async runIntegrationTests(): Promise<TestSuite> {
    console.log('[Testing] Running integration tests...');
    const startTime = Date.now();
    const results: TestResult[] = [];

    // Test Event Bus
    results.push(await this.testModule('event-bus', async () => {
      let eventReceived = false;
      
      const testHandler = () => {
        eventReceived = true;
      };

      eventBus.on('system.error', testHandler);
      
      await eventBus.emit({
        id: 'test_event',
        type: 'system.error',
        timestamp: new Date().toISOString(),
        source: 'testing',
        data: { test: true }
      } as any);

      eventBus.off('system.error', testHandler);

      if (!eventReceived) throw new Error('Event not received');
      return 'Event bus working correctly';
    }));

    // Test Competition Manager
    results.push(await this.testModule('competition-manager', async () => {
      const testMatch = {
        league: 'Premier League',
        home_team: 'Arsenal',
        away_team: 'Chelsea',
        kickoff_utc: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const result = competitionManager.shouldCoverMatch(testMatch);
      if (typeof result.should_cover !== 'boolean') throw new Error('Invalid response format');
      return 'Competition manager working correctly';
    }));

    // Test Database Connectivity
    results.push(await this.testModule('database-connectivity', async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('id')
        .limit(1);

      if (error) throw new Error(`Database error: ${error.message}`);
      return 'Database connectivity working';
    }));

    // Test Pipeline Orchestrator
    results.push(await this.testModule('pipeline-orchestrator', async () => {
      const status = await pipelineOrchestrator.getStatus();
      if (typeof status.is_running !== 'boolean') throw new Error('Invalid status format');
      return 'Pipeline orchestrator responding correctly';
    }));

    return this.createTestSuite('Integration Tests', results, Date.now() - startTime);
  }

  /**
   * Test performance characteristics
   */
  private async runPerformanceTests(): Promise<TestSuite> {
    console.log('[Testing] Running performance tests...');
    const startTime = Date.now();
    const results: TestResult[] = [];

    // Test Event Bus Performance
    results.push(await this.testModule('event-bus-performance', async () => {
      const eventCount = 100;
      const testStart = Date.now();

      for (let i = 0; i < eventCount; i++) {
        await eventBus.emit({
          id: `perf_test_${i}`,
          type: 'system.error',
          timestamp: new Date().toISOString(),
          source: 'performance-test',
          data: { iteration: i }
        } as any);
      }

      const duration = Date.now() - testStart;
      const eventsPerSecond = (eventCount / duration) * 1000;

      if (eventsPerSecond < 10) throw new Error(`Low event throughput: ${eventsPerSecond.toFixed(1)} events/sec`);
      return `Event bus performance: ${eventsPerSecond.toFixed(1)} events/sec`;
    }));

    // Test Database Query Performance
    results.push(await this.testModule('database-performance', async () => {
      const queryStart = Date.now();
      
      const { data, error } = await supabase
        .from('matches')
        .select('id, league, home_team, away_team, kickoff_utc')
        .limit(100);

      const queryDuration = Date.now() - queryStart;

      if (error) throw new Error(`Query failed: ${error.message}`);
      if (queryDuration > 5000) throw new Error(`Slow query: ${queryDuration}ms`);
      
      return `Database query performance: ${queryDuration}ms for 100 records`;
    }));

    // Test Memory Usage
    results.push(await this.testModule('memory-usage', async () => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      
      if (heapUsedMB > 500) throw new Error(`High memory usage: ${heapUsedMB}MB`);
      return `Memory usage: ${heapUsedMB}MB heap used`;
    }));

    return this.createTestSuite('Performance Tests', results, Date.now() - startTime);
  }

  /**
   * Test data quality and validation
   */
  private async runDataQualityTests(): Promise<TestSuite> {
    console.log('[Testing] Running data quality tests...');
    const startTime = Date.now();
    const results: TestResult[] = [];

    // Test Match Data Integrity
    results.push(await this.testModule('match-data-integrity', async () => {
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .limit(10);

      if (error) throw new Error(`Query failed: ${error.message}`);
      if (!matches || matches.length === 0) throw new Error('No matches found');

      // Validate required fields
      for (const match of matches) {
        if (!match.home_team || !match.away_team) {
          throw new Error(`Invalid match data: missing team names`);
        }
        if (!match.league) {
          throw new Error(`Invalid match data: missing league`);
        }
        if (!match.kickoff_utc) {
          throw new Error(`Invalid match data: missing kickoff time`);
        }
      }

      return `Validated ${matches.length} matches for data integrity`;
    }));

    // Test Analysis Data Quality
    results.push(await this.testModule('analysis-data-quality', async () => {
      const { data: analyses, error } = await supabase
        .from('analysis_snapshots')
        .select('*')
        .limit(5);

      if (error) throw new Error(`Query failed: ${error.message}`);
      
      if (analyses && analyses.length > 0) {
        for (const analysis of analyses) {
          if (!analysis.analysis_data) {
            throw new Error('Missing analysis data');
          }
          if (typeof analysis.confidence_score !== 'number' || 
              analysis.confidence_score < 0 || 
              analysis.confidence_score > 100) {
            throw new Error(`Invalid confidence score: ${analysis.confidence_score}`);
          }
        }
        return `Validated ${analyses.length} analyses for data quality`;
      } else {
        return 'No analyses found - skipping validation';
      }
    }));

    // Test Competition Configuration
    results.push(await this.testModule('competition-config-validation', async () => {
      const enabledRules = competitionManager.getEnabledRules();
      
      if (enabledRules.length === 0) {
        throw new Error('No competition rules enabled');
      }

      for (const rule of enabledRules) {
        if (!rule.criteria.leagues || rule.criteria.leagues.length === 0) {
          throw new Error(`Rule ${rule.id} has no leagues configured`);
        }
        if (rule.analysis.min_confidence_threshold < 0 || rule.analysis.min_confidence_threshold > 100) {
          throw new Error(`Rule ${rule.id} has invalid confidence threshold`);
        }
      }

      return `Validated ${enabledRules.length} competition rules`;
    }));

    return this.createTestSuite('Data Quality Tests', results, Date.now() - startTime);
  }

  /**
   * Test error handling and recovery
   */
  private async runErrorHandlingTests(): Promise<TestSuite> {
    console.log('[Testing] Running error handling tests...');
    const startTime = Date.now();
    const results: TestResult[] = [];

    // Test Invalid Match Data Handling
    results.push(await this.testModule('invalid-data-handling', async () => {
      const invalidMatch = {
        league: '', // Invalid empty league
        home_team: 'Test Team',
        away_team: 'Test Team 2',
        kickoff_utc: 'invalid-date' // Invalid date
      };

      const result = competitionManager.shouldCoverMatch(invalidMatch);
      
      // Should handle gracefully without throwing
      if (result.should_cover) {
        throw new Error('Should not cover match with invalid data');
      }

      return 'Invalid data handled gracefully';
    }));

    // Test Database Error Handling
    results.push(await this.testModule('database-error-handling', async () => {
      // Try to query non-existent table (should handle gracefully)
      const { data, error } = await supabase
        .from('non_existent_table')
        .select('*')
        .limit(1);

      if (!error) {
        throw new Error('Expected database error but query succeeded');
      }

      // Error should be handled gracefully
      return 'Database errors handled correctly';
    }));

    // Test Event Bus Error Isolation
    results.push(await this.testModule('event-error-isolation', async () => {
      let errorEventReceived = false;
      
      // Handler that throws an error
      const errorHandler = () => {
        throw new Error('Test error');
      };

      // Handler that should still work
      const goodHandler = () => {
        errorEventReceived = true;
      };

      eventBus.on('system.error', errorHandler);
      eventBus.on('system.error', goodHandler);

      await eventBus.emit({
        id: 'error_test',
        type: 'system.error',
        timestamp: new Date().toISOString(),
        source: 'error-test',
        data: { test: true }
      } as any);

      eventBus.off('system.error', errorHandler);
      eventBus.off('system.error', goodHandler);

      if (!errorEventReceived) {
        throw new Error('Error isolation failed - good handler did not execute');
      }

      return 'Event bus error isolation working';
    }));

    return this.createTestSuite('Error Handling Tests', results, Date.now() - startTime);
  }

  /**
   * Test individual module
   */
  private async testModule(testName: string, testFunction: () => Promise<string>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const details = await testFunction();
      
      return {
        test_id: `${this.currentTestRun}_${testName}`,
        test_name: testName,
        status: 'passed',
        duration: Date.now() - startTime,
        details,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        test_id: `${this.currentTestRun}_${testName}`,
        test_name: testName,
        status: 'failed',
        duration: Date.now() - startTime,
        details: 'Test failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create test suite summary
   */
  private createTestSuite(suiteName: string, results: TestResult[], duration: number): TestSuite {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    const overallStatus: 'passed' | 'failed' | 'partial' = 
      failed === 0 ? 'passed' : 
      passed === 0 ? 'failed' : 'partial';

    return {
      suite_name: suiteName,
      total_tests: results.length,
      passed,
      failed,
      skipped,
      duration,
      results,
      overall_status: overallStatus
    };
  }

  /**
   * Run smoke tests (minimal validation)
   */
  async runSmokeTests(): Promise<TestResult[]> {
    console.log('[Testing] Running smoke tests...');
    const results: TestResult[] = [];

    // Test basic pipeline status
    results.push(await this.testModule('pipeline-status', async () => {
      const status = await pipelineOrchestrator.getStatus();
      return `Pipeline running: ${status.is_running}, Health: ${status.pipeline_health}`;
    }));

    // Test database connectivity
    results.push(await this.testModule('database-smoke', async () => {
      const { error } = await supabase.from('matches').select('id').limit(1);
      if (error) throw error;
      return 'Database accessible';
    }));

    // Test event bus
    results.push(await this.testModule('event-bus-smoke', async () => {
      const stats = eventBus.getStats();
      return `Event bus operational, ${stats.totalEvents} total events`;
    }));

    console.log(`[Testing] Smoke tests completed: ${results.filter(r => r.status === 'passed').length}/${results.length} passed`);
    return results;
  }

  /**
   * Load test - simulate high load on the pipeline
   */
  async runLoadTest(duration: number = 60000): Promise<TestResult> {
    console.log(`[Testing] Running load test for ${duration}ms...`);
    const startTime = Date.now();
    
    try {
      const eventCount = Math.floor(duration / 1000) * 10; // 10 events per second
      let successCount = 0;
      let errorCount = 0;

      const promises = [];
      for (let i = 0; i < eventCount; i++) {
        const promise = eventBus.emit({
          id: `load_test_${i}`,
          type: 'system.error',
          timestamp: new Date().toISOString(),
          source: 'load-test',
          data: { iteration: i }
        } as any).then(() => {
          successCount++;
        }).catch(() => {
          errorCount++;
        });

        promises.push(promise);

        // Pace the events
        if (i % 10 === 9) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      await Promise.allSettled(promises);

      const actualDuration = Date.now() - startTime;
      const throughput = (successCount / actualDuration) * 1000;

      if (errorCount > eventCount * 0.05) { // More than 5% errors
        throw new Error(`High error rate: ${errorCount}/${eventCount} failed`);
      }

      return {
        test_id: `${this.currentTestRun}_load_test`,
        test_name: 'load-test',
        status: 'passed',
        duration: actualDuration,
        details: `Processed ${successCount}/${eventCount} events, throughput: ${throughput.toFixed(2)} events/sec`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        test_id: `${this.currentTestRun}_load_test`,
        test_name: 'load-test',
        status: 'failed',
        duration: Date.now() - startTime,
        details: 'Load test failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate test report
   */
  generateReport(testReport: PipelineTestReport): string {
    const report = [
      '# Pipeline Test Report',
      `**Test Run ID:** ${testReport.test_run_id}`,
      `**Environment:** ${testReport.environment}`,
      `**Status:** ${testReport.overall_status.toUpperCase()}`,
      `**Duration:** ${(testReport.total_duration / 1000).toFixed(2)}s`,
      `**Timestamp:** ${testReport.timestamp}`,
      '',
      '## Test Suites',
      ''
    ];

    testReport.test_suites.forEach(suite => {
      report.push(`### ${suite.suite_name}`);
      report.push(`- **Status:** ${suite.overall_status.toUpperCase()}`);
      report.push(`- **Tests:** ${suite.passed}/${suite.total_tests} passed`);
      report.push(`- **Duration:** ${(suite.duration / 1000).toFixed(2)}s`);
      report.push('');

      if (suite.failed > 0) {
        report.push('**Failed Tests:**');
        suite.results.filter(r => r.status === 'failed').forEach(result => {
          report.push(`- ${result.test_name}: ${result.error}`);
        });
        report.push('');
      }
    });

    report.push('## Pipeline Health');
    report.push(`**Before Tests:** ${testReport.pipeline_health_before.pipeline_health}`);
    report.push(`**After Tests:** ${testReport.pipeline_health_after.pipeline_health}`);

    return report.join('\n');
  }
}

// Export singleton instance
export const pipelineTestingModule = new PipelineTestingModule();