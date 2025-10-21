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
  const [terminalMinimized, setTerminalMinimized] = useState(false);
  const [cursorInput, setCursorInput] = useState('');
  const [cursorMessages, setCursorMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [browserScreenshot, setBrowserScreenshot] = useState('faire-screenshot.png');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const cursorInputRef = useRef<HTMLTextAreaElement>(null);

  const projectTypeOptions = ['Starting something new', 'Continuing on something'];
  const experienceTypeOptions = ['Brand experience', 'Retail experience', 'Logged-out experience'];
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

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
      if (trimmedCommand === 'vibe') {
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

      // Simulate loading completion after 5 seconds
      setTimeout(() => {
        setHistory(prev => [
          ...prev,
          { type: 'output', content: '✓ Setup complete. Your environment is ready.' },
          { type: 'output', content: '' },
          { type: 'output', content: 'You should see both a Cursor window and browser window pop up.' },
          { type: 'output', content: 'Click the yellow button to minimize this window.' },
          { type: 'output', content: '' },
        ]);
        setWorkflowStep('idle');
      }, 5000);
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
      setCursorInput('');

      // Simulate AI response after a short delay
      setTimeout(() => {
        setCursorMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I\'ll help you make the "Welcome back, Supper Club" text larger. Let me update the CSS for that heading.'
        }]);

        // Change browser screenshot after AI responds
        setBrowserScreenshot('faire-screenshot2.png');
      }, 1000);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative">
      {/* macOS Menu Bar */}
      <div className="bg-white/20 backdrop-blur-md border-b border-white/10 px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-6 text-white text-sm font-medium">
          <div className="font-bold text-lg"></div>
          <div>Finder</div>
          <div>File</div>
          <div>Edit</div>
          <div>View</div>
          <div>Go</div>
          <div>Window</div>
          <div>Help</div>
        </div>
        <div className="flex items-center gap-4 text-white text-xs">
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
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <div>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
        </div>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-16 right-8 space-y-4">
        {/* Macintosh HD - Reset Everything */}
        <div
          className="flex flex-col items-center gap-2 text-white cursor-pointer hover:bg-white/20 p-2 rounded group z-50 relative"
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
          }}
        >
          <div className="relative">
            {/* Hard Drive Body */}
            <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
              {/* Main drive shape */}
              <rect x="8" y="16" width="48" height="36" rx="4" fill="#E8E8E8" />
              <rect x="8" y="16" width="48" height="8" rx="4" fill="#F5F5F5" />
              {/* Drive details */}
              <circle cx="14" cy="20" r="1.5" fill="#4CAF50" />
              <rect x="18" y="19" width="12" height="2" rx="1" fill="#BDBDBD" />
              {/* Bottom shadow */}
              <ellipse cx="32" cy="52" rx="20" ry="2" fill="#000000" opacity="0.1" />
            </svg>
            {/* Finder icon overlay */}
            <div className="absolute bottom-1 right-0 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
            </div>
          </div>
          <div className="text-xs font-medium drop-shadow-lg">Macintosh HD</div>
        </div>

        {/* Projects Folder - Skip to Windows View */}
        <div
          className="flex flex-col items-center gap-2 text-white cursor-pointer hover:bg-white/20 p-2 rounded group"
          onClick={() => {
            setTerminalMinimized(true);
            setShowAppWindows(true);
            setWorkflowStep('idle');
          }}
        >
          <svg className="w-16 h-16" viewBox="0 0 64 64" fill="currentColor">
            <path d="M8 12c0-2.21 1.79-4 4-4h14l4 4h22c2.21 0 4 1.79 4 4v32c0 2.21-1.79 4-4 4H12c-2.21 0-4-1.79-4-4V12z" fill="#60a5fa" />
            <path d="M8 20h48v28c0 2.21-1.79 4-4 4H12c-2.21 0-4-1.79-4-4V20z" fill="#3b82f6" />
          </svg>
          <div className="text-xs font-medium drop-shadow-lg">Projects</div>
        </div>
      </div>

      {/* Terminal Window - Centered and Floating */}
      {!terminalMinimized && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-8">
          <div className="bg-[#292929]/75 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden">
            {/* Title Bar */}
            <div className="bg-[#323232]/75 backdrop-blur-md px-4 py-2.5 flex items-center border-b border-[#1e1e1e]">
              {/* Traffic Light Buttons */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 cursor-pointer"></div>
                <div
                  className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 cursor-pointer"
                  onClick={() => {
                    setTerminalMinimized(true);
                    setShowAppWindows(true);
                  }}
                ></div>
                <div className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 cursor-pointer"></div>
              </div>
            {/* Window Title */}
            <div className="flex-1 text-center text-[#b8b8b8] text-sm font-medium">
              Terminal
            </div>
            {/* Spacer for centering */}
            <div className="w-[60px]"></div>
          </div>

          {/* Terminal Content */}
          <div
            ref={terminalRef}
            className="bg-[#1e1e1e]/75 backdrop-blur-sm p-6 h-[500px] overflow-y-auto text-[#f5f5f5] font-mono text-sm leading-relaxed"
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((entry, index) => (
              <div
                key={index}
                className={`mb-0.5 ${
                  entry.type === 'prompt'
                    ? 'text-[#34d399] font-semibold mt-2'
                    : entry.type === 'command'
                    ? 'text-[#f5f5f5]'
                    : 'text-[#d1d5db]'
                }`}
              >
                {entry.content}
              </div>
            ))}

            {/* Show options when in selection mode */}
            {(workflowStep === 'project-type' || workflowStep === 'experience-type') && (
              <div className="my-1">
                {(workflowStep === 'project-type' ? projectTypeOptions : experienceTypeOptions).map((option, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 py-0.5"
                  >
                    <span className={idx === selectedIndex ? 'text-[#06b6d4]' : 'text-[#4b5563]'}>
                      {idx === selectedIndex ? '●' : '○'}
                    </span>
                    <span className={idx === selectedIndex ? 'text-[#06b6d4]' : 'text-[#9ca3af]'}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Show loading spinner */}
            {workflowStep === 'loading' && (
              <div className="my-1">
                <div className="flex items-center gap-2 text-[#06b6d4]">
                  <span className="text-lg">{spinnerFrames[loadingFrame]}</span>
                  <span>Setting up your environment. This will likely take 3-5 minutes.</span>
                </div>
                <div className="text-[#9ca3af] ml-6 mt-1">
                  Go grab a coffee and we will ping you when it is ready.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center mt-1">
              {workflowStep === 'idle' && (
                <>
                  <span className="text-[#34d399] mr-2">{getPromptText()}</span>
                  <div className="flex items-center relative">
                    <span className="text-[#f5f5f5] whitespace-pre">{currentInput}</span>
                    <span className="inline-block w-2 h-4 bg-[#f5f5f5]"></span>
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
          {/* Browser Window - Left */}
          <div className="w-[30%] h-3/4 bg-[#f5f5f5] rounded-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Title Bar */}
            <div className="bg-[#e8e8e8] px-4 py-2.5 flex items-center border-b border-[#d1d1d1]">
              {/* Traffic Light Buttons */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
              </div>
              {/* Window Title */}
              <div className="flex-1 text-center text-[#5a5a5a] text-sm font-medium">
                Safari
              </div>
              {/* Spacer */}
              <div className="w-[60px]"></div>
            </div>

            {/* Address Bar */}
            <div className="bg-white px-4 py-2 border-b border-[#d1d1d1] flex items-center gap-2">
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
              {/* URL Bar */}
              <div className="flex-1 bg-[#f5f5f5] rounded-md px-3 py-1.5 text-sm text-[#5a5a5a]">
                localhost:3000
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
                src={`/${browserScreenshot}`}
                alt="Faire homepage"
                className="w-full h-full object-cover object-left-top"
              />
            </div>
          </div>

          {/* Cursor Window - Right */}
          <div className="w-[70%] h-3/4 bg-[#1e1e1e] rounded-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Title Bar */}
            <div className="bg-[#323232] px-4 py-2.5 flex items-center border-b border-[#1e1e1e]">
              {/* Traffic Light Buttons */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
              </div>
              {/* Window Title */}
              <div className="flex-1 text-center text-[#b8b8b8] text-sm font-medium">
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

                  {/* Primary Save Button */}
                  <button className="w-full bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm py-2.5 px-4 rounded transition-colors font-semibold mb-2">
                    Save
                  </button>

                  {/* Secondary Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-transparent hover:bg-[#2d2d2d] text-[#cccccc] text-xs py-2 px-4 rounded transition-colors font-semibold border border-[#3d3d3d]">
                      Share
                    </button>
                    <button className="flex-1 bg-transparent hover:bg-[#2d2d2d] text-[#cccccc] text-xs py-2 px-4 rounded transition-colors font-semibold border border-[#3d3d3d]">
                      Help
                    </button>
                  </div>
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
                          onChange={(e) => setCursorInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleCursorSubmit(e);
                            }
                          }}
                          placeholder="Plan, search, build anything"
                          className="w-full bg-transparent outline-none text-[#cccccc] text-base resize-none placeholder:text-[#6e6e6e]"
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
                          <button type="button" className="flex items-center justify-center w-6 h-6 bg-[#3d3d3d] hover:bg-[#4d4d4d] text-[#cccccc] rounded text-xs font-semibold">
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
                <div className="flex-1 overflow-auto p-4">
                  {cursorMessages.map((message, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                          message.role === 'user' ? 'bg-[#3d3d3d] text-[#cccccc]' : 'bg-[#0e639c] text-white'
                        }`}>
                          {message.role === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className="flex-1">
                          <div className="text-[#cccccc] text-sm leading-relaxed">{message.content}</div>
                        </div>
                      </div>
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

    </div>
  );
}
