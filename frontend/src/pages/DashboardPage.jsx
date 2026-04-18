import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import WebcamGuard from '../components/WebcamGuard';

const DashboardPage = () => {
  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [codeMap, setCodeMap] = useState({});
  
  const dashboardRef = useRef(null);
  const webcamGuardRef = useRef(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const logViolation = async (type, details = '') => {
    try {
      const token = localStorage.getItem('candidate_token');
      await api.post('/proctor/violation/', { type, details }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Failed to log violation', e);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out? Your current code will be saved locally, but the test timer will continue.");
    if (!confirmed) return;
    
    localStorage.clear();
    window.location.href = '/';
  };

  // Wrapped handleAutoSubmit so it can be called inside useEffect
  const handleAutoSubmitRef = useRef(null);

  useEffect(() => {
    fetchTestData();
    setupTimer();
    
    // ----------------------------------------------------
    // SECURITY LOCKDOWNS & PENALTY ENGINE
    // ----------------------------------------------------
    
    const blockEvent = (e) => {
      e.preventDefault();
      logViolation('COPY_PASTE');
      alert('Security Policy: Copy, Paste, and Right-click are disabled.');
    };

    const blockContextMenu = (e) => {
      e.preventDefault();
      logViolation('RIGHT_CLICK');
      alert('Security Policy: Right-click is disabled.');
    };

    const handleKeyDown = (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+U
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        logViolation('DEV_TOOLS');
        alert('Security Policy: Developer tools are disabled.');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          logViolation('TAB_SWITCH', `Tab switch count: ${newCount}`);
          
          // Instantly force a webcam capture on violation
          if (webcamGuardRef.current) {
            webcamGuardRef.current.capture();
          }

          // Penalty Threshold Engine
          if (newCount <= 2) {
            alert(`WARNING: Please do not switch tabs! (Violation ${newCount}/5)`);
          } else if (newCount <= 4) {
            alert(`SERIOUS WARNING: You are risking immediate test termination! (Violation ${newCount}/5)`);
          } else {
            alert(`FINAL VIOLATION: Test is being automatically submitted.`);
            if (handleAutoSubmitRef.current) handleAutoSubmitRef.current();
          }
          return newCount;
        });
      }
    };

    const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "Are you sure you want to exit? Your progress may be lost.";
        return e.returnValue;
    };

    window.addEventListener('copy', blockEvent);
    window.addEventListener('paste', blockEvent);
    window.addEventListener('cut', blockEvent);
    window.addEventListener('contextmenu', blockContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('copy', blockEvent);
      window.removeEventListener('paste', blockEvent);
      window.removeEventListener('cut', blockEvent);
      window.removeEventListener('contextmenu', blockContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const fetchTestData = async () => {
    try {
      const token = localStorage.getItem('candidate_token');
      const response = await api.get('/tests/current/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestData(response.data);
      setTestData(response.data);
      if (response.data.questions.length > 0) {
        setCurrentQuestion(response.data.questions[0]);
        
        // Initialize code map with initial_code for all questions
        const initialMap = {};
        response.data.questions.forEach(q => {
           initialMap[q.id] = q.initial_code;
        });
        setCodeMap(initialMap);
        setCode(response.data.questions[0].initial_code);
      }
    } catch (err) {
      setError('Failed to load test data. Your session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const setupTimer = () => {
    const endTime = new Date(localStorage.getItem('end_time')).getTime();
    
    const tick = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(diff);
      
      if (diff === 0) {
        handleAutoSubmit();
      }
    };

    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [consoleOutput, setConsoleOutput] = useState('$ Click "Run Code" to see execution results...');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionChange = (index) => {
    if (index === activeQuestionIndex) return;
    
    // Save current code to map
    setCodeMap(prev => ({ ...prev, [currentQuestion.id]: code }));
    
    // Switch question
    const nextQ = testData.questions[index];
    setActiveQuestionIndex(index);
    setCurrentQuestion(nextQ);
    
    // Load code for next question
    setCode(codeMap[nextQ.id] || nextQ.initial_code);
    setConsoleOutput('$ Click "Run Code" to see execution results...');
  };

  const handleRunCode = async (isFinal = false) => {
    if (!currentQuestion) return;
    
    // Auto-save typed code to map before running
    setCodeMap(prev => ({...prev, [currentQuestion.id]: code}));

    setConsoleOutput('Executing code... (Heavy calculation might take up to 30s)');
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('candidate_token');
      const response = await api.post('/tests/submit/', {
        question_id: currentQuestion.id,
        code: code,
        is_final: isFinal
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { results, score, passed_count, total_count } = response.data;
      
      let outputText = `Execution complete. Passed: ${passed_count}/${total_count} (Score: ${score}%)\n\n`;
      
      results.forEach((res, i) => {
        const icon = res.passed ? '✅' : '❌';
        const type = res.is_hidden ? 'Hidden Case' : 'Public Case';
        const displayStatus = res.passed ? 'Correct' : (res.status === 'Accepted' ? 'Wrong Answer' : res.status);
        
        outputText += `${icon} ${type} ${i+1}: ${displayStatus}\n`;

        if (!res.is_hidden) {
           if (res.input_data) outputText += `   Input:    ${res.input_data}\n`;
           if (res.expected_output) outputText += `   Expected: ${res.expected_output}\n`;
           if (res.actual_output) outputText += `   Output:   ${res.actual_output}\n`;
        }

        if (!res.passed && res.error) {
           outputText += `   Error: ${res.error}\n`;
        }
      });

      setConsoleOutput(outputText);
    } catch (err) {
      if (err.response?.status === 429) {
        setConsoleOutput(`❌ RATE LIMIT EXCEEDED: Please wait a few seconds before running code again. (Limit: 100 runs per minute)`);
      } else {
        setConsoleOutput(`Error: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const confirmed = window.confirm('Are you sure you want to submit your test? You will not be able to make further changes.');
    if (!confirmed) return;
    await executeBulkSubmit();
  };

  const handleAutoSubmit = async () => {
    console.log('Time expired or Severe Violation. Auto-submitting...');
    await executeBulkSubmit();
  };

  const executeBulkSubmit = async () => {
    if (!testData || !testData.questions) return;
    setIsSubmitting(true);
    
    // Make sure the VERY latest code from the active window is caught
    const finalCodeMap = { ...codeMap, [currentQuestion.id]: code };
    
    try {
      const token = localStorage.getItem('candidate_token');
      // Bulk submit all questions asynchronously
      await Promise.all(testData.questions.map(q => 
         api.post('/tests/submit/', {
           question_id: q.id,
           code: finalCodeMap[q.id] || q.initial_code,
           is_final: true
         }, { headers: { Authorization: `Bearer ${token}` } })
      ));
      
      alert('Test submitted successfully. You can now close this window.');
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
       alert('Failed to submit some answers. Please try again or contact the administrator.');
       setIsSubmitting(false);
    }
  };
  
  // Assign to ref so useEffect can access the latest function
  handleAutoSubmitRef.current = handleAutoSubmit;


  if (loading) return <div className="flex-center" style={{height: '100vh'}}>Loading Environment...</div>;
  if (error) return <div className="flex-center" style={{height: '100vh', color: 'var(--error)'}}>{error}</div>;

  return (
    <div ref={dashboardRef} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <WebcamGuard ref={webcamGuardRef} token={localStorage.getItem('candidate_token')} />
      
      {/* Header */}
      <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>{testData.test_title}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{localStorage.getItem('candidate_email')}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Remaining</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: timeLeft < 300 ? 'var(--error)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeLeft)}
            </p>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            style={{ padding: '0.5rem 1.5rem', fontWeight: '600' }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>

          <button 
            onClick={handleLogout}
            style={{ 
              padding: '0.5rem 1rem', 
              background: 'transparent', 
              border: '1px solid var(--border-subtle)',
              fontSize: '0.875rem',
              color: 'var(--text-dim)'
            }}
          >
            Logout
          </button>

        </div>
      </header>

      {/* Main Content */}
      <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Pane: Question */}
        <div style={{ width: '40%', padding: '2rem', overflowY: 'auto', borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          {currentQuestion && (
            <>
              {/* Question Tabs */}
              {testData.questions.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                   {testData.questions.map((q, idx) => (
                      <button 
                        key={q.id}
                        onClick={() => handleQuestionChange(idx)}
                        style={{
                           padding: '0.5rem 1rem',
                           fontSize: '0.875rem',
                           background: activeQuestionIndex === idx ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
                           border: activeQuestionIndex === idx ? '1px solid var(--brand-glow)' : '1px solid var(--border-subtle)'
                        }}
                      >
                         Question {idx + 1}
                      </button>
                   ))}
                </div>
              )}
              
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{currentQuestion.title}</h3>
              
              {currentQuestion.image_url && (
                <div style={{ marginBottom: '1.5rem', background: '#000', padding: '0.5rem', borderRadius: '8px' }}>
                  <img src={currentQuestion.image_url} alt="Question diagram" style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }} />
                </div>
              )}

              <div className="markdown-body" style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1rem', whiteSpace: 'normal', fontFamily: 'inherit' }}>
                <ReactMarkdown>{currentQuestion.description}</ReactMarkdown>
              </div>

              <div style={{ marginTop: '3rem' }}>
                <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>Public Test Cases</h4>
                {currentQuestion.public_test_cases.map((tc, index) => (
                  <div key={tc.id} className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', background: 'var(--bg-tertiary)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Input:</p>
                    <code style={{ display: 'block', background: '#000', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>{tc.input_data || '(none)'}</code>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Expected Output:</p>
                    <code style={{ display: 'block', background: '#000', padding: '0.5rem', borderRadius: '4px' }}>{tc.expected_output}</code>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Pane: Editor */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                automaticLayout: true,
                quickSuggestions: false,
                suggestOnTriggerCharacters: false,
                contextmenu: false,
              }}
            />
          </div>
          
          {/* Console Area */}
          <div className="glass-panel" style={{ height: '200px', borderRadius: 0, borderBottom: 0, borderLeft: 0, borderRight: 0, background: '#000', padding: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
               <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>Console Output</span>
               <button 
                 onClick={() => handleRunCode(false)}
                 disabled={isSubmitting}
                 style={{ padding: '0.2rem 1rem', fontSize: '0.75rem', background: 'var(--bg-tertiary)' }}
               >
                 {isSubmitting ? 'Executing...' : 'Run Code'}
               </button>
             </div>
             <div style={{ color: 'var(--success)', fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap', maxHeight: '140px', overflowY: 'auto' }}>
               {consoleOutput}
             </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
