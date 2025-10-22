'use client';

import { useState, useEffect, useRef } from 'react';

type HistoryEntry = {
  type: 'command' | 'output' | 'prompt';
  content: string;
};

export default function Home() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: 'output', content: 'Last login: Tue Oct 21 10:45:23 on ttys001' },
    { type: 'output', content: '' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [workflowStep, setWorkflowStep] = useState<'idle' | 'project-type' | 'experience-type' | 'loading'>('idle');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadingFrame, setLoadingFrame] = useState(0);
  const [showAppWindows, setShowAppWindows] = useState(false);
  const [terminalMinimized, setTerminalMinimized] = useState(true); // Start with terminal hidden
  const [cursorInput, setCursorInput] = useState('');
  const [cursorMessages, setCursorMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [browserScreenshot, setBrowserScreenshot] = useState('faire-screenshot.jpg');
  const [showShareUrl, setShowShareUrl] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [sandboxCreated, setSandboxCreated] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [showSlackWindow, setShowSlackWindow] = useState(false);
  const [slackMessage, setSlackMessage] = useState('');
  const [showSlackUrl, setShowSlackUrl] = useState(false);
  const [slackMessageSent, setSlackMessageSent] = useState(false);
  const [sentMessageText, setSentMessageText] = useState('');
  const [customizeSandboxMode, setCustomizeSandboxMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const cursorInputRef = useRef<HTMLTextAreaElement>(null);
  const spotlightInputRef = useRef<HTMLInputElement>(null);
  const slackInputRef = useRef<HTMLTextAreaElement>(null);

  const projectTypeOptions = ['Starting something new', 'Continuing on something'];
  const experienceTypeOptions = ['Brand experience', 'Retail experience', 'Logged-out experience'];
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep focus on input when workflow step changes
  useEffect(() => {
    if (workflowStep === 'project-type' || workflowStep === 'experience-type') {
      inputRef.current?.focus();
    }
  }, [workflowStep]);

  // Focus input when terminal opens
  useEffect(() => {
    if (!terminalMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [terminalMinimized]);

  // Focus Spotlight input when it opens
  useEffect(() => {
    if (spotlightOpen) {
      setTimeout(() => spotlightInputRef.current?.focus(), 100);
    }
  }, [spotlightOpen]);

  // Trigger Slack window after copy success
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setShowSlackWindow(true);
      }, 1500); // 1.5 seconds after checkmark appears
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // Focus Slack input when it opens
  useEffect(() => {
    if (showSlackWindow) {
      setTimeout(() => slackInputRef.current?.focus(), 100);
    }
  }, [showSlackWindow]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Auto-adjust textarea height when cursorInput changes (including pre-filled text)
  useEffect(() => {
    if (cursorInputRef.current) {
      cursorInputRef.current.style.height = 'auto';
      cursorInputRef.current.style.height = cursorInputRef.current.scrollHeight + 'px';
    }
  }, [cursorInput]);

  // Spinner animation
  useEffect(() => {
    if (workflowStep === 'loading') {
      const interval = setInterval(() => {
        setLoadingFrame(prev => (prev + 1) % spinnerFrames.length);
      }, 80);
      return () => clearInterval(interval);
    }
  }, [workflowStep, spinnerFrames.length]);

  const handleCommand = (command: string) => {
    const trimmedCommand = command.trim().toLowerCase();

    if (workflowStep === 'idle') {
      if (trimmedCommand === 'faire vibe') {
        setHistory(prev => [
          ...prev,
          { type: 'output', content: '' },
          { type: 'output', content: 'Starting vibe workflow...' },
          { type: 'output', content: '' },
          { type: 'prompt', content: 'Are you starting something new or continuing on something?' },
        ]);
        setWorkflowStep('project-type');
        setSelectedIndex(0);
      } else {
        setHistory(prev => [
          ...prev,
          { type: 'output', content: '' },
          { type: 'output', content: `zsh: command not found: ${trimmedCommand}` },
          { type: 'output', content: '' },
        ]);
      }
    }
  };

  const handleSelection = () => {
    if (workflowStep === 'project-type') {
      const selected = projectTypeOptions[selectedIndex];
      if (selectedIndex === 0) {
        setHistory(prev => [
          ...prev,
          { type: 'command', content: `> ${selected}` },
          { type: 'output', content: '' },
          { type: 'prompt', content: 'Which experience do you want to work on?' },
        ]);
        setWorkflowStep('experience-type');
        setSelectedIndex(0);
      }
    } else if (workflowStep === 'experience-type') {
      const selected = experienceTypeOptions[selectedIndex];
      setHistory(prev => [
        ...prev,
        { type: 'command', content: `> ${selected}` },
        { type: 'output', content: '' },
        { type: 'output', content: `Thanks! Let us get things ready for you to vibe in Cursor.` },
        { type: 'output', content: 'Hang tight as this initial setup may take a few minutes.' },
        { type: 'output', content: 'We will let you know when it has completed.' },
        { type: 'output', content: '' },
      ]);
      setWorkflowStep('loading');
      setSelectedIndex(0);
      setLoadingFrame(0);

      // Simulate loading completion after 3 seconds
      setTimeout(() => {
        setHistory(prev => [
          ...prev,
          { type: 'output', content: '✓ Setup complete. Your environment is ready.' },
          { type: 'output', content: '' },
          { type: 'output', content: 'Opening Cursor...' },
          { type: 'output', content: '' },
        ]);
        setWorkflowStep('idle');

        // Automatically minimize terminal and show Cursor after a few seconds
        setTimeout(() => {
          setTerminalMinimized(true);
          setShowAppWindows(true);
          setShowBrowser(false);
        }, 2000);
      }, 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (workflowStep === 'idle') {
      if (currentInput.trim()) {
        handleCommand(currentInput);
        setCurrentInput('');
      }
    } else {
      // In selection mode, Enter selects the current option
      handleSelection();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([
        { type: 'output', content: 'Last login: Tue Oct 21 10:45:23 on ttys001' },
        { type: 'output', content: '' },
      ]);
      setWorkflowStep('idle');
      setSelectedIndex(0);
      return;
    }

    // Arrow key navigation in selection mode
    if (workflowStep === 'project-type' || workflowStep === 'experience-type') {
      const options = workflowStep === 'project-type' ? projectTypeOptions : experienceTypeOptions;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % options.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + options.length) % options.length);
      }
    }
  };

  const getPromptText = () => {
    return workflowStep === 'idle' ? 'john.intrater@john-intrater-CQ2TQF7VVF ~ %' : '>';
  };

  const handleCursorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cursorInput.trim()) {
      // Add user message
      setCursorMessages(prev => [...prev, { role: 'user', content: cursorInput }]);
      const userMessage = cursorInput;
      setCursorInput('');

      // Simulate AI response after a short delay
      setTimeout(() => {
        if (customizeSandboxMode) {
          // Handle customize sandbox mode
          setCursorMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Sure I will update the sandbox for you.'
          }]);
          setCustomizeSandboxMode(false);

          // Change browser screenshot after AI responds
          setBrowserScreenshot('Homepage2.jpg');
        } else {
          // Handle normal mode (adding shortcut cards)
          setCursorMessages(prev => [...prev, {
            role: 'assistant',
            content: 'No problem. I will add in a row of shortcut cards to the top of the home screen for you'
          }]);

          // Change browser screenshot after AI responds
          setBrowserScreenshot('faire-screenshot2.jpg');
        }
      }, 1000);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText('https://vibe.faire.com/intrater-102125');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{
      backgroundImage: 'url(/oldschool.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* macOS Menu Bar - Aqua Style */}
      <div className="px-4 py-1 flex items-center justify-between" style={{
        background: `
          linear-gradient(
            0deg,
            transparent 0%, transparent 14%,
            rgba(180,190,200,0.5) 14%, rgba(180,190,200,0.5) 15%,
            transparent 15%, transparent 28%,
            rgba(180,190,200,0.5) 28%, rgba(180,190,200,0.5) 29%,
            transparent 29%, transparent 42%,
            rgba(180,190,200,0.5) 42%, rgba(180,190,200,0.5) 43%,
            transparent 43%, transparent 57%,
            rgba(180,190,200,0.5) 57%, rgba(180,190,200,0.5) 58%,
            transparent 58%, transparent 71%,
            rgba(180,190,200,0.5) 71%, rgba(180,190,200,0.5) 72%,
            transparent 72%, transparent 85%,
            rgba(180,190,200,0.5) 85%, rgba(180,190,200,0.5) 86%,
            transparent 86%, transparent 100%
          ),
          linear-gradient(180deg, rgba(235,240,245,0.98) 0%, rgba(220,230,240,0.96) 50%, rgba(210,220,235,0.95) 100%)
        `,
        borderBottom: '1px solid rgba(100,120,150,0.4)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 1px 3px rgba(0,0,0,0.2)'
      }}>
        <div className="flex items-center gap-6 text-sm" style={{
          color: '#000000',
          textShadow: '0 1px 0 rgba(255,255,255,1), 0 1px 2px rgba(255,255,255,0.8)',
          fontWeight: '500'
        }}>
          <div className="font-bold text-lg"></div>
          <div>Finder</div>
          <div>File</div>
          <div>Edit</div>
          <div>View</div>
          <div>Go</div>
          <div>Window</div>
          <div>Help</div>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: '#1a1a1a' }}>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div
            className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-1 rounded"
            onClick={() => setSpotlightOpen(true)}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <div>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
        </div>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-16 right-8 space-y-4 z-0">
        {/* Photos Folder - Back to Blank Desktop */}
        <div
          className="flex flex-col items-center gap-2 text-white cursor-pointer hover:bg-white/20 p-2 rounded group relative"
          onClick={() => {
            setHistory([
              { type: 'output', content: 'Last login: Tue Oct 21 10:45:23 on ttys001' },
              { type: 'output', content: '' },
            ]);
            setCurrentInput('');
            setWorkflowStep('idle');
            setSelectedIndex(0);
            setLoadingFrame(0);
            setShowAppWindows(false);
            setTerminalMinimized(true);
            setCursorMessages([]);
            setBrowserScreenshot('faire-screenshot.png');
            setShowShareUrl(false);
            setCopySuccess(false);
            setSandboxCreated(false);
            setShowBrowser(false);
            setSpotlightOpen(false);
            setSpotlightQuery('');
          }}
        >
          <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="folderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#7ab5e8', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#4a8dc7', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <path d="M8 16c0-2.21 1.79-4 4-4h12l4 4h24c2.21 0 4 1.79 4 4v28c0 2.21-1.79 4-4 4H12c-2.21 0-4-1.79-4-4V16z" fill="url(#folderGrad)" stroke="#2d6a9f" strokeWidth="0.5"/>
            <path d="M8 24h48v24c0 2.21-1.79 4-4 4H12c-2.21 0-4-1.79-4-4V24z" fill="#5a9dd4" opacity="0.8"/>
            <ellipse cx="32" cy="20" rx="3" ry="1.5" fill="rgba(255,255,255,0.4)"/>
          </svg>
          <div className="text-xs font-bold" style={{
            color: '#ffffff',
            textShadow: '0 1px 0 rgba(0,0,0,0.8), 0 2px 3px rgba(0,0,0,0.6)'
          }}>Photos</div>
        </div>

        {/* Documents Folder - Open Terminal Window */}
        <div
          className="flex flex-col items-center gap-2 text-white cursor-pointer hover:bg-white/20 p-2 rounded group relative"
          onClick={() => {
            setHistory([
              { type: 'output', content: 'Last login: Tue Oct 21 10:45:23 on ttys001' },
              { type: 'output', content: '' },
            ]);
            setCurrentInput('');
            setWorkflowStep('idle');
            setSelectedIndex(0);
            setLoadingFrame(0);
            setShowAppWindows(false);
            setTerminalMinimized(false);
            setCursorMessages([]);
            setBrowserScreenshot('faire-screenshot.png');
            setShowShareUrl(false);
            setCopySuccess(false);
            setSandboxCreated(false);
            setShowBrowser(false);
            setSpotlightOpen(false);
            setSpotlightQuery('');
          }}
        >
          <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="folderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#7ab5e8', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#4a8dc7', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <path d="M8 16c0-2.21 1.79-4 4-4h12l4 4h24c2.21 0 4 1.79 4 4v28c0 2.21-1.79 4-4 4H12c-2.21 0-4-1.79-4-4V16z" fill="url(#folderGrad)" stroke="#2d6a9f" strokeWidth="0.5"/>
            <path d="M8 24h48v24c0 2.21-1.79 4-4 4H12c-2.21 0-4-1.79-4-4V24z" fill="#5a9dd4" opacity="0.8"/>
            <ellipse cx="32" cy="20" rx="3" ry="1.5" fill="rgba(255,255,255,0.4)"/>
          </svg>
          <div className="text-xs font-bold" style={{
            color: '#ffffff',
            textShadow: '0 1px 0 rgba(0,0,0,0.8), 0 2px 3px rgba(0,0,0,0.6)'
          }}>Documents</div>
        </div>

        {/* Projects Folder - Open Cursor Window */}
        <div
          className="flex flex-col items-center gap-2 text-white cursor-pointer hover:bg-white/20 p-2 rounded group relative"
          onClick={() => {
            setTerminalMinimized(true);
            setShowAppWindows(true);
            setWorkflowStep('idle');
            setShowBrowser(false);
            setSandboxCreated(false);
            setSpotlightOpen(false);
            setSpotlightQuery('');
          }}
        >
          <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="folderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#7ab5e8', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#4a8dc7', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <path d="M8 16c0-2.21 1.79-4 4-4h12l4 4h24c2.21 0 4 1.79 4 4v28c0 2.21-1.79 4-4 4H12c-2.21 0-4-1.79-4-4V16z" fill="url(#folderGrad)" stroke="#2d6a9f" strokeWidth="0.5"/>
            <path d="M8 24h48v24c0 2.21-1.79 4-4 4H12c-2.21 0-4-1.79-4-4V24z" fill="#5a9dd4" opacity="0.8"/>
            <ellipse cx="32" cy="20" rx="3" ry="1.5" fill="rgba(255,255,255,0.4)"/>
          </svg>
          <div className="text-xs font-bold" style={{
            color: '#ffffff',
            textShadow: '0 1px 0 rgba(0,0,0,0.8), 0 2px 3px rgba(0,0,0,0.6)'
          }}>Projects</div>
        </div>
      </div>

      {/* Terminal Window - Centered and Floating */}
      {!terminalMinimized && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-8 transition-opacity duration-500 opacity-0 animate-fadeIn">
          <div className="backdrop-blur-md rounded-xl overflow-hidden" style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
          }}>
            {/* Title Bar - Aqua Style */}
            <div className="px-4 py-2.5 flex items-center" style={{
              background: `
                linear-gradient(
                  0deg,
                  transparent 0%, transparent 14%,
                  rgba(160,170,180,0.5) 14%, rgba(160,170,180,0.5) 15%,
                  transparent 15%, transparent 28%,
                  rgba(160,170,180,0.5) 28%, rgba(160,170,180,0.5) 29%,
                  transparent 29%, transparent 42%,
                  rgba(160,170,180,0.5) 42%, rgba(160,170,180,0.5) 43%,
                  transparent 43%, transparent 57%,
                  rgba(160,170,180,0.5) 57%, rgba(160,170,180,0.5) 58%,
                  transparent 58%, transparent 71%,
                  rgba(160,170,180,0.5) 71%, rgba(160,170,180,0.5) 72%,
                  transparent 72%, transparent 85%,
                  rgba(160,170,180,0.5) 85%, rgba(160,170,180,0.5) 86%,
                  transparent 86%, transparent 100%
                ),
                linear-gradient(180deg, #f5f6f7 0%, #e8eaec 50%, #dfe1e4 100%)
              `,
              borderBottom: '1px solid #b0b5ba',
              boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {/* Traffic Light Buttons - Candy Style */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full cursor-pointer" style={{
                  background: 'radial-gradient(circle at 35% 35%, #ff6961, #ec5f59 45%, #d84942 65%, #c73d38)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                  border: '0.5px solid rgba(180,60,60,0.5)'
                }}></div>
                <div
                  className="w-3 h-3 rounded-full cursor-pointer"
                  onClick={() => {
                    setTerminalMinimized(true);
                    setShowAppWindows(true);
                    setShowBrowser(false);
                  }}
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #ffc52f, #ffbe2e 45%, #f0ac1e 65%, #e09e15)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                    border: '0.5px solid rgba(200,150,40,0.5)'
                  }}
                ></div>
                <div className="w-3 h-3 rounded-full cursor-pointer" style={{
                  background: 'radial-gradient(circle at 35% 35%, #2dd04a, #28ca42 45%, #23b83a 65%, #1fa633)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                  border: '0.5px solid rgba(40,160,50,0.5)'
                }}></div>
              </div>
            {/* Window Title */}
            <div className="flex-1 text-center text-sm font-medium" style={{
              color: '#2a2a2a',
              textShadow: '0 1px 0 rgba(255,255,255,0.9)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Lucida Grande", sans-serif'
            }}>
              Terminal
            </div>
            {/* Spacer for centering */}
            <div className="w-[60px]"></div>
          </div>

          {/* Terminal Content */}
          <div
            ref={terminalRef}
            className="p-6 h-[500px] overflow-y-auto font-mono text-sm leading-relaxed"
            style={{
              background: '#ffffff',
              color: '#000000'
            }}
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((entry, index) => (
              <div
                key={index}
                className={`mb-0.5`}
                style={{
                  color: entry.type === 'prompt' ? '#0066cc' : '#000000',
                  fontWeight: entry.type === 'prompt' ? 'bold' : 'normal',
                  marginTop: entry.type === 'prompt' ? '8px' : '0'
                }}
              >
                {entry.content}
              </div>
            ))}

            {/* Show options when in selection mode */}
            {(workflowStep === 'project-type' || workflowStep === 'experience-type') && (
              <div className="my-2">
                {workflowStep === 'project-type' && (
                  <>
                    <div className="py-1" style={{ color: selectedIndex === 0 ? '#0066cc' : '#000000' }}>
                      <span className="mr-2">1.</span>
                      <span className="font-semibold">Starting something new</span>
                      <div className="ml-6 text-xs" style={{ color: '#666666' }}>Create a fresh sandbox from scratch</div>
                    </div>
                    <div className="py-1" style={{ color: selectedIndex === 1 ? '#0066cc' : '#000000' }}>
                      <span className="mr-2">2.</span>
                      <span className="font-semibold">Continuing on something</span>
                      <div className="ml-6 text-xs" style={{ color: '#666666' }}>Resume work on an existing project</div>
                    </div>
                  </>
                )}
                {workflowStep === 'experience-type' && (
                  <>
                    <div className="py-1" style={{ color: selectedIndex === 0 ? '#0066cc' : '#000000' }}>
                      <span className="mr-2">1.</span>
                      <span className="font-semibold">Brand experience</span>
                      <div className="ml-6 text-xs" style={{ color: '#666666' }}>Work on brand-facing features and pages</div>
                    </div>
                    <div className="py-1" style={{ color: selectedIndex === 1 ? '#0066cc' : '#000000' }}>
                      <span className="mr-2">2.</span>
                      <span className="font-semibold">Retail experience</span>
                      <div className="ml-6 text-xs" style={{ color: '#666666' }}>Build retailer-focused functionality</div>
                    </div>
                    <div className="py-1" style={{ color: selectedIndex === 2 ? '#0066cc' : '#000000' }}>
                      <span className="mr-2">3.</span>
                      <span className="font-semibold">Logged-out experience</span>
                      <div className="ml-6 text-xs" style={{ color: '#666666' }}>Create public-facing pages and features</div>
                    </div>
                  </>
                )}
                <div className="mt-3 text-xs" style={{ color: '#666666' }}>
                  Enter to select · Tab/Arrow keys to navigate · Esc to cancel
                </div>
              </div>
            )}

            {/* Show loading spinner */}
            {workflowStep === 'loading' && (
              <div className="my-1">
                <div className="flex items-center gap-2" style={{ color: '#0066cc' }}>
                  <span className="text-lg">{spinnerFrames[loadingFrame]}</span>
                  <span>Setting up your environment. This will likely take 3-5 minutes.</span>
                </div>
                <div className="ml-6 mt-1" style={{ color: '#666666' }}>
                  Go grab a coffee and we will ping you when it is ready.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center mt-1">
              {workflowStep === 'idle' && (
                <>
                  <span className="mr-2" style={{ color: '#0066cc' }}>{getPromptText()}</span>
                  <div className="flex items-center relative">
                    <span className="whitespace-pre" style={{ color: '#000000' }}>{currentInput}</span>
                    <span className="inline-block w-2 h-4" style={{ backgroundColor: '#000000' }}></span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="absolute left-0 top-0 bg-transparent outline-none text-transparent caret-transparent w-full"
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>
                </>
              )}
              {(workflowStep === 'project-type' || workflowStep === 'experience-type') && (
                <input
                  ref={inputRef}
                  type="text"
                  value=""
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none opacity-0"
                  readOnly
                />
              )}
              {workflowStep === 'loading' && (
                <input
                  ref={inputRef}
                  type="text"
                  value=""
                  className="flex-1 bg-transparent outline-none opacity-0"
                  readOnly
                  disabled
                />
              )}
            </form>
          </div>
        </div>
      </div>
      )}

      {/* Browser and Cursor Windows */}
      {showAppWindows && (
        <div className="absolute inset-0 flex items-center justify-center gap-4 px-8 py-16 transition-opacity duration-500 opacity-0 animate-fadeIn">
          {/* Browser Window - Left (with invisible placeholder when not shown) */}
          {showBrowser ? (
            <div className="w-[50%] h-3/4 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-opacity duration-700 opacity-0 animate-fadeIn" style={{
              background: '#f5f5f5',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
            }}>
            {/* Title Bar - Aqua Style */}
            <div className="px-4 py-2.5 flex items-center" style={{
              background: `
                linear-gradient(
                  0deg,
                  transparent 0%, transparent 14%,
                  rgba(160,170,180,0.5) 14%, rgba(160,170,180,0.5) 15%,
                  transparent 15%, transparent 28%,
                  rgba(160,170,180,0.5) 28%, rgba(160,170,180,0.5) 29%,
                  transparent 29%, transparent 42%,
                  rgba(160,170,180,0.5) 42%, rgba(160,170,180,0.5) 43%,
                  transparent 43%, transparent 57%,
                  rgba(160,170,180,0.5) 57%, rgba(160,170,180,0.5) 58%,
                  transparent 58%, transparent 71%,
                  rgba(160,170,180,0.5) 71%, rgba(160,170,180,0.5) 72%,
                  transparent 72%, transparent 85%,
                  rgba(160,170,180,0.5) 85%, rgba(160,170,180,0.5) 86%,
                  transparent 86%, transparent 100%
                ),
                linear-gradient(180deg, #f5f6f7 0%, #e8eaec 50%, #dfe1e4 100%)
              `,
              borderBottom: '1px solid #b0b5ba',
              boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {/* Traffic Light Buttons - Candy Style */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full" style={{
                  background: 'radial-gradient(circle at 35% 35%, #ff6961, #ec5f59 45%, #d84942 65%, #c73d38)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                  border: '0.5px solid rgba(180,60,60,0.5)'
                }}></div>
                <div className="w-3 h-3 rounded-full" style={{
                  background: 'radial-gradient(circle at 35% 35%, #ffc52f, #ffbe2e 45%, #f0ac1e 65%, #e09e15)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                  border: '0.5px solid rgba(200,150,40,0.5)'
                }}></div>
                <div className="w-3 h-3 rounded-full" style={{
                  background: 'radial-gradient(circle at 35% 35%, #2dd04a, #28ca42 45%, #23b83a 65%, #1fa633)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                  border: '0.5px solid rgba(40,160,50,0.5)'
                }}></div>
              </div>
              {/* Window Title */}
              <div className="flex-1 text-center text-sm font-medium" style={{
                color: '#2a2a2a',
                textShadow: '0 1px 0 rgba(255,255,255,0.9)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Lucida Grande", sans-serif'
              }}>
                Safari
              </div>
              {/* Spacer */}
              <div className="w-[60px]"></div>
            </div>

            {/* Address Bar - Aqua Style */}
            <div className="px-4 py-2 flex items-center gap-2" style={{
              background: 'linear-gradient(180deg, #e8e8e8 0%, #d8d8d8 100%)',
              borderBottom: '1px solid #c0c0c0'
            }}>
              {/* Navigation Buttons */}
              <div className="flex gap-1">
                <div className="w-7 h-7 rounded flex items-center justify-center text-[#5a5a5a] hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div className="w-7 h-7 rounded flex items-center justify-center text-[#5a5a5a] hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              {/* URL Bar - Classic Aqua Style */}
              <div className="flex-1 px-3 py-1.5 text-sm" style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
                border: '1px solid #a0a0a0',
                borderRadius: '4px',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                color: '#2a2a2a'
              }}>
                vibe.faire.com/intrater-102125
              </div>
              {/* Refresh */}
              <div className="w-7 h-7 rounded flex items-center justify-center text-[#5a5a5a] hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>

            {/* Browser Content */}
            <div className="flex-1 bg-white overflow-hidden">
              <img
                key={browserScreenshot}
                src={`/${browserScreenshot}`}
                alt="Faire homepage"
                className="w-full h-full object-cover object-left-top transition-opacity duration-500"
                style={{ animation: 'fadeIn 500ms ease-in' }}
              />
            </div>
          </div>
          ) : (
            <div className="w-[50%]"></div>
          )}

          {/* Cursor Window - Right (always 50% width, same as browser) */}
          <div className="w-[50%] h-3/4 bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
          }}>
            {/* Title Bar - Dark Aqua Style */}
            <div className="px-4 py-2.5 flex items-center" style={{
              background: `
                linear-gradient(
                  0deg,
                  transparent 0%, transparent 14%,
                  rgba(80,85,90,0.5) 14%, rgba(80,85,90,0.5) 15%,
                  transparent 15%, transparent 28%,
                  rgba(80,85,90,0.5) 28%, rgba(80,85,90,0.5) 29%,
                  transparent 29%, transparent 42%,
                  rgba(80,85,90,0.5) 42%, rgba(80,85,90,0.5) 43%,
                  transparent 43%, transparent 57%,
                  rgba(80,85,90,0.5) 57%, rgba(80,85,90,0.5) 58%,
                  transparent 58%, transparent 71%,
                  rgba(80,85,90,0.5) 71%, rgba(80,85,90,0.5) 72%,
                  transparent 72%, transparent 85%,
                  rgba(80,85,90,0.5) 85%, rgba(80,85,90,0.5) 86%,
                  transparent 86%, transparent 100%
                ),
                linear-gradient(180deg, #4a4d50 0%, #3a3d40 50%, #2d3033 100%)
              `,
              borderBottom: '1px solid #1a1a1a',
              boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 1px 2px rgba(0,0,0,0.3)'
            }}>
              {/* Traffic Light Buttons - Candy Style */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full" style={{
                  background: 'radial-gradient(circle at 35% 35%, #ff6961, #ec5f59 45%, #d84942 65%, #c73d38)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                  border: '0.5px solid rgba(180,60,60,0.5)'
                }}></div>
                <div className="w-3 h-3 rounded-full" style={{
                  background: 'radial-gradient(circle at 35% 35%, #ffc52f, #ffbe2e 45%, #f0ac1e 65%, #e09e15)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                  border: '0.5px solid rgba(200,150,40,0.5)'
                }}></div>
                <div className="w-3 h-3 rounded-full" style={{
                  background: 'radial-gradient(circle at 35% 35%, #2dd04a, #28ca42 45%, #23b83a 65%, #1fa633)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                  border: '0.5px solid rgba(40,160,50,0.5)'
                }}></div>
              </div>
              {/* Window Title */}
              <div className="flex-1 text-center text-sm font-medium" style={{
                color: '#c0c0c0',
                textShadow: '0 1px 0 rgba(0,0,0,0.8)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Lucida Grande", sans-serif'
              }}>
                Cursor
              </div>
              {/* Spacer */}
              <div className="w-[60px]"></div>
            </div>

            {/* Cursor Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Sidebar - Sandbox Manager */}
              <div className="w-64 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col">
                {/* Sidebar Header */}
                <div className="px-4 py-3 text-[#858585] text-xs font-semibold uppercase tracking-wider border-b border-[#2d2d2d]">
                  Sandbox Manager
                </div>

                {/* Vibe Code Anything Section */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🔥</span>
                    <h3 className="text-white font-semibold text-sm">Vibe Code Anything</h3>
                  </div>

                  {!sandboxCreated ? (
                    /* State 1: Initial - Before Sandbox Creation */
                    <>
                      {/* Confirmation Text */}
                      <p className="text-[#cccccc] text-xs mb-4 leading-relaxed">
                        We are almost ready to vibe. Would you like to use an existing sandbox to start working or would you like to customize one to your liking?
                      </p>

                      {/* Primary Create Sandbox Button */}
                      <button
                        onClick={() => {
                          setSandboxCreated(true);
                          setShowBrowser(true);
                        }}
                        className="w-full bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm py-2.5 px-4 rounded transition-colors font-semibold"
                      >
                        Launch sandbox
                      </button>
                    </>
                  ) : (
                    /* State 2: After Sandbox Creation */
                    <>
                      {/* Confirmation Text */}
                      <p className="text-[#cccccc] text-xs mb-4 leading-relaxed">
                        You should now see both this cursor window and a browser window and ready to roll. In case you need it, here are the details:
                      </p>

                      {/* Project Details Fields */}
                      <div className="space-y-3 mb-4">
                        {/* Project Name */}
                        <div>
                          <label className="text-[#858585] text-xs font-semibold mb-1 block">Project Name</label>
                          <div className="bg-[#2d2d2d] border border-[#3d3d3d] rounded px-3 py-2 text-[#cccccc] text-xs">
                            intrater-102125
                          </div>
                        </div>

                        {/* Creation Date/Time */}
                        <div>
                          <label className="text-[#858585] text-xs font-semibold mb-1 block">Created</label>
                          <div className="bg-[#2d2d2d] border border-[#3d3d3d] rounded px-3 py-2 text-[#cccccc] text-xs">
                            Oct 21, 2025 at 10:47 AM
                          </div>
                        </div>
                      </div>

                      {/* Primary Share Button or URL Box */}
                      {!showShareUrl ? (
                        <button
                          onClick={() => setShowShareUrl(true)}
                          className="w-full bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm py-2.5 px-4 rounded transition-colors font-semibold mb-2"
                        >
                          Share
                        </button>
                      ) : (
                        <div className="mb-2">
                          <div className="w-full bg-[#2d2d2d] border border-[#3d3d3d] rounded px-3 py-2 text-[#cccccc] text-xs flex items-center justify-between gap-2">
                            <span className="truncate">https://vibe.faire.com/intrater-102125</span>
                            <button
                              onClick={handleCopyUrl}
                              className={`flex-shrink-0 transition-colors ${copySuccess ? 'text-[#34d399]' : 'text-[#858585] hover:text-[#cccccc]'}`}
                              title={copySuccess ? "Copied!" : "Copy URL"}
                            >
                              {copySuccess ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Secondary Buttons */}
                      <div className="flex gap-2 mb-3">
                        <button className="flex-1 bg-transparent hover:bg-[#2d2d2d] text-[#cccccc] text-xs py-2 px-4 rounded transition-colors font-semibold border border-[#3d3d3d]">
                          Save
                        </button>
                        <button className="flex-1 bg-transparent hover:bg-[#2d2d2d] text-[#cccccc] text-xs py-2 px-4 rounded transition-colors font-semibold border border-[#3d3d3d]">
                          Help
                        </button>
                      </div>

                      {/* Customize Sandbox Link */}
                      <div className="text-center">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            // Clear chat and pre-fill with customize message
                            setCursorMessages([]);
                            setCursorInput('I want to customize the sandbox using the faire-cli MCP server...');
                            setCustomizeSandboxMode(true);
                            // Focus the chat input
                            setTimeout(() => cursorInputRef.current?.focus(), 100);
                          }}
                          className="text-[#4a9eff] hover:underline text-xs inline-flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          customize sandbox
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side - AI Chat Panel */}
              <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-[#2d2d2d]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[#cccccc] text-sm font-semibold">New Chat</h2>
                    <div className="flex items-center gap-3 text-[#858585] text-base">
                      <button className="hover:text-[#cccccc]">+</button>
                      <button className="hover:text-[#cccccc]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Main Input Box */}
                  <form onSubmit={handleCursorSubmit}>
                    <div className="bg-[#252526] border border-[#3d3d3d] rounded-lg p-3 mb-3">
                      {/* Add Context Tag - Inside Box */}
                      <div className="mb-3">
                        <button type="button" className="inline-flex items-center gap-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[#858585] text-xs px-2 py-1 rounded">
                          <span>@</span>
                          <span>Add Context</span>
                        </button>
                      </div>

                      {/* Input Area */}
                      <div className="mb-4">
                        <textarea
                          ref={cursorInputRef}
                          value={cursorInput}
                          onChange={(e) => {
                            setCursorInput(e.target.value);
                            // Auto-grow textarea
                            if (cursorInputRef.current) {
                              cursorInputRef.current.style.height = 'auto';
                              cursorInputRef.current.style.height = cursorInputRef.current.scrollHeight + 'px';
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleCursorSubmit(e);
                            }
                          }}
                          placeholder="Plan, search, build anything"
                          className="w-full bg-transparent outline-none text-[#cccccc] text-base resize-none placeholder:text-[#6e6e6e]"
                          style={{ minHeight: '24px', maxHeight: '200px', overflowY: 'auto' }}
                          rows={1}
                        />
                      </div>

                      {/* Agent Selector Row */}
                      <div className="flex items-center justify-between text-xs border-t border-[#3d3d3d] pt-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[#858585] flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            Agent
                          </span>
                          <button type="button" className="flex items-center gap-1.5 bg-transparent hover:bg-[#3d3d3d] text-[#cccccc] px-2 py-1 rounded text-xs border border-[#3d3d3d]">
                            <span className="text-[#858585]">≈</span>
                            <span>claude-4...</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button type="button" className="flex items-center justify-center px-2 h-6 bg-[#3d3d3d] hover:bg-[#4d4d4d] text-[#cccccc] rounded text-[10px] font-bold leading-none">
                            MAX
                          </button>
                          <button type="button" className="text-[#858585] hover:text-[#cccccc]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button type="button" className="text-[#858585] hover:text-[#cccccc]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Open in Agent Window Link */}
                  <div className="mt-3 text-right">
                    <a href="#" className="text-[#4a9eff] hover:underline text-xs">
                      Open in Agent Window (⌘E)
                    </a>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-auto p-4 space-y-6">
                  {cursorMessages.map((message, idx) => (
                    <div key={idx}>
                      {message.role === 'user' ? (
                        /* User Message */
                        <div className="flex items-start gap-3 group">
                          <div className="flex-1">
                            <div className="text-[#cccccc] text-sm leading-relaxed mb-1">{message.content}</div>
                          </div>
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-[#858585] hover:text-[#cccccc] p-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* AI Response */
                        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2d2d2d]">
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-[#cccccc] text-sm leading-relaxed">{message.content}</div>
                            <div className="flex gap-1 ml-2">
                              <button className="text-[#858585] hover:text-[#cccccc] p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button className="text-[#858585] hover:text-[#cccccc] p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                              <button className="text-[#858585] hover:text-[#cccccc] p-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* File Reference */}
                          <div className="mt-3 flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] px-2 py-1 rounded border border-[#3d3d3d] cursor-pointer">
                              <svg className="w-3.5 h-3.5 text-[#858585]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-[#4a9eff]">app/page.tsx</span>
                              <span className="text-[#858585]">+1 -1</span>
                            </div>
                          </div>

                          {/* Review Changes Button */}
                          <div className="mt-4 pt-3 border-t border-[#2d2d2d]">
                            <button className="flex items-center gap-2 text-[#cccccc] hover:text-white text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Review Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Past Chats Footer */}
                <div className="border-t border-[#2d2d2d] px-4 py-3">
                  <div className="text-[#6e6e6e] text-xs mb-2 uppercase tracking-wider">Past Chats</div>
                  <div className="text-[#cccccc] text-xs hover:bg-[#2a2a2a] p-2 rounded cursor-pointer">
                    New Chat
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spotlight Search Overlay */}
      {spotlightOpen && (
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-48 transition-opacity duration-300"
          onClick={() => {
            setSpotlightOpen(false);
            setSpotlightQuery('');
          }}
        >
          <div
            className="w-full max-w-2xl mx-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Box */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={spotlightInputRef}
                  type="text"
                  value={spotlightQuery}
                  onChange={(e) => setSpotlightQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSpotlightOpen(false);
                      setSpotlightQuery('');
                    } else if (e.key === 'Enter' && spotlightQuery.toLowerCase().includes('terminal')) {
                      setSpotlightOpen(false);
                      setTimeout(() => {
                        setSpotlightQuery('');
                        setTerminalMinimized(false);
                      }, 300);
                    }
                  }}
                  placeholder="Spotlight Search"
                  className="flex-1 bg-transparent outline-none text-gray-800 text-lg placeholder-gray-400"
                  autoComplete="off"
                />
              </div>

              {/* Search Results */}
              {spotlightQuery.toLowerCase().includes('terminal') && (
                <div className="p-2">
                  <div
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
                    onClick={() => {
                      setSpotlightOpen(false);
                      setTimeout(() => {
                        setSpotlightQuery('');
                        setTerminalMinimized(false);
                      }, 300);
                    }}
                  >
                    {/* Terminal Icon */}
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Terminal</div>
                      <div className="text-sm text-white/70">Utilities</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slack Window Overlay */}
      {showSlackWindow && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-8 animate-fadeIn">
          <div className="w-full max-w-6xl h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
          }}>
            {/* Title Bar - Purple Aqua Style */}
            <div className="px-4 py-2.5 flex items-center" style={{
              background: `
                linear-gradient(
                  0deg,
                  transparent 0%, transparent 14%,
                  rgba(90,40,95,0.5) 14%, rgba(90,40,95,0.5) 15%,
                  transparent 15%, transparent 28%,
                  rgba(90,40,95,0.5) 28%, rgba(90,40,95,0.5) 29%,
                  transparent 29%, transparent 42%,
                  rgba(90,40,95,0.5) 42%, rgba(90,40,95,0.5) 43%,
                  transparent 43%, transparent 57%,
                  rgba(90,40,95,0.5) 57%, rgba(90,40,95,0.5) 58%,
                  transparent 58%, transparent 71%,
                  rgba(90,40,95,0.5) 71%, rgba(90,40,95,0.5) 72%,
                  transparent 72%, transparent 85%,
                  rgba(90,40,95,0.5) 85%, rgba(90,40,95,0.5) 86%,
                  transparent 86%, transparent 100%
                ),
                linear-gradient(180deg, #4a1d4f 0%, #3d1742 50%, #350d36 100%)
              `,
              borderBottom: '1px solid #2a0a2e',
              boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 1px 2px rgba(0,0,0,0.3)'
            }}>
              {/* Traffic Light Buttons - Candy Style */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full" style={{
                  background: 'radial-gradient(circle at 35% 35%, #ff6961, #ec5f59 45%, #d84942 65%, #c73d38)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                  border: '0.5px solid rgba(180,60,60,0.5)'
                }}></div>
                <div className="w-3 h-3 rounded-full" style={{
                  background: 'radial-gradient(circle at 35% 35%, #ffc52f, #ffbe2e 45%, #f0ac1e 65%, #e09e15)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                  border: '0.5px solid rgba(200,150,40,0.5)'
                }}></div>
                <div className="w-3 h-3 rounded-full" style={{
                  background: 'radial-gradient(circle at 35% 35%, #2dd04a, #28ca42 45%, #23b83a 65%, #1fa633)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                  border: '0.5px solid rgba(40,160,50,0.5)'
                }}></div>
              </div>
              {/* Workspace Name */}
              <div className="flex-1 text-center text-sm font-medium" style={{
                color: '#c0c0c0',
                textShadow: '0 1px 0 rgba(0,0,0,0.8)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Lucida Grande", sans-serif'
              }}>
                Faire
              </div>
              {/* Spacer */}
              <div className="w-[60px]"></div>
            </div>

            {/* Main Slack Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Sidebar */}
              <div className="w-64 bg-[#3f0e40] text-white flex flex-col">
                {/* Workspace Header */}
                <div className="px-3 py-2 border-b border-white/10">
                  {/* Workspace Name with Dropdown */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <button className="flex-1 flex items-center gap-1 hover:bg-white/10 px-2 py-1.5 rounded text-white">
                      <span className="font-bold text-[18px]">Faire</span>
                      <svg className="w-3.5 h-3.5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>

                  {/* Navigation Menu */}
                  <div className="space-y-0.5 text-[14px] mb-2">
                    <button className="w-full text-left px-2 py-1 hover:bg-white/10 rounded flex items-center gap-2 text-white/90">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Unreads</span>
                    </button>
                    <button className="w-full text-left px-2 py-1 hover:bg-white/10 rounded flex items-center gap-2 text-white/90">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span>Threads</span>
                    </button>
                    <button className="w-full text-left px-2 py-1 hover:bg-white/10 rounded flex items-center gap-2 text-white/90">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Huddles</span>
                    </button>
                    <button className="w-full text-left px-2 py-1 hover:bg-white/10 rounded flex items-center gap-2 text-white/90">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span>Drafts & sent</span>
                    </button>
                    <button className="w-full text-left px-2 py-1 hover:bg-white/10 rounded flex items-center gap-2 text-white/90">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>Directories</span>
                    </button>
                  </div>
                </div>

                {/* Channels List */}
                <div className="flex-1 overflow-y-auto px-3 py-2">
                  <div className="mb-5">
                    <button className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-1 px-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Channels</span>
                    </button>
                    <div className="space-y-0.5">
                      <div className="text-white/70 hover:bg-white/10 px-2 py-1 rounded flex items-center gap-2 cursor-pointer">
                        <span className="text-white/60">#</span>
                        <span>hack-week-2025</span>
                      </div>
                      <div className="text-white/70 hover:bg-white/10 px-2 py-1 rounded flex items-center gap-2 cursor-pointer">
                        <span className="text-white/60">#</span>
                        <span>ai-help</span>
                      </div>
                      <div className="text-white/70 hover:bg-white/10 px-2 py-1 rounded flex items-center gap-2 cursor-pointer">
                        <span className="text-white/60">#</span>
                        <span>general</span>
                      </div>
                      <div className="bg-[#1164A3] text-white px-2 py-1 rounded flex items-center gap-2 font-medium">
                        <span className="text-white/90">#</span>
                        <span>upmarket-plus-epdd</span>
                      </div>
                      <div className="text-white/70 hover:bg-white/10 px-2 py-1 rounded flex items-center gap-2 cursor-pointer">
                        <span className="text-white/60">#</span>
                        <span>ai-lab</span>
                      </div>
                      <div className="text-white/70 hover:bg-white/10 px-2 py-1 rounded flex items-center gap-2 cursor-pointer">
                        <span className="text-white/60">#</span>
                        <span>f-cursor</span>
                      </div>
                      <div className="text-white/70 hover:bg-white/10 px-2 py-1 rounded flex items-center gap-2 cursor-pointer">
                        <span className="text-white/60">#</span>
                        <span>launch-announcements</span>
                      </div>
                      <div className="text-white/70 hover:bg-white/10 px-2 py-1 rounded flex items-center gap-2 cursor-pointer">
                        <span className="text-white/60">#</span>
                        <span>bug-reports</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-1 px-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Direct messages</span>
                    </button>
                    <div className="space-y-0.5">
                      <div className="text-white/70 hover:bg-white/10 px-2 py-1 rounded flex items-center gap-2 cursor-pointer">
                        <img src="/leon.jpg" alt="Leon Kempers" className="w-5 h-5 rounded flex-shrink-0 object-cover" />
                        <span>Leon Kempers</span>
                      </div>
                      <div className="text-white/70 hover:bg-white/10 px-2 py-1 rounded flex items-center gap-2 cursor-pointer">
                        <img src="/sebastian.jpg" alt="Sebastian Villate" className="w-5 h-5 rounded flex-shrink-0 object-cover" />
                        <span>Sebastian Villate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col bg-white">
                {/* Channel Header */}
                <div className="border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-[#1d1c1d]"># upmarket-plus-epdd</span>
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-300 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-5 py-3">
                  {/* Date Divider */}
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <div className="text-xs font-bold text-gray-700 px-3 py-1 bg-white border border-gray-300 rounded-full shadow-sm">
                      Today
                    </div>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  {/* Previous messages */}
                  <div className="mb-3 hover:bg-gray-50 -mx-5 px-5 py-1">
                    <div className="flex gap-2">
                      <img src="/leon.jpg" alt="Leon Kempers" className="w-9 h-9 rounded flex-shrink-0 object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="font-black text-[15px] text-[#1d1c1d]">Leon Kempers</span>
                          <span className="text-xs text-gray-600">10:23 AM</span>
                        </div>
                        <div className="text-[15px] text-[#1d1c1d] leading-snug">
                          Great work on the latest deployment! Everything looks smooth 🚀
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 hover:bg-gray-50 -mx-5 px-5 py-1">
                    <div className="flex gap-2">
                      <img src="/sebastian.jpg" alt="Sebastian Villate" className="w-9 h-9 rounded flex-shrink-0 object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="font-black text-[15px] text-[#1d1c1d]">Sebastian Villate</span>
                          <span className="text-xs text-gray-600">10:24 AM</span>
                        </div>
                        <div className="text-[15px] text-[#1d1c1d] leading-snug">
                          thanks! great team effort all around
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User's sent message */}
                  {slackMessageSent && (
                    <div className="mb-3 hover:bg-gray-50 -mx-5 px-5 py-1 animate-fadeIn">
                      <div className="flex gap-2">
                        <img src="/john.jpg" alt="John Intrater" className="w-9 h-9 rounded flex-shrink-0 object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-black text-[15px] text-[#1d1c1d]">John Intrater</span>
                            <span className="text-xs text-gray-600">10:25 AM</span>
                          </div>
                          <div className="text-[15px] text-[#1d1c1d] leading-snug mb-2">
                            {sentMessageText}
                          </div>
                          <div className="flex items-start gap-2 p-3 bg-[#f8f8f8] border border-gray-200 rounded max-w-md">
                            <div className="flex-shrink-0 mt-0.5">
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-[#1264a3] truncate">vibe.faire.com</div>
                              <div className="text-xs text-gray-600 truncate">intrater-102125</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input Area */}
                <div className="border-t border-gray-300 px-5 pb-6 pt-5">
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors focus-within:border-[#1164a3] focus-within:shadow-md">
                    <div className="px-3 pt-2 pb-1 bg-white">
                      <textarea
                        ref={slackInputRef}
                        value={slackMessage}
                        onChange={(e) => setSlackMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (slackMessage.trim() && !slackMessageSent) {
                              // Send message immediately
                              setSentMessageText(slackMessage);
                              setShowSlackUrl(true);
                              setSlackMessageSent(true);
                              setSlackMessage('');
                              // Reset textarea height
                              if (slackInputRef.current) {
                                slackInputRef.current.style.height = '40px';
                              }
                            }
                          }
                        }}
                        placeholder="Message #upmarket-plus-epdd"
                        className="w-full text-[15px] text-[#1d1c1d] leading-snug resize-none outline-none bg-white min-h-[40px] max-h-[200px]"
                        rows={1}
                        style={{
                          height: 'auto',
                          minHeight: '40px'
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                        }}
                      />
                      {showSlackUrl && !slackMessageSent && (
                        <div className="flex items-start gap-2 p-3 mt-2 bg-[#f8f8f8] border border-gray-200 rounded hover:bg-gray-100 transition-colors">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[#1264a3] truncate">vibe.faire.com</div>
                            <div className="text-xs text-gray-600 truncate">intrater-102125</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-[#f8f8f8] px-3 py-2 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          if (slackMessage.trim() && !slackMessageSent) {
                            // Send message immediately
                            setSentMessageText(slackMessage);
                            setShowSlackUrl(true);
                            setSlackMessageSent(true);
                            setSlackMessage('');
                            // Reset textarea height
                            if (slackInputRef.current) {
                              slackInputRef.current.style.height = '40px';
                            }
                          }
                        }}
                        disabled={!slackMessage.trim() || slackMessageSent}
                        className={`px-4 py-1.5 rounded font-semibold text-[13px] shadow-sm flex items-center gap-1.5 transition-colors ${
                          slackMessage.trim() && !slackMessageSent
                            ? 'bg-[#007a5a] hover:bg-[#148567] text-white cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
