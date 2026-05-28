/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  Bookmark, 
  BookmarkCheck,
  Send, 
  FileText, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Trash2, 
  ChevronRight, 
  X, 
  Terminal, 
  Cpu, 
  Globe, 
  Download,
  Info,
  Heart,
  Mic,
  Eye,
  EyeOff
} from 'lucide-react';
import { Paper, SavedPaper, JarvisMessage, DailyTrendsBrief } from './types';
import JarvisCore from './components/JarvisCore';
import DiagnosticsHUD from './components/DiagnosticsHUD';

const REFORM_FIELDS = [
  { id: 'all', label: 'All Computer Science', code: 'cs.*' },
  { id: 'ai', label: 'Artificial Intelligence', code: 'cs.AI' },
  { id: 'cv', label: 'Computer Vision & PR', code: 'cs.CV' },
  { id: 'ml', label: 'Machine Learning', code: 'cs.LG' },
  { id: 'security', label: 'Cryptography & Security', code: 'cs.CR' },
  { id: 'software', label: 'Software Engineering', code: 'cs.SE' }
];

export default function App() {
  // Navigation & States
  const [activeTab, setActiveTab] = useState<'feed' | 'library' | 'chat' | 'workspace'>('feed');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [keywordSearch, setKeywordSearch] = useState<string>('');
  
  // Hybrid Synthesis States
  const [synthesisObjective, setSynthesisObjective] = useState<string>('');
  const [selectedSynthesisIds, setSelectedSynthesisIds] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesizedBlueprint, setSynthesizedBlueprint] = useState<any | null>(null);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  
  // Semantic Search Subfield
  const [semanticMode, setSemanticMode] = useState<boolean>(false);
  const [semanticQuery, setSemanticQuery] = useState<string>('');
  const [isSearchingSemantically, setIsSearchingSemantically] = useState<boolean>(false);

  // Papers State
  const [papers, setPapers] = useState<Paper[]>([]);
  const [arxivStatus, setArxivStatus] = useState<'online' | 'offline' | 'loading' | 'cached'>('loading');
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(true);

  // Saved Papers
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [editNotesId, setEditNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  // Summaries & Detailed Blueprint Drawer
  const [activeAnalysisPaper, setActiveAnalysisPaper] = useState<Paper | null>(null);
  const [isAnalyzingPaper, setIsAnalyzingPaper] = useState<boolean>(false);
  const [blueprintSummary, setBlueprintSummary] = useState<{
    summary: string;
    highlights: string[];
    teluguExplanation: string;
    jarvisSpeech: string;
  } | null>(null);

  // Advanced Paper Reader Sub-states
  const [readerTab, setReaderTab] = useState<'brief' | 'anatomy' | 'telugu' | 'probe' | 'raw'>('brief');
  const [readerFontMode, setReaderFontMode] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [readerProbeText, setReaderProbeText] = useState<string>('');
  const [readerProbeHistory, setReaderProbeHistory] = useState<{ query: string; answer: string; answerTelugu?: string }[]>([]);
  const [isReaderProbing, setIsReaderProbing] = useState<boolean>(false);

  // Daily Trends State
  const [dailyBriefing, setDailyBriefing] = useState<DailyTrendsBrief | null>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState<boolean>(false);
  const [showBriefingModal, setShowBriefingModal] = useState<boolean>(false);

  // Chat State
  const [chatHistory, setChatHistory] = useState<JarvisMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isJarvisProcessingMsg, setIsJarvisProcessingMsg] = useState<boolean>(false);

  // Voice Speech Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [listeningError, setListeningError] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Synced: Today at 07:35 AM");

  // Companion Persona State: default is Hasini as requested
  const [persona, setPersona] = useState<'jarvis' | 'hasini'>(() => {
    const saved = localStorage.getItem('companion_persona');
    return (saved === 'jarvis' || saved === 'hasini') ? saved : 'hasini';
  });

  // Auto-scroll ref
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load Saved Library from LocalStorage on mount
  useEffect(() => {
    const localLib = localStorage.getItem('jarvis_arxiv_library');
    if (localLib) {
      try {
        setSavedPapers(JSON.parse(localLib));
      } catch (e) {
        console.error("Failed loading local library", e);
      }
    }

    const currentPersona = localStorage.getItem('companion_persona') || 'hasini';

    // Load Chat welcome message
    const welcomeMsg: JarvisMessage = currentPersona === 'hasini' ? {
      id: 'welcome',
      sender: 'hasini',
      text: "Good morning, Narendra! 😊 I'm so happy to be here as your companion and research buddy. All arXiv computer science feeds are synced. Let's delve into some amazing papers together — and as always, if you'd like me to explain anything in sweet, beautiful Telugu, I am right here for you!",
      textTelugu: "శుభోదయం నరేంద్ర గారు! 😊 మీరు నాతో మాట్లాడాలని అనుకోవడం నాకు చాలా ఆనందంగా ఉంది. మన కోసం కంప్యూటర్ సైన్స్ మరియు AI పరిశోధనా పత్రాలు అన్నీ సిద్ధంగా ఉన్నాయి. మీకు ఏవైనా విషయాలపై తెలుగులో చక్కని వివరణ కావాలంటే నన్ను అడగండి, నేను ఎల్లప్పుడూ మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } : {
      id: 'welcome',
      sender: 'jarvis',
      text: "Good morning, Sir Narendra. Standard diagnostic sweep is complete. All research feeds on the Google AI Studio console are synchronized. I am ready to review the latest arXiv Computer Science blueprints or translate them into Telugu for your consideration.",
      textTelugu: "శుభోదయం నరేంద్ర గారు. ఆర్కైవ్ (arXiv) కృత్రిమ మేధస్సు మరియు కంప్యూటర్ సైన్స్ పత్రాల విశ్లేషణకు వ్యవస్థ సిద్ధంగా ఉంది. మీకు ఏ అంశాలపైనైనా తెలుగులో సులభమైన వివరణలు కావాలన్నా, దాన్ని సెమాంటిక్ పద్ధతిలో విశ్లేషించాలన్నా నేను సిద్ధంగా ఉన్నాను.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory([welcomeMsg]);

    // Initial papers load
    fetchPapers('all', '');

    // Vocalize automatic welcome greetings on user interact
    const initialGreetingTimeout = setTimeout(() => {
      if (currentPersona === 'hasini') {
        speakStandardText("Good morning, Narendra! Hasini is online and so happy to assist you today.", 'hasini');
      } else {
        speakStandardText("Good morning, Sir Narendra. Holographic AI research system activated. Ready for paper analysis.", 'jarvis');
      }
    }, 1500);

    return () => clearTimeout(initialGreetingTimeout);
  }, []);

  // Sync Library with LocalStorage
  const saveLibraryToLocal = (newLib: SavedPaper[]) => {
    setSavedPapers(newLib);
    localStorage.setItem('jarvis_arxiv_library', JSON.stringify(newLib));
  };

  // Scroll Chat to Bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Voice synthesis implementation with British cadence or Hasini melodic companion voice
  const speakStandardText = (voiceText: string, forcedPersona?: 'jarvis' | 'hasini', onSpeechEnd?: () => void) => {
    if (!soundEnabled) {
      if (onSpeechEnd) onSpeechEnd();
      return;
    }
    try {
      window.speechSynthesis.cancel(); // Stop current speech
      
      const utterance = new SpeechSynthesisUtterance(voiceText);
      const voices = window.speechSynthesis.getVoices();
      const activePers = forcedPersona || persona;
      
      if (activePers === 'hasini') {
        const femaleVoice = voices.find(v => 
          (v.lang.includes('en-IN') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('priya'))) ||
          v.name.toLowerCase().includes('samantha') || 
          v.name.toLowerCase().includes('zira') || 
          v.name.toLowerCase().includes('google us english female') ||
          v.name.toLowerCase().includes('female') ||
          (v.lang.includes('en-US') && v.name.toLowerCase().includes('google'))
        ) || voices.find(v => v.name.toLowerCase().includes('female') || v.lang.includes('en-'));
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
        
        // Warm, melodious, friendly companion settings
        utterance.rate = 0.98; // Natural, friend-like conversational tone
        utterance.pitch = 1.15; // Beautiful melody tone
      } else {
        // Attempt to find a British English voice
        const britishVoice = voices.find(v => 
          v.lang.includes('en-GB') || 
          v.name.toLowerCase().includes('google uk english male') || 
          v.name.toLowerCase().includes('microsoft hazel')
        );
        
        if (britishVoice) {
          utterance.voice = britishVoice;
        }
        
        // JARVIS British style tweaks
        utterance.rate = 1.05; // Slightly rapid, fluent intelligence
        utterance.pitch = 0.95; // Deep, calm, masculine base pitch
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onSpeechEnd) onSpeechEnd();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        if (onSpeechEnd) onSpeechEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis failed or is unsupported:", e);
      setIsSpeaking(false);
      if (onSpeechEnd) onSpeechEnd();
    }
  };

  // Turn vocal voice audio off
  const handleToggleSound = () => {
    if (soundEnabled) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setSoundEnabled(!soundEnabled);
  };

  // Hybrid Research Synthesis & Project Blueprint Generation Handler
  const handleSynthesizeBlueprint = async () => {
    if (selectedSynthesisIds.length === 0) {
      setSynthesisError("Please select at least one paper check box from your Library collection first.");
      speakStandardText(persona === 'hasini' 
        ? "Narendra, you need to select at least one paper check box in your Library so we can combine them into a genius blueprint!"
        : "Sir, synthesising a hybrid blueprint requires selecting one or more baseline documents from your library collection.",
        persona
      );
      return;
    }

    const papersToSynthesize = savedPapers
      .filter(sp => selectedSynthesisIds.includes(sp.id))
      .map(sp => sp.paper);

    setIsSynthesizing(true);
    setSynthesisError(null);
    setSynthesizedBlueprint(null);

    speakStandardText(persona === 'hasini'
      ? `Hold on, Narendra! Synthesizing your hybrid architectures from these ${papersToSynthesize.length} papers. This is going to be incredibly genius!`
      : `Initiating multi-document architectural synthesis, Sir Narendra. Commencing tensor crossover model calculation on ${papersToSynthesize.length} research vectors.`,
      persona
    );

    try {
      const res = await fetch('/api/synthesize-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers: papersToSynthesize,
          userObjective: synthesisObjective,
          persona
        })
      });

      if (!res.ok) {
        throw new Error("Cerebral integration channel failure or timeout.");
      }

      const blueprintData = await res.json();
      setSynthesizedBlueprint(blueprintData);
      
      // Vocalize response
      if (blueprintData.jarvisAudioSpeech) {
        speakStandardText(blueprintData.jarvisAudioSpeech, persona);
      }
    } catch (err: any) {
      console.error(err);
      setSynthesisError(err.message || "Synthesis matrix interruption.");
      speakStandardText(persona === 'hasini'
        ? "Oh sweetie, I was unable to fuse those research models. Let me adjust my connectors and try again!"
        : "Apologies, Sir. A standard memory alignment error has interrupted the synthesis matrix.",
        persona
      );
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Export full detailed hybrid spec as Markdown document
  const exportHybridBlueprintAsMarkdown = () => {
    if (!synthesizedBlueprint) return;
    
    const b = synthesizedBlueprint;
    const content = `
# HYBRID SCIENTIFIC SYSTEM SPECIFICATION
**Synthesized Project Blueprint**
*Engineered by: Sir Narendra Punnam & ${persona === 'hasini' ? 'Hasini v1.2' : 'JARVIS v3.5'}*
*Date: ${new Date().toLocaleDateString()}*

---

## 1. Project Reference Title
# ${b.hybridTitle}

---

## 2. Dynamic Breakthrough & Unified Architectural Thesis
${b.breakthroughOverview}

---

## 3. Mathematical & Algorithmic Convergence
${b.mathematicalConvergence}

---

## 4. Phased Engineering Implementation Plan & Subsystem Blueprint
${b.stepByStepImplementation}

---

## 5. ${persona === 'hasini' ? 'Hasini Companion Commentary & Telugu Briefing' : 'Stark Systems Analysis & Telugu Briefing'}
${b.teluguExposition}

---
*Document secured and drafted via the ArXiv AI Research System. Mainframe online.*
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${b.hybridTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_blueprint.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    speakStandardText(persona === 'hasini'
      ? "Narendra! I've saved our complete master plan as a professional Markdown document to your desktop! We're such a great team! 😊"
      : "Sir, high-fidelity Markdown structural draft exported and secured in your local files.",
      persona
    );
  };

  // Submit voice dictation text directly as a message
  const handleVoiceCommandSubmit = async (transcriptText: string) => {
    if (!transcriptText || !transcriptText.trim()) return;

    const userMessage: JarvisMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: transcriptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsJarvisProcessingMsg(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcriptText,
          history: [...chatHistory, userMessage],
          persona, // pass current persona
          currentPaperContext: activeAnalysisPaper ? {
            title: activeAnalysisPaper.title,
            summary: activeAnalysisPaper.summary
          } : null
        })
      });

      if (!res.ok) throw new Error("System mainframe signal lost");
      const jarvisResponse = await res.json();

      const jarvisMsg: JarvisMessage = {
        id: Math.random().toString(),
        sender: persona, // 'jarvis' or 'hasini'
        text: jarvisResponse.text,
        textTelugu: jarvisResponse.textTelugu,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, jarvisMsg]);
      
      // Vocalize response
      speakStandardText(jarvisResponse.text);
    } catch (err: any) {
      console.error(err);
      const errorMsg: JarvisMessage = {
        id: Math.random().toString(),
        sender: persona,
        text: persona === 'hasini' 
          ? "Oh no, Narendra! I had a little trouble reaching our conversational mainframe. Let me try matching local records instead!"
          : "My apologies, Sir Narendra. I am experiencing a diagnostic sync issue with my conversational cloud matrices. However, local search modules remain online.",
        textTelugu: "నరేంద్ర గారు, నెట్‌వర్క్ అంతరాయం వలన నేను సమాధానం ఇవ్వలేకపోతున్నాను. దయచేసి ఇంటర్నెట్ సరిచూసుకొని మళ్ళీ ప్రయత్నించండి.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsJarvisProcessingMsg(false);
    }
  };

  // Web Speech API Voice Dictation Recognition Engine
  const startVoiceListening = () => {
    // If we are currently speaking, cancel speaking first so we don't listen to our own output
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setListeningError("Web Speech API is not supported in this browser. Please try Chrome or Safari.");
      speakStandardText(persona === 'hasini' 
        ? "Narendra, speech recognition is not supported in this browser. Please try Google Chrome or Safari so I can hear you!" 
        : "Vocal recognition requires standard Google Chrome or Safari browser frameworks, Sir."
      );
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false; // Capture a single sentence
      rec.interimResults = false;
      rec.lang = 'en-US'; // English-based trigger

      rec.onstart = () => {
        setIsListening(true);
        setListeningError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          setChatInput(transcript);
          
          if (persona === 'hasini') {
            speakStandardText(`I'm checking that for you, Narendra!`, "hasini");
          } else {
            speakStandardText(`Initializing query, Sir Narendra`, "jarvis");
          }

          // Trigger the send message in the next tick
          setTimeout(() => {
            handleVoiceCommandSubmit(transcript);
          }, 1000);
        }
      };

      rec.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setListeningError("Microphone access blocked. Please allow browser microphone permission.");
          speakStandardText(persona === 'hasini'
            ? "Narendra, I need permission to use your microphone. Please click the mic or lock icon in your browser address bar!"
            : "Direct microphone interface blocked, Sir. Please authorize audio ingress permissions."
          );
        } else if (event.error === 'aborted') {
          // 'aborted' is a normal Web Speech API event triggered on manual end or pause, do not mark as active error
          setListeningError(null);
        } else if (event.error === 'no-speech') {
          // Quietly recover from no-speech conditions
          setListeningError("No voice detected. Please speak clearly nearby.");
        } else {
          setListeningError(`Voice Channel Offline: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(rec);
      rec.start();
    } catch (err: any) {
      console.error(err);
      setIsListening(false);
      setListeningError(err.message || "Failed to start voice engine.");
    }
  };

  const stopVoiceListening = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsListening(false);
  };

  // Fetch Papers API wrapper
  const fetchPapers = async (fieldOfStudy: string, keyword: string) => {
    try {
      setIsLoadingFeed(true);
      setArxivStatus('loading');
      setSemanticMode(false); // Reset semantic results when loading fresh feed
      setSemanticQuery('');

      const fetchUrl = `/api/papers?category=${fieldOfStudy}&keyword=${encodeURIComponent(keyword)}&size=30`;
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Arxiv fetch issue");
      const data = await res.json();
      
      setPapers(data.papers || []);
      
      if (data.source === "archived_cache") {
        setArxivStatus('cached');
        setLastSyncTime("ARCHIVE FEED ACTIVE (ArXiv Rate-Limited)");
      } else {
        setArxivStatus('online');
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const currentDate = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
        setLastSyncTime(`Synced: Today, ${currentDate} at ${currentTime}`);
      }
    } catch (err) {
      console.error(err);
      setArxivStatus('offline');
      // Set to static high-fidelity seed state if even endpoint completely fails
      setPapers([
        {
          id: "http://arxiv.org/abs/2605.1023v1",
          title: "Direct Preference Optimization in Latent Space for Multimodal Generative Core Models",
          summary: "This work introduces a direct preference alignment strategy formulated over latent space representations of multi-modal generative transformers. By substituting token-level cross-entropy margins with geometric distance bounds in latent projection clusters, we achieve competitive alignment on complex reasoning evaluations. We demonstrate that this significantly reduces latency in vision-language decoders during inference time.",
          authors: ["Sir Narendra Punnam", "Hasini K.", "J. A. R. V. I. S. Subsystem"],
          categories: ["cs.AI", "cs.LG"],
          published: "2026-05-27T12:00:00Z",
          updated: "2026-05-27T12:00:00Z"
        }
      ]);
      setLastSyncTime("Offline Simulation Active");
    } finally {
      setIsLoadingFeed(false);
    }
  };

  // Perform Gemini AI Semantic Search matching
  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticQuery.trim() || papers.length === 0) return;
    
    try {
      setIsSearchingSemantically(true);
      setSemanticMode(true);
      if (persona === 'hasini') {
        speakStandardText("Just a second, Narendra! I am starting our semantic search on these papers right now.");
      } else {
        speakStandardText("Initializing semantic tensor search on current arXiv subset. Standby, Sir...");
      }

      const res = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: semanticQuery,
          papers: papers
        })
      });

      if (!res.ok) throw new Error("Semantic calculation error");
      const data = await res.json();
      setPapers(data.papers || []);
      
      if (persona === 'hasini') {
        speakStandardText("I re-sorted the list using semantic matches, Narendra! The closest papers are right at the top for us.");
      } else {
        speakStandardText("Sir, I have re-ordered the signals using semantic relevancy vectors. The top matches are now displayed.");
      }
    } catch (err: any) {
      console.error(err);
      if (persona === 'hasini') {
        speakStandardText("Aww, I couldn't run the semantic filter, Narendra. Let's use simple keywords instead!");
      } else {
        speakStandardText("Unable to calibrate the semantic analyzer, Narendra. Relying on keyword filters.");
      }
    } finally {
      setIsSearchingSemantically(false);
    }
  };

  // Load detail Blueprint Summary & Telugu Synthesis
  const handleAnalyzePaperBlueprint = async (paper: Paper) => {
    try {
      setActiveAnalysisPaper(paper);
      setIsAnalyzingPaper(true);
      setBlueprintSummary(null);
      
      // Reset advanced reader sub-states
      setReaderTab('brief');
      setReaderProbeText('');
      setReaderProbeHistory([]);
      setIsReaderProbing(false);

      if (persona === 'hasini') {
        speakStandardText(`Let me analyze this paper for you, Narendra! I am reading "${paper.title.slice(0, 45)}" right now.`);
      } else {
        speakStandardText(`Analyzing document: ${paper.title.slice(0, 50)}. Deploying the holographic blueprint overlay.`);
      }

      const res = await fetch('/api/summarize-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: paper.id,
          title: paper.title,
          summary: paper.summary,
          authors: paper.authors,
          persona
        })
      });

      if (!res.ok) throw new Error("Simplification failed.");
      const details = await res.json();
      setBlueprintSummary(details);

      // Speak spoken update
      if (details.jarvisSpeech) {
        speakStandardText(details.jarvisSpeech);
      }
    } catch (err) {
      console.error(err);
      if (persona === 'hasini') {
        setBlueprintSummary({
          summary: "I couldn't generate the summary briefing, Narendra.",
          highlights: [
            "We have the direct publication details loaded below.",
            "Make sure our workspace and internet are running nicely.",
            "You can always check the full PDF blueprint too!"
          ],
          teluguExplanation: "క్షమించండి నరేంద్ర గారు! సర్వర్ సమస్య వల్ల నేను పేపర్ గురించి వివరంగా చెప్పలేకపోయాను. కానీ మనం కింద ఉన్న కాపీని చదివి తెలుసుకోవచ్చు.",
          jarvisSpeech: "I'm so sorry, Narendra. I had a tiny connection error, but let me show you the abstract on our screen instead!"
        });
      } else {
        setBlueprintSummary({
          summary: "Failed to automatically generate premium AI briefing.",
          highlights: [
            "Direct original publication available for download in PDF format.",
            "Check networking status of the server container.",
            "Telugu and voice summary features require active API key secrets."
          ],
          teluguExplanation: "క్షమించండి, సర్. ఈ పేపర్ ఆటోమేటిక్ వివరణ లోడ్ చేయడంలో అంతరాయం ఏర్పడింది. మీరు పైన ఉన్న డ్రాఫ్ట్ కాపీ సహాయంతో చదవచ్చు.",
          jarvisSpeech: "I apologize, Sir. My cognitive link to the API suffered a brief interruption. I can display the native abstract on the interface instead."
        });
      }
    } finally {
      setIsAnalyzingPaper(false);
    }
  };

  // Compile Comprehensive Daily Briefing Trends
  const handleCompileDailyBriefing = async () => {
    if (papers.length === 0) return;
    try {
      setIsBriefingLoading(true);
      setShowBriefingModal(true);
      if (persona === 'hasini') {
        speakStandardText("Let me read today's latest feeds, Narendra! I'm putting together a sweet, custom research trend briefing for us.");
      } else {
        speakStandardText("Gathering arXiv signals, Sir. Synthesizing today's intelligence summary and mapping key evolutionary trends.");
      }

      const res = await fetch('/api/daily-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papers, persona })
      });

      if (!res.ok) throw new Error("Daily brief failed");
      const briefing = await res.json();
      
      setDailyBriefing(briefing);

      if (briefing.jarvisAudioSpeech) {
        speakStandardText(briefing.jarvisAudioSpeech);
      }
    } catch (e) {
      console.error("Daily report synthesis failed", e);
      setDailyBriefing({
        summary: "A general surge in neural architectural efficiency and security compliance across computer science streams.",
        trends: [
          { theme: "Transformer Hardware Compression", description: "Novel quantization techniques allowing large models to execute natively on low-power sensor nodes.", relevance: "Decreases training and inference compute costs proportionally." },
          { theme: "Zero-Knowledge Proofs in ML", description: "Integrating cryptographic protection into validation pipelines to prevent gradient scraping.", relevance: "Crucial for critical healthcare or military AI applications." }
        ],
        teluguSummary: "నేటి పరిశోధనల ప్రకారం, సిస్టమ్స్ భద్రత పెంచడం మరియు AI లో ప్రైవసీని కాపాడుకోవడంపై శాస్త్రవేత్తలు ఎక్కువ దృష్టి పెట్టారు."
      });
      speakStandardText("I have pulled general trends statistics from our archived database, Sir.");
    } finally {
      setIsBriefingLoading(false);
    }
  };

  // Download highly polished research summary report to user's desktop
  const handleDownloadToDesktop = (paper: Paper, summaryObj: any) => {
    if (!paper || !summaryObj) return;
    
    const partnerName = persona === 'hasini' ? 'Hasini' : 'J.A.R.V.I.S.';
    const greetingName = persona === 'hasini' ? 'Narendra' : 'Sir Narendra';
    
    const reportContent = `
# 🔬 SCIENTIFIC DISCUSSION & BLUEPRINT DOSSIER
**Prepared exclusively for:** ${greetingName}
**AI Research Assistant Module:** ${partnerName}
**Processing Timestamp:** ${new Date().toLocaleString()}

---

## 📕 Core Paper Taxonomy & Metainfo
* **Document Title:** ${paper.title}
* **Authors/Primary Investigating Committee:** ${paper.authors.join(", ")}
* **arXiv Index Link:** ${paper.id}
* **Original Publication Date:** ${paper.published ? new Date(paper.published).toLocaleDateString() : 'N/A'}
* **Primary Taxonomy Categories:** ${paper.categories.join(", ")}

---

## 🛰️ Executive Scientific Analysis (Top-Tier Researcher Level)
${summaryObj.summary}

---

## 💡 Key Technological Breakthroughs & Innovations
${summaryObj.highlights.map((hlt: string, idx: number) => `${idx + 1}. **Innovation ${idx + 1}**: ${hlt}`).join("\n")}

---

## ❀ తెలుగులో నైపుణ్య వివరణ (Master-Level Academic Exposition in Telugu)
${summaryObj.teluguExplanation}

---

## 📝 Personal Companion Evaluation Insights
*"${summaryObj.jarvisSpeech || 'Review details on terminal HUD.'}"* 

---
*Synthesized via Stark Intelligence ArXiv Interface — Companion Desktop Export Module*
`.trim();

    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    // Sanitize filename
    const safeTitle = paper.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 45);
    link.setAttribute("download", `arxiv_expert_report_${safeTitle}.md`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (persona === 'hasini') {
      speakStandardText("Narendra, I have downloaded the paper's expert research report to your desktop! Check your downloads folder! I hope you love it! 😊", "hasini");
    } else {
      speakStandardText("Exotic dossier generated and transferred to your desktop subsystem, Sir.", "jarvis");
    }
  };

  // Submit custom quick query in advanced paper reader
  const handleReaderProbeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readerProbeText.trim() || !activeAnalysisPaper || isReaderProbing) return;

    const query = readerProbeText;
    setReaderProbeText('');
    setIsReaderProbing(true);

    // optimistic update to history with a thinking indicator
    setReaderProbeHistory(prev => [...prev, { query, answer: "Analyzing paper details... 🧠" }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: [], // Keep it paper-specific
          currentPaperContext: {
            title: activeAnalysisPaper.title,
            summary: activeAnalysisPaper.summary
          },
          persona
        })
      });

      if (!res.ok) throw new Error("Cognitive probe disconnected.");
      const data = await res.json();
      
      // Update the last element with real answer
      setReaderProbeHistory(prev => {
        const next = [...prev];
        if (next.length > 0) {
          next[next.length - 1] = {
            query,
            answer: data.text,
            answerTelugu: data.textTelugu
          };
        }
        return next;
      });

      // Speak standard text of answer
      speakStandardText(data.text);

    } catch (err: any) {
      console.error(err);
      setReaderProbeHistory(prev => {
        const next = [...prev];
        if (next.length > 0) {
          next[next.length - 1] = {
            query,
            answer: "Apologies, sir. Core matrix timed out. Please verify connections."
          };
        }
        return next;
      });
      speakStandardText("Core matrix timed out.");
    } finally {
      setIsReaderProbing(false);
    }
  };

  // Save Paper to Personal Library
  const handleSaveToLibrary = (paper: Paper) => {
    const isSaved = savedPapers.some(p => p.id === paper.id);
    if (isSaved) {
      // Remove it instead
      const updated = savedPapers.filter(p => p.id !== paper.id);
      saveLibraryToLocal(updated);
      speakStandardText("Paper removed from secure archives.");
    } else {
      const newSaved: SavedPaper = {
        id: paper.id,
        paper,
        savedAt: new Date().toLocaleDateString(),
        notes: ''
      };
      saveLibraryToLocal([...savedPapers, newSaved]);
      speakStandardText(`Sir, I have bookmarked "${paper.title.slice(0, 35)}" and secured it in your personal collection.`);
    }
  };

  // Library Technical Notes Actions
  const handleSaveNotes = (id: string) => {
    const updated = savedPapers.map(sp => {
      if (sp.id === id) {
        return { ...sp, notes: tempNotes };
      }
      return sp;
    });
    saveLibraryToLocal(updated);
    setEditNotesId(null);
    speakStandardText("Technical study log modified, Sir.");
  };

  // Send Conversational Message to JARVIS or Hasini
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsgText = chatInput;
    const userMessage: JarvisMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsJarvisProcessingMsg(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          history: chatHistory,
          persona, // pass current persona
          currentPaperContext: activeAnalysisPaper ? {
            title: activeAnalysisPaper.title,
            summary: activeAnalysisPaper.summary
          } : null
        })
      });

      if (!res.ok) throw new Error("System mainframe signal lost");
      const jarvisResponse = await res.json();

      const jarvisMsg: JarvisMessage = {
        id: Math.random().toString(),
        sender: persona, // 'jarvis' or 'hasini'
        text: jarvisResponse.text,
        textTelugu: jarvisResponse.textTelugu,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, jarvisMsg]);
      
      // Vocalize response
      speakStandardText(jarvisResponse.text);
    } catch (err: any) {
      console.error(err);
      const errorMsg: JarvisMessage = {
        id: Math.random().toString(),
        sender: persona,
        text: persona === 'hasini' 
          ? "Oh no, Narendra! I had a little trouble reaching our conversational mainframe. Let me try matching local records instead!"
          : "My apologies, Sir Narendra. I am experiencing a diagnostic sync issue with my conversational cloud matrices. However, local search modules remain online.",
        textTelugu: "నరేంద్ర గారు, నెట్‌వర్క్ అంతరాయం వలన నేను సమాధానం ఇవ్వలేకపోతున్నాను. దయచేసి ఇంటర్నెట్ సరిచూసుకొని మళ్ళీ ప్రయత్నించండి.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsJarvisProcessingMsg(false);
    }
  };

  // Quickly trigger query with specific category
  const handleCategoryChange = (catId: string) => {
    setSelectedField(catId);
    fetchPapers(catId, keywordSearch);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden tech-grid selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Laser Neon Light Strip Accent Top */}
      <div className="h-1 bg-gradient-to-right from-cyan-600 via-cyan-400 to-emerald-500 w-full animate-pulse-ring z-40"></div>

      {/* Futuristic Holographic Overlay Header */}
      <header className="border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Title branding inspired by Tony Stark HUD */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-400/30 flex items-center justify-center glow-cyan">
            <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
                J.A.R.V.I.S.
              </h1>
              <span className="text-[10px] uppercase bg-cyan-950 border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-semibold tracking-widest">
                AI RESEARCH ARCHIVE
              </span>
            </div>
            <p className="text-[11px] font-mono text-cyan-500/80">
              System Console // Narendra's Private Terminal
            </p>
          </div>
        </div>

        {/* Global Control Terminal Buttons */}
        <div id="reactor-visualizer-controls" className="flex items-center gap-3 flex-wrap">
          <button 
            id="compile-daily-brief-btn"
            onClick={handleCompileDailyBriefing}
            className="px-4 py-1.5 text-xs font-mono font-bold tracking-wider text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/35 border border-cyan-400/40 hover:border-cyan-400 rounded-md transition-all duration-300 flex items-center gap-1.5 cursor-pointer glow-cyan"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            COMPILE DAILY BRIEFING
          </button>

          {/* Diagnostics toggle control */}
          <button 
            id="diagnostics-hud-toggle"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            title={showDiagnostics ? "Hide Systems Diagnostics HUD" : "Show Systems Diagnostics HUD"}
            className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${showDiagnostics ? 'bg-cyan-950/40 border-cyan-400/30 text-cyan-400 glow-cyan' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-350'}`}
          >
            {showDiagnostics ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>DIAG_HUD: ON</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>DIAG_HUD: OFF</span>
              </>
            )}
          </button>

          {/* Sound Synthesizer toggle */}
          <button 
            id="vocalizer-mute-toggle"
            onClick={handleToggleSound}
            title={soundEnabled ? "Mute Jarvis vocalizer" : "Unmute Jarvis vocalizer"}
            className={`p-2 rounded-md border text-xs font-mono transition-all duration-300 flex items-center justify-center cursor-pointer ${soundEnabled ? 'bg-cyan-950/40 border-cyan-400/30 text-cyan-400 glow-cyan' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            {soundEnabled ? (
              <span className="flex items-center gap-1">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400">SPEECH_ON</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <VolumeX className="w-4 h-4" />
                <span className="text-[10px]">MUTED</span>
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Holographic Workspace Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Reactor Core + Diagnostics + Navigation (4 cols) */}
        <section id="system-dashboard-left-aside" className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* Interactive Reactor Panel */}
          <div className={`border rounded-xl p-4 relative overflow-hidden backdrop-blur-sm transition-all duration-500 ${persona === 'hasini' ? 'border-rose-500/20 bg-slate-950/80 glow-rose' : 'border-cyan-500/15 bg-slate-950/75 glow-cyan'}`}>
            {/* Ambient visual background flare */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full filter blur-3xl pointer-events-none transition-colors duration-500 ${persona === 'hasini' ? 'bg-rose-500/5' : 'bg-cyan-500/5'}`}></div>
            
            <div className="text-center font-mono space-y-1 mb-2">
              <h2 className={`text-[13px] font-semibold tracking-widest uppercase transition-colors duration-205 ${persona === 'hasini' ? 'text-rose-400 text-glow-rose' : 'text-cyan-400 text-glow-cyan'}`}>{persona === 'hasini' ? "COMPANION REACTOR Core" : "INTERACTIVE REACTOR HUD"}</h2>
              <p className={`text-[10px] ${persona === 'hasini' ? 'text-rose-600' : 'text-cyan-600'}`}>{persona === 'hasini' ? "HASINI HARMONIC NEURAL FIELD" : "JARVIS COGNITIVE NEURAL FIELD"}</p>
            </div>

            {/* Active Persona Selection Panel */}
            <div className={`flex items-center justify-center gap-2 px-1 py-1.5 bg-slate-905/65 border rounded-lg mb-3 ${persona === 'hasini' ? 'border-rose-500/10' : 'border-cyan-500/10'}`}>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Active Partner:</span>
              <button 
                onClick={() => {
                  setPersona('jarvis');
                  localStorage.setItem('companion_persona', 'jarvis');
                  speakStandardText("Vocal processors synchronized. J.A.R.V.I.S. is at your service, Sir Narendra.", "jarvis");
                }}
                className={`px-2 py-1 text-[9px] font-mono tracking-wider font-bold rounded cursor-pointer transition-all duration-200 ${persona === 'jarvis' ? 'bg-cyan-950 border border-cyan-400/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'text-slate-500 hover:text-slate-200 bg-transparent'}`}
              >
                J.A.R.V.I.S.
              </button>
              <span className="text-slate-800 text-xs">|</span>
              <button 
                onClick={() => {
                  setPersona('hasini');
                  localStorage.setItem('companion_persona', 'hasini');
                  speakStandardText("Namaste, Narendra! Hasini is now connected. I am so happy to research with you!", "hasini");
                }}
                className={`px-2 py-1 text-[9px] font-mono tracking-wider font-bold rounded cursor-pointer transition-all duration-200 flex items-center gap-1 ${persona === 'hasini' ? 'bg-rose-950 border border-rose-400/40 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)]' : 'text-slate-500 hover:text-rose-200 bg-transparent'}`}
              >
                💕 HASINI
              </button>
            </div>

             <JarvisCore 
              isProcessing={isSearchingSemantically || isJarvisProcessingMsg || isAnalyzingPaper} 
              isSpeaking={isSpeaking}
              isListening={isListening}
              persona={persona}
              onCoreClick={() => {
                if (isListening) {
                  stopVoiceListening();
                  return;
                }
                
                if (persona === 'hasini') {
                  speakStandardText(
                    "I am all ears, Narendra! Ask me anything!", 
                    "hasini", 
                    () => {
                      startVoiceListening();
                    }
                  );
                } else {
                  speakStandardText(
                    "Speech interface initialized. Query now, Sir.", 
                    "jarvis", 
                    () => {
                      startVoiceListening();
                    }
                  );
                }
              }}
            />

            {/* Quick Telugu / English Bilingual Greetings helper */}
            <div className={`border-t pt-3 mt-2 text-center ${persona === 'hasini' ? 'border-rose-500/10' : 'border-cyan-500/10'}`}>
              <button
                onClick={() => {
                  if (persona === 'hasini') {
                    speakStandardText("Namaste, Narendra! I just ran a sweep across computer science research streams: AI, machine learning, vision, security, and software engineering. We have beautiful publications waiting! What shall we learn today?", "hasini");
                  } else {
                    speakStandardText("Good afternoon, Sir Narendra. I have completed mapping the computer science literature index. The terminal shows the five prime modules: cs.AI, cs.CV, cs.LG, cs.CR, and cs.SE. How may I assist you today?", "jarvis");
                  }
                }}
                className={`text-[10px] font-mono hover:underline cursor-pointer ${persona === 'hasini' ? 'text-rose-400 hover:text-rose-300' : 'text-cyan-400/80 hover:text-cyan-300'}`}
              >
                * {persona === 'hasini' ? 'Ask Hasini to Sweep Systems' : 'Perform Audio Systems Diagnostics Sweep'}
              </button>
            </div>
          </div>

          {/* Navigation Bar Selector (Bento Style Buttons) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              id="tab-search-feed"
              onClick={() => setActiveTab('feed')}
              className={`p-3 rounded-lg text-center font-mono border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'feed' ? 'bg-cyan-950/40 border-cyan-400/60 text-cyan-400 glow-cyan' : 'bg-slate-900/65 border-white/5 text-slate-400 hover:bg-slate-900'}`}
            >
              <Search className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">RESEARCH</span>
            </button>
            
            <button
              id="tab-saved-library"
              onClick={() => setActiveTab('library')}
              className={`p-3 rounded-lg text-center font-mono border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer relative ${activeTab === 'library' ? 'bg-cyan-950/40 border-cyan-400/60 text-cyan-400 glow-cyan' : 'bg-slate-900/65 border-white/5 text-slate-400 hover:bg-slate-900'}`}
            >
              {savedPapers.length > 0 && (
                <span className="absolute top-1 right-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500 text-slate-950">
                  {savedPapers.length}
                </span>
              )}
              <Bookmark className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">LIBRARY</span>
            </button>

            <button
              id="tab-ai-chat"
              onClick={() => setActiveTab('chat')}
              className={`p-2.5 rounded-lg text-center font-mono border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer relative ${activeTab === 'chat' ? 'bg-cyan-950/40 border-cyan-400/60 text-cyan-400 glow-cyan' : 'bg-slate-900/65 border-white/5 text-slate-400 hover:bg-slate-900'}`}
            >
              {isJarvisProcessingMsg && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
              <Terminal className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">JARVIS</span>
            </button>

            <button
              id="tab-synthesis-workspace"
              onClick={() => setActiveTab('workspace')}
              className={`p-2.5 rounded-lg text-center font-mono border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer relative ${activeTab === 'workspace' ? 'bg-cyan-950/40 border-cyan-400/60 text-cyan-400 glow-cyan' : 'bg-slate-900/65 border-white/5 text-slate-400 hover:bg-slate-900'}`}
            >
              {isSynthesizing && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
              )}
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">SYNTHESIS LAB</span>
            </button>
          </div>

          {/* Dynamic diagnostics widget and statistics readout */}
          {showDiagnostics && (
            <DiagnosticsHUD 
              libraryCount={savedPapers.length} 
              arxivStatus={arxivStatus} 
              papersCount={papers.length} 
              teluguLinguisticActive={true}
            />
          )}

          {/* Prompt Suggestion Card */}
          <div className="border border-white/5 bg-slate-900/30 rounded-lg p-3 text-xs font-mono text-slate-400">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5 mb-1">
              <Info className="w-3.5 h-3.5 text-cyan-500" /> SYSTEM HINTS FOR SIR
            </span>
            <p className="text-[11px] leading-relaxed">
              "Sir, you can click on any research paper listed to trigger the AI cognitive analysis module, which generates critical technology summaries, highlights, and beautifully constructed breakdowns in academic Telugu."
            </p>
          </div>

        </section>

        {/* RIGHT COLUMN: Tab Content Display Workspace (8 cols) */}
        <section id="system-display-mainframe-right" className="lg:col-span-8 space-y-6">
          
          {/* =======================================================
               TAB 1: RESEARCH FEED + SEARCH INTERFACE
             ======================================================= */}
          {activeTab === 'feed' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Dynamic Filter / Search Bar Panel */}
              <div className="border border-cyan-500/10 bg-slate-950/60 rounded-xl p-5 glow-cyan relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/3 filter blur-3xl pointer-events-none"></div>
                
                <h3 className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-cyan-400 rounded-sm inline-block"></span>
                  TUNABLE SEARCH CODES (cat:cs.*)
                </h3>

                {/* CS Fields filter chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {REFORM_FIELDS.map((field) => (
                    <button
                      key={field.id}
                      onClick={() => handleCategoryChange(field.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 cursor-pointer border ${selectedField === field.id ? 'bg-cyan-500/15 border-cyan-400/80 text-cyan-300' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-cyan-500/30'}`}
                    >
                      <span className="font-semibold block text-[11px]">{field.label}</span>
                      <span className="text-[9px] text-cyan-500/70 block uppercase font-mono">{field.code}</span>
                    </button>
                  ))}
                </div>

                {/* SubSearch Mode Toggle Tabs */}
                <div className="flex border-b border-white/5 mb-4">
                  <button 
                    onClick={() => setSemanticMode(false)}
                    className={`pb-2 px-4 text-xs font-mono font-bold tracking-wider relative cursor-pointer ${!semanticMode ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {!semanticMode && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></span>
                    )}
                    STANDARD KEYWORD SEARCH
                  </button>
                  
                  <button 
                    onClick={() => {
                      setSemanticMode(true);
                      speakStandardText("Semantic search engine initialized, Sir Narendra. Enter a complex research concept or scenario below.");
                    }}
                    className={`pb-2 px-4 text-xs font-mono font-bold tracking-wider relative flex items-center gap-1.5 cursor-pointer ${semanticMode ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {semanticMode && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 animate-pulse"></span>
                    )}
                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                    JARVIS SEMANTIC SEARCH ANALYSIS
                  </button>
                </div>

                {/* Search execution fields */}
                {!semanticMode ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-cyan-500/60 absolute left-3 top-3" />
                      <input 
                        type="text" 
                        placeholder="Sir, search by keywords (e.g. LLM, security, quantization)..."
                        value={keywordSearch}
                        onChange={(e) => setKeywordSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchPapers(selectedField, keywordSearch)}
                        className="w-full bg-slate-900/90 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-cyan-400 text-cyan-200"
                      />
                    </div>
                    <button 
                      onClick={() => fetchPapers(selectedField, keywordSearch)}
                      className="px-5 py-2.5 bg-cyan-900/30 hover:bg-cyan-500/15 border border-cyan-400/30 hover:border-cyan-400/80 rounded-lg text-xs font-mono font-bold text-cyan-400 tracking-wider transition-all duration-300 cursor-pointer"
                    >
                      EXECUTE FEED_SCAN
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSemanticSearch} className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Sparkles className="w-4 h-4 text-amber-400/70 absolute left-3 top-3 animate-pulse" />
                        <input 
                          type="text" 
                          placeholder="Search semantically (e.g., 'papers proposing secure cryptography for decentralized health records')..."
                          value={semanticQuery}
                          onChange={(e) => setSemanticQuery(e.target.value)}
                          className="w-full bg-slate-900/90 border border-amber-500/30 rounded-lg py-2.5 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-amber-400 text-amber-200"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isSearchingSemantically || papers.length === 0}
                        className="px-5 py-2.5 bg-amber-950/40 hover:bg-amber-500/15 border border-amber-500/30 hover:border-amber-400 rounded-lg text-xs font-mono font-bold text-amber-400 tracking-wider transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        {isSearchingSemantically ? 'RE-RANKING...' : 'RUN SEMANTIC MAP'}
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-amber-500/70">
                      * Uses Gemini to analyze semantic intent against current papers in current view, ranking them with a calculated precision score!
                    </p>
                  </form>
                )}

              </div>

              {/* Research Feed Results Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5 ${persona === 'hasini' ? 'text-rose-400/80' : 'text-cyan-500/80'}`}>
                      <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${persona === 'hasini' ? 'bg-rose-400' : 'bg-cyan-400'}`}></span>
                      ACTIVE SIGS // REPOSITORIES
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline border-l border-white/10 pl-2">
                      {lastSyncTime}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      fetchPapers(selectedField, keywordSearch);
                      if (persona === 'hasini') {
                        speakStandardText("Syncing today's ultimate research papers right now, Narendra! Let's explore together! 😊", 'hasini');
                      } else {
                        speakStandardText("Initiating live Daily arXiv synchronization protocol. Re-indexing the newest publications for your consideration, Sir.", 'jarvis');
                      }
                    }}
                    className={`text-xs font-mono flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300 cursor-pointer ${
                      persona === 'hasini' 
                        ? 'text-rose-400 hover:text-rose-300 bg-rose-950/20 border-rose-500/25 hover:border-rose-400/60' 
                        : 'text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border-cyan-500/10 hover:border-cyan-400/30'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFeed ? 'animate-spin' : ''}`} />
                    {persona === 'hasini' ? 'DAILY ARXIV SYNC' : 'DAILY STREAM RE-SYNC'}
                  </button>
                </div>

                {isLoadingFeed ? (
                  <div className="border border-cyan-500/10 rounded-xl p-16 text-center bg-slate-950/40 font-mono space-y-3">
                    <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin mx-auto"></div>
                    <p className="text-cyan-400 text-xs tracking-widest animate-pulse">GATHERING SIGNAL DATA FROM ARXIV.GOV CLIENT...</p>
                    <p className="text-[10px] text-cyan-600">Decompressing XML entries. Sir Narendra, this takes a brief moment.</p>
                  </div>
                ) : papers.length === 0 ? (
                  <div className="border border-white/5 rounded-xl p-16 text-center bg-slate-900/20 font-mono text-slate-500 space-y-2">
                    <p className="text-xs">SYSTEM RETRIEVED ZERO MATCHING METRICS FROM THE REMOTE REGISTRY.</p>
                    <p className="text-[10px]">Try expanding your keyword selection or modifying selected Field Chips.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {papers.map((paper) => {
                      const isSaved = savedPapers.some(p => p.id === paper.id);
                      return (
                        <div 
                          key={paper.id}
                          className={`border rounded-xl p-5 transition-all duration-300 relative group overflow-hidden ${activeAnalysisPaper?.id === paper.id ? 'bg-cyan-950/20 border-cyan-400/80 glow-cyan' : 'bg-slate-950/50 border-cyan-500/10 hover:border-cyan-500/30'}`}
                        >
                          {/* Real-time relevance score badge for semantic searches */}
                          {paper.relevanceScore !== undefined && paper.relevanceScore > 0 && (
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500/25 to-transparent px-3 py-1 border-b border-l border-amber-500/35 rounded-bl-lg">
                              <span className="text-[10px] font-mono font-bold text-amber-300 animate-pulse">
                                SEMANTIC MATCH: {paper.relevanceScore}%
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            {/* Inner Info & Header */}
                            <div className="flex-1 space-y-2">
                              {/* Metadata chips */}
                              <div className="flex flex-wrap items-center gap-2">
                                {paper.categories.map((cat, i) => (
                                  <span key={i} className="text-[9px] font-mono font-semibold bg-cyan-950 border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded uppercase">
                                    {cat}
                                  </span>
                                ))}
                                <span className="text-[10px] font-mono text-slate-500">
                                  Published: {new Date(paper.published).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Title */}
                              <h4 
                                onClick={() => handleAnalyzePaperBlueprint(paper)}
                                className="text-sm font-semibold tracking-wide text-slate-100 hover:text-cyan-300 transition-colors duration-200 cursor-pointer pr-16"
                              >
                                {paper.title}
                              </h4>

                              {/* Authors list */}
                              <p className="text-[11px] font-mono text-cyan-500/70">
                                Authors: {paper.authors.join(", ")}
                              </p>

                              {/* Technical snippet summary snippet */}
                              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                {paper.summary}
                              </p>

                              {/* Semantic match reason text if returned */}
                              {paper.matchReason && (
                                <div className="mt-2 bg-amber-500/5 border border-amber-500/10 p-2 rounded text-[11px] font-mono text-amber-300/90 leading-relaxed flex items-start gap-1.5">
                                  <span className="font-bold text-amber-400">JARVIS Analyzer:</span>
                                  <span>"{paper.matchReason}"</span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex md:flex-col items-center gap-2 pt-2 md:pt-0 shrink-0">
                              
                              {/* Analyze blueprint drawer trigger */}
                              <button
                                onClick={() => handleAnalyzePaperBlueprint(paper)}
                                className="w-full md:w-auto px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-500/20 border border-cyan-400/20 hover:border-cyan-400 text-xs font-mono text-cyan-400 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                                HOLOGRAPH_BRIEFING
                              </button>

                              {/* Secure Save bookmark button */}
                              <button
                                onClick={() => handleSaveToLibrary(paper)}
                                title={isSaved ? "Remove from Library" : "Bookmark to Personal Library"}
                                className={`w-full md:w-auto p-1.5 rounded-md border text-xs font-mono transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${isSaved ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-cyan-500/30'}`}
                              >
                                {isSaved ? (
                                  <>
                                    <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                                    <span className="md:hidden">SECURED</span>
                                  </>
                                ) : (
                                  <>
                                    <Bookmark className="w-4 h-4" />
                                    <span className="md:hidden">SAVE TO LIBRARY</span>
                                  </>
                                )}
                              </button>

                              {/* Original PDF Link */}
                              {paper.pdfUrl && (
                                <a 
                                  href={paper.pdfUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="w-full md:w-auto px-2 py-1 bg-slate-900/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-md text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 transition-all duration-200"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  PDF_BLUEPRINT
                                </a>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =======================================================
               TAB 2: PERSONAL SECURED LIBRARY
             ======================================================= */}
          {activeTab === 'library' && (
            <div className="space-y-6 animate-fade-in animate-duration-300">
              <div className="border border-cyan-500/15 bg-slate-950/60 rounded-xl p-5 glow-cyan">
                <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-mono font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-2">
                      <BookmarkCheck className="w-4 h-4" />
                      SECURED TECHNOLOGY VAULT
                    </h3>
                    <p className="text-[11px] font-mono text-cyan-600">STARK_INDUSTRIES_ENCRYPTED_ARCHIVE</p>
                  </div>
                  <span className="text-xs font-mono bg-cyan-950/50 px-2 py-1 rounded border border-cyan-500/20 text-cyan-300">
                    {savedPapers.length} CHOSEN BLUEPRINTS
                  </span>
                </div>

                {savedPapers.length === 0 ? (
                  <div className="text-center py-16 font-mono text-slate-500 space-y-4">
                    <BookOpen className="w-12 h-12 mx-auto text-slate-600 opacity-40 animate-pulse" />
                    <p className="text-xs">THE COMPILATION ARCHIVES ARX_Y HAS ZERO DOCUMENT ENTRIES.</p>
                    <p className="text-[10px] text-cyan-600/80">
                      * Proactively bookmark documents in the feed to save them securely in local server memory.
                    </p>
                    <button
                      onClick={() => setActiveTab('feed')}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-950 to-cyan-900 hover:from-cyan-900 text-xs text-cyan-400 font-mono border border-cyan-400/30 hover:border-cyan-400/80 rounded-lg cursor-pointer transition-all duration-200"
                    >
                      BROWSE THE RAW RESEARCH SIGS
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedPapers.map((sp) => (
                      <div key={sp.id} className="border border-white/5 bg-slate-900/20 rounded-lg p-4 space-y-3 relative group">
                        
                        {/* Header details */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {sp.paper.categories.map((c, idx) => (
                                <span key={idx} className="text-[8px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-1 rounded uppercase">
                                  {c}
                                </span>
                              ))}
                              <span className="text-[10px] font-mono text-slate-500">
                                Archived on: {sp.savedAt}
                              </span>
                            </div>
                            
                            <h4 className="text-xs font-bold text-slate-100 hover:text-cyan-300 cursor-pointer pr-10" onClick={() => handleAnalyzePaperBlueprint(sp.paper)}>
                              {sp.paper.title}
                            </h4>
                          </div>

                          <button 
                            onClick={() => handleSaveToLibrary(sp.paper)}
                            title="Delete from archive"
                            className="p-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 hover:border-rose-400 text-rose-400 rounded-md cursor-pointer transition-all duration-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Abstract text */}
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {sp.paper.summary}
                        </p>

                        {/* Personal Technical Analysis Notes Section */}
                        <div id="study-notes-terminal" className="border-t border-cyan-500/5 pt-3">
                          {editNotesId === sp.id ? (
                            <div className="space-y-2">
                              <label className="block text-[10px] font-mono text-cyan-400">MODIFY NOTE MEMO // INTERFACE:</label>
                              <textarea
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg p-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
                                placeholder="Sir, write notes, equations, or research ideas relating to this specific AI publication..."
                              />
                              <div className="flex justify-end gap-2 text-xs font-mono">
                                <button
                                  onClick={() => setEditNotesId(null)}
                                  className="px-3 py-1 bg-slate-900 text-slate-400 rounded hover:text-slate-250 cursor-pointer border border-white/5"
                                >
                                  DISCARD
                                </button>
                                <button
                                  onClick={() => handleSaveNotes(sp.id)}
                                  className="px-3 py-1 bg-cyan-900/30 hover:bg-cyan-500/15 border border-cyan-400/30 hover:border-cyan-400 text-cyan-400 rounded cursor-pointer"
                                >
                                  SAVE NOTE
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <span className="text-[9px] font-mono text-cyan-600 block uppercase">Narendra's Analysis Logging:</span>
                                {sp.notes ? (
                                  <p className="text-xs text-slate-300 font-mono italic bg-cyan-950/10 border-l-2 border-cyan-500/30 pl-2 py-1 mt-1">
                                    "{sp.notes}"
                                  </p>
                                ) : (
                                  <span className="text-[11px] font-mono italic text-slate-500 mt-1 block">
                                    * File terminal contains no written analysis logs. Use Edit Memo to record.
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setEditNotesId(sp.id);
                                  setTempNotes(sp.notes || '');
                                }}
                                className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer self-center"
                              >
                                EDIT MEMO
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Analysis trigger shortcuts */}
                        <div className="flex justify-between items-center bg-cyan-950/10 p-2 rounded-md font-mono border border-cyan-500/5">
                          <span className="text-[10px] text-cyan-500">SYSTEM COGNITION ANALYZER:</span>
                          <button
                            onClick={() => handleAnalyzePaperBlueprint(sp.paper)}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" /> DEPLOY HOLOGRAPH OVERLAY
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =======================================================
               TAB 3: INTERACTIVE HOLOGRAPHIC CHAT WORKSPACE (JARVIS CONTROLS)
             ======================================================= */}
          {activeTab === 'chat' && (
            <div className={`border transition-all duration-500 rounded-xl p-5 flex flex-col h-[520px] relative overflow-hidden animate-fade-in ${persona === 'hasini' ? 'border-rose-500/15 bg-slate-950/65 glow-rose' : 'border-cyan-500/15 bg-slate-950/60 glow-cyan'}`}>
              {/* Decorative retro grid design */}
              <div className="absolute inset-0 scanlines opacity-5 pointer-events-none"></div>

              {/* Chat Title Header info */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4 font-mono">
                <div>
                  {persona === 'hasini' ? (
                    <>
                      <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                        <Heart className="w-4 h-4 text-glow-rose text-rose-455 fill-rose-500/10 animate-pulse" />
                        HASINI COMPANION ACTIVE
                      </h3>
                      <p className="text-[10px] text-rose-500/70">FRIENDLY MULTI-LINGUISTIC DIALOGUE LINK</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-glow-cyan" />
                        JARVIS CLOUD COGNITIVE CORE
                      </h3>
                      <p className="text-[10px] text-cyan-600">DIRECT VOICE-LINK & LINGUISTIC TERMINAL</p>
                    </>
                  )}
                </div>
                <div className={`text-[10px] px-2 py-1 rounded border transition-colors duration-300 ${persona === 'hasini' ? 'bg-rose-950/20 text-rose-400 border-rose-500/20' : 'bg-cyan-950/50 text-cyan-400 border-cyan-500/10'}`}>
                  {persona === 'hasini' ? 'COMPANION LINK // NARENDRA' : 'SECURE SGNL LOCK // NARENDRA'}
                </div>
              </div>

              {/* Chat Messages scroll hub */}
              <div id="jarvis-chat-stream" className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scrollbar">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    
                    {/* Speaker subtitle name tag */}
                    <span className="text-[9px] font-mono text-slate-500 mb-1 px-1 tracking-wider uppercase">
                      {msg.sender === 'user' 
                        ? (persona === 'hasini' ? 'Narendra // Friend' : 'Narendra // User command')
                        : (msg.sender === 'hasini' ? 'HASINI // Friendly Companion' : 'JARVIS // AI Assistant')
                      }
                    </span>

                    {/* Chat speech card */}
                    <div className={`p-4 rounded-xl max-w-[85%] font-mono text-xs border relative transition-all duration-300 ${
                      msg.sender === 'user' 
                        ? (persona === 'hasini' 
                            ? 'bg-rose-950/20 border-rose-500/30 text-rose-100 rounded-tr-none' 
                            : 'bg-cyan-950/20 border-cyan-400/40 text-cyan-100 rounded-tr-none shadow-[0_0_10px_rgba(6,182,212,0.1)]')
                        : (msg.sender === 'hasini'
                            ? 'bg-slate-900/95 border-rose-500/20 text-slate-100 rounded-tl-none glow-rose'
                            : 'bg-slate-900/95 border-emerald-500/20 text-slate-100 rounded-tl-none glow-cyan-emerald')
                    }`}>
                      
                      {/* English Speech textual block */}
                      <p className="leading-relaxed whitespace-pre-line text-slate-200">
                        {msg.text}
                      </p>

                      {/* Bilingual Parallel Telugu translation block if provided */}
                      {msg.textTelugu && (
                        <div className={`mt-3 border-t pt-2 rounded p-2 text-slate-300 ${msg.sender === 'hasini' || (msg.sender !== 'user' && persona === 'hasini') ? 'border-rose-500/10 bg-rose-500/5' : 'border-cyan-500/10 bg-cyan-500/5'}`}>
                          <span className={`text-[9px] uppercase tracking-widest block mb-1 ${msg.sender === 'hasini' || (msg.sender !== 'user' && persona === 'hasini') ? 'text-rose-400' : 'text-emerald-400'}`}>
                            Telugu Explanation (తెలుగు వివరణ):
                          </span>
                          <p className="leading-relaxed font-sans text-[11px]">
                            {msg.textTelugu}
                          </p>
                        </div>
                      )}

                      {/* Visual speaker micro-trigger button */}
                      {msg.sender !== 'user' && (
                        <button
                          onClick={() => speakStandardText(msg.text, msg.sender as 'jarvis' | 'hasini')}
                          title="Vocalize this text again"
                          className={`absolute -bottom-2 -right-2 p-1.5 bg-slate-950 border rounded-full transition-colors duration-200 cursor-pointer ${
                            msg.sender === 'hasini' 
                              ? 'border-rose-500/25 hover:border-rose-455 text-rose-400' 
                              : 'border-cyan-500/20 hover:border-cyan-400 text-cyan-400'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="text-[8px] font-mono text-slate-600 mt-1 px-1">
                      {msg.timestamp}
                    </span>

                  </div>
                ))}

                {/* Processing/Thinking placeholder */}
                {isJarvisProcessingMsg && (
                  <div className="flex flex-col items-start font-mono">
                    <span className="text-[9px] text-slate-500 mb-1">
                      {persona === 'hasini' ? 'HASINI // FORMULATING WORDS' : 'JARVIS // THINKING'}
                    </span>
                    <div className={`p-3 bg-slate-900 border rounded-lg rounded-tl-none text-xs flex items-center gap-2 ${persona === 'hasini' ? 'border-rose-500/25 text-rose-400' : 'border-amber-500/20 text-amber-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${persona === 'hasini' ? 'bg-rose-400' : 'bg-amber-400'}`}></div>
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${persona === 'hasini' ? 'bg-rose-400' : 'bg-amber-400'}`}></div>
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${persona === 'hasini' ? 'bg-rose-400' : 'bg-amber-400'}`}></div>
                      <span>
                        {persona === 'hasini' 
                          ? "WRITING A LOVELY BRIEFING FOR NARENDRA..." 
                          : "RE-ALIGNING CENTRAL ARX_Y KNOWLEDGE MODEL..."
                        }
                      </span>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef}></div>
              </div>

              {/* Chat Input form submission */}
              <form onSubmit={handleSendMessage} className={`mt-4 border-t pt-3 flex gap-2 ${persona === 'hasini' ? 'border-rose-500/15' : 'border-cyan-500/15'}`}>
                <input 
                  type="text" 
                  placeholder={activeAnalysisPaper 
                    ? `Ask ${persona === 'hasini' ? 'Hasini' : 'Jarvis'} about: "${activeAnalysisPaper.title.slice(0, 30)}..."` 
                    : (persona === 'hasini' 
                        ? "Talk with Hasini... (తెలుగు లో అడగండి!) 😊" 
                        : "Command J.A.R.V.I.S. (e.g. explain cs.AI subfield, speak in Telugu)..."
                      )
                  }
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isJarvisProcessingMsg}
                  className={`flex-1 bg-slate-900/90 border rounded-lg px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none transition-all duration-300 disabled:opacity-50 ${
                    persona === 'hasini' 
                      ? 'border-rose-500/20 focus:border-rose-400 focus:glow-rose text-rose-100 placeholder:text-rose-500/40' 
                      : 'border-cyan-500/30 focus:border-cyan-400 focus:glow-cyan placeholder:text-cyan-500/45'
                  }`}
                />
                
                <button 
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      stopVoiceListening();
                    } else {
                      startVoiceListening();
                    }
                  }}
                  className={`px-3 py-2.5 border rounded-lg text-xs font-mono font-bold transition-all duration-300 cursor-pointer flex items-center justify-center ${
                    isListening 
                      ? 'bg-red-950 border-red-500 text-red-400 animate-pulse-ring' 
                      : persona === 'hasini'
                        ? 'bg-rose-950/40 hover:bg-rose-900/30 border-rose-500/20 hover:border-rose-400/50 text-rose-300'
                        : 'bg-cyan-950/40 hover:bg-cyan-900/30 border-cyan-500/20 hover:border-cyan-400/50 text-cyan-400'
                  }`}
                  title={isListening ? "Stop listening" : "Talk via Voice microphone"}
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-red-400' : ''}`} />
                </button>

                <button 
                  type="submit"
                  disabled={isJarvisProcessingMsg || !chatInput.trim()}
                  className={`px-4 py-2.5 border rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-300 cursor-pointer disabled:opacity-30 ${
                    persona === 'hasini'
                      ? 'bg-gradient-to-r from-rose-950 to-rose-900 hover:from-rose-900 hover:to-rose-800 border-rose-500/30 hover:border-rose-455 text-rose-300 glow-rose'
                      : 'bg-gradient-to-r from-cyan-950 to-cyan-900 hover:from-cyan-900 hover:to-cyan-800 border-cyan-500/40 hover:border-cyan-400 text-cyan-400 glow-cyan'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Voice error diagnostics if any */}
              {listeningError && (
                <div className="mt-2 text-[10px] font-mono text-rose-400 flex items-center gap-1 px-2 py-1 rounded bg-rose-950/20 border border-rose-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  {listeningError}
                </div>
              )}

            </div>
          )}

          {/* =======================================================
               TAB 4: AI HOLISTIC SYNTHESIS LAB & BLUEPRINT STUDIO
             ======================================================= */}
          {activeTab === 'workspace' && (
            <div className="space-y-6 animate-fade-in">
              <div className={`p-5 rounded-xl border bg-slate-900/60 backdrop-blur-md relative overflow-hidden ${persona === 'hasini' ? 'border-rose-500/15' : 'border-cyan-500/15'}`}>
                {/* Holographic background flares */}
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full filter blur-[100px] opacity-10 pointer-events-none ${persona === 'hasini' ? 'bg-rose-500' : 'bg-cyan-500'}`}></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-sans font-medium tracking-tight text-white flex items-center gap-2">
                      <Sparkles className={`w-5 h-5 ${persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'}`} />
                      {persona === 'hasini' ? "Hasini's AI Synthesis Lab & Project Creator" : "Holographic AI Research Workspace & Synthesis Lab"}
                    </h2>
                    <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">
                      {persona === 'hasini' ? "Create custom hybrid AI frameworks with Hasini's co-creator intelligence" : "SECURE ARCHIVE SYNTHESIZER / ACTIVE RECEPTACLE PORTAL"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${persona === 'hasini' ? 'bg-rose-400' : 'bg-cyan-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${persona === 'hasini' ? 'bg-rose-500' : 'bg-cyan-500'}`}></span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Workspace Online</span>
                  </div>
                </div>
              </div>

              {/* Grid split: Controls & Configuration (Left) & Live Draft Output (Right) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* CONFIGURATION COLUMN: 5 cols */}
                <div className="xl:col-span-5 space-y-6">
                  
                  {/* Step 1: User Custom Directives */}
                  <div className={`p-4 rounded-xl border bg-slate-900/40 relative ${persona === 'hasini' ? 'border-rose-500/10' : 'border-cyan-500/10'}`}>
                    <span className={`text-[10px] font-sans font-bold tracking-widest uppercase block mb-2.5 ${persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'}`}>
                      [01] Specify Research Goal & Directives
                    </span>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">Narendra's Application Domain/Objective:</label>
                    <textarea
                      value={synthesisObjective}
                      onChange={(e) => setSynthesisObjective(e.target.value)}
                      placeholder={persona === 'hasini'
                        ? "e.g., Let's build a highly efficient multimodal LLM for medical diagnostics, or a lightweight neural translation model for Telugu!"
                        : "e.g., Integrate hybrid cross-attention variables for high-frequency trading or latency reduction on edge hardware."}
                      className="w-full text-xs font-mono bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-2.5 h-24 text-slate-200 outline-none resize-none transition-colors"
                    />
                    <div className="flex gap-2.5 mt-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSynthesisObjective("Analyze dynamic latency reduction in vision-language models on low-resource hardware")}
                        className="text-[9px] font-mono text-slate-500 hover:text-cyan-400 transition-colors uppercase cursor-pointer"
                      >
                        * Latency Goal
                      </button>
                      <button
                        type="button"
                        onClick={() => setSynthesisObjective("Design a secure hybrid LLM protecting mathematical parameters with differential privacy")}
                        className="text-[9px] font-mono text-slate-500 hover:text-cyan-400 transition-colors uppercase cursor-pointer"
                      >
                        * Private Goal
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Library Selection list checkboxes */}
                  <div className={`p-4 rounded-xl border bg-slate-900/40 relative ${persona === 'hasini' ? 'border-rose-500/10' : 'border-cyan-500/10'}`}>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className={`text-[10px] font-sans font-bold tracking-widest uppercase block ${persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'}`}>
                        [02] Select Base Library Papers
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        ({selectedSynthesisIds.length} Selected)
                      </span>
                    </div>

                    {savedPapers.length === 0 ? (
                      <div className="border border-white/5 bg-slate-950/40 rounded-lg p-5 text-center space-y-2">
                        <Bookmark className="w-6 h-6 text-slate-600 mx-auto animate-pulse" />
                        <p className="text-[11px] font-mono text-slate-400">Library collection is currently empty.</p>
                        <p className="text-[10px] font-mono text-slate-500 leading-normal">
                          {persona === 'hasini' 
                            ? "Narendra! Please go to the research feed, expand a cutting-edge paper, and save it to your Library so we can fuse them into dynamic blueprints here! 😊"
                            : "Sir Narendra, please bookmark relevant documents from the primary feed first to register baseline architectures."}
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('feed')}
                          className="px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider rounded border border-cyan-500/20 text-cyan-400 hover:bg-cyan-950/20 uppercase transition-all duration-300 cursor-pointer"
                        >
                          Navigate to Feeds
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        <div className="flex items-center justify-between py-1 border-b border-white/5 mb-1 text-[9px] font-mono">
                          <button
                            type="button"
                            onClick={() => setSelectedSynthesisIds(savedPapers.map(sp => sp.id))}
                            className="text-slate-400 hover:text-cyan-400 uppercase transition-colors cursor-pointer text-left"
                          >
                            * Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSynthesisIds([])}
                            className="text-slate-400 hover:text-cyan-400 uppercase transition-colors cursor-pointer text-left"
                          >
                            * Clear All
                          </button>
                        </div>
                        {savedPapers.map((sp) => {
                          const isChecked = selectedSynthesisIds.includes(sp.id);
                          return (
                            <div 
                              key={sp.id} 
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedSynthesisIds(prev => prev.filter(id => id !== sp.id));
                                } else {
                                  setSelectedSynthesisIds(prev => [...prev, sp.id]);
                                }
                              }}
                              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all duration-300 flex items-start gap-2.5 ${
                                isChecked 
                                  ? persona === 'hasini'
                                    ? 'bg-rose-950/20 border-rose-500/40'
                                    : 'bg-cyan-950/20 border-cyan-500/40'
                                  : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // Handled by parent div
                                className={`mt-0.5 pointer-events-none rounded border-slate-700 ${persona === 'hasini' ? 'text-rose-500 focus:ring-rose-500' : 'text-cyan-500 focus:ring-cyan-500'}`}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-sans font-medium text-slate-200 line-clamp-2 leading-snug">
                                  {sp.paper.title}
                                </h4>
                                <p className="text-[9px] font-mono text-slate-500 truncate mt-1">
                                  {Array.isArray(sp.paper.authors) ? sp.paper.authors.join(", ") : sp.paper.authors}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Step 3: Trigger Reactor */}
                  {savedPapers.length > 0 && (
                    <button
                      type="button"
                      disabled={isSynthesizing || selectedSynthesisIds.length === 0}
                      onClick={handleSynthesizeBlueprint}
                      className={`w-full py-4 border rounded-xl font-mono font-bold text-xs tracking-widest transition-all duration-500 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                        persona === 'hasini'
                          ? 'bg-gradient-to-r from-rose-950 to-pink-950 border-rose-500 hover:border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-pulse-ring'
                          : 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-500 hover:border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 animate-spin-slow" />
                      FUSE ARCHITECTURES & GENERATE SPECS
                    </button>
                  )}

                  {/* Synthesis Error Display */}
                  {synthesisError && (
                    <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-950/20 text-xs font-mono text-rose-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 animate-pulse shrink-0"></span>
                      <div>
                        <strong className="block uppercase text-[10px] text-rose-400 mb-0.5">Synthesis Mainframe Alert</strong>
                        {synthesisError}
                      </div>
                    </div>
                  )}

                </div>

                {/* OUTPUT COLUMN: 7 cols */}
                <div className="xl:col-span-7 space-y-6">
                  
                  {/* Synthesis loading placeholder */}
                  {isSynthesizing && (
                    <div className="border border-white/5 bg-slate-900/20 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[480px] space-y-6 relative overflow-hidden animate-fade-in">
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <div className={`w-80 h-80 rounded-full border border-dashed animate-spin-slow ${persona === 'hasini' ? 'border-rose-500' : 'border-cyan-500'}`}></div>
                      </div>
                      
                      {/* Interactive Hologram Core Loading Simulator */}
                      <div className="relative">
                        <div className={`w-24 h-24 rounded-full border-2 border-slate-800 flex items-center justify-center animate-spin ${persona === 'hasini' ? 'border-t-rose-400 border-b-rose-400' : 'border-t-cyan-400 border-b-cyan-400'}`}>
                          <div className={`w-16 h-16 rounded-full border border-slate-700 flex items-center justify-center animate-spin-slow`}>
                            <Cpu className={`w-6 h-6 animate-pulse ${persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'}`} />
                          </div>
                        </div>
                        <div className={`absolute -inset-2 rounded-full filter blur-md opacity-30 animate-pulse bg-cyan-500`}></div>
                      </div>

                      <div className="space-y-2 max-w-sm relative z-10 w-full">
                        <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-white">
                          Synthesizing Research Graph
                        </h3>
                        
                        <div className="h-1.5 w-48 bg-slate-950 border border-slate-800 rounded-full mx-auto overflow-hidden relative">
                          <div className={`h-full absolute left-0 top-0 w-2/3 animate-pulse rounded-full ${persona === 'hasini' ? 'bg-rose-500' : 'bg-cyan-500'}`}></div>
                        </div>

                        <div className="space-y-1 pt-2">
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider animate-pulse">
                            {persona === 'hasini' ? "⚡ Hasini is blending mathematical models for Narendra..." : "⚡ Calibrating gradient vectors and attention maps..."}
                          </p>
                          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                            {persona === 'hasini' ? "Structuring sweet Telugu translation & companion guidelines..." : "Configuring loss functions & aligning Stark matrices..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty state (No synthesis output and not loading) */}
                  {!isSynthesizing && !synthesizedBlueprint && (
                    <div className="border border-white/5 bg-slate-900/20 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[480px] space-y-4 animate-fade-in">
                      <div className={`p-4 rounded-full bg-slate-950 border border-dashed ${persona === 'hasini' ? 'border-rose-500/20 text-rose-500/40' : 'border-cyan-500/20 text-cyan-500/40'}`}>
                        <Terminal className="w-10 h-10 animate-pulse" />
                      </div>
                      <div className="space-y-2 max-w-md">
                        <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-300">
                          Synthesis Mainframe Idle
                        </h3>
                        <p className="text-xs font-mono text-slate-500 leading-relaxed uppercase">
                          No hybrid blueprint synthesized. Adjust your custom objectives, click paper checkboxes in your personal collection, and push the "Fuse architectures" engine trigger to calibrate complex hybrid proposals!
                        </p>
                      </div>
                      {savedPapers.length > 0 && selectedSynthesisIds.length === 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedSynthesisIds(savedPapers.slice(0, 3).map(sp => sp.id))}
                          className={`px-4 py-2 border rounded-lg text-xs font-mono font-bold transition-all duration-350 cursor-pointer ${
                            persona === 'hasini'
                              ? 'bg-rose-950/30 border-rose-500/20 text-rose-300 hover:border-rose-400/50'
                              : 'bg-cyan-950/30 border-cyan-500/20 text-cyan-300 hover:border-cyan-400/50'
                          }`}
                        >
                          Quick Selection (First 3 Papers)
                        </button>
                      )}
                    </div>
                  )}

                  {/* Detailed Synthesized Blueprint Output Display */}
                  {!isSynthesizing && synthesizedBlueprint && (
                    <div className={`border rounded-xl bg-slate-900/40 p-5 space-y-6 animate-fade-in relative overflow-hidden max-h-[680px] overflow-y-auto ${
                      persona === 'hasini' ? 'border-rose-500/25 shadow-[0_0_20px_rgba(244,63,94,0.05)]' : 'border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.05)]'
                    }`}>
                      
                      {/* Dynamic corner diagnostics for classified look */}
                      <div className="absolute top-2 right-2 text-[8px] font-mono text-slate-500 tracking-wider flex items-center gap-1 uppercase">
                        <span className={`block w-1.5 h-1.5 rounded-full ${persona === 'hasini' ? 'bg-pink-500' : 'bg-cyan-400'} animate-pulse`}></span>
                        CLASSIFIED SYSTEM INTEL SPECS
                      </div>

                      <div className="space-y-2 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest">
                          <Sparkles className={`w-3.5 h-3.5 ${persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'}`} />
                          <span>Dynamic Convergent Architecture Blueprint</span>
                        </div>
                        <h3 className={`text-lg font-sans font-medium tracking-tight text-white leading-tight ${persona === 'hasini' ? 'hover:text-rose-300' : 'hover:text-cyan-300'} transition-colors`}>
                          {synthesizedBlueprint.hybridTitle}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          ENGINEERED BY: SIR NARENDRA PUNNAM & {persona === 'hasini' ? 'HASINI v1.2' : 'JARVIS v3.5'}
                        </p>
                      </div>

                      {/* Export Actions Drawer */}
                      <div className="flex gap-2.5 flex-wrap items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-white/5">
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">High-Fidelity Document Ready</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => speakStandardText(synthesizedBlueprint.jarvisAudioSpeech, persona)}
                            className="px-2.5 py-1.5 rounded text-[9px] font-mono font-bold bg-slate-900 border border-white/5 text-slate-300 hover:text-white flex items-center gap-1 uppercase transition-all cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Speak Briefing
                          </button>
                          <button
                            type="button"
                            onClick={exportHybridBlueprintAsMarkdown}
                            className={`px-3 py-1.5 rounded text-[9px] font-mono font-bold border flex items-center gap-1 uppercase transition-all duration-300 cursor-pointer ${
                              persona === 'hasini'
                                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:bg-rose-950 hover:border-rose-400'
                                : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950 hover:border-cyan-400'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" /> Grab Markdown blueprint
                          </button>
                        </div>
                      </div>

                      {/* 1. Breakthrough Unified Architectural Thesis */}
                      <div className="space-y-1.5">
                        <h4 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'}`}>
                          [01] Convergent Breakthrough Thesis
                        </h4>
                        <div className="text-xs font-mono text-slate-300 leading-relaxed space-y-3 whitespace-pre-line p-3 rounded-xl bg-slate-950/30 border border-white/5">
                          {synthesizedBlueprint.breakthroughOverview}
                        </div>
                      </div>

                      {/* 2. Mathematical & Algorithmic Convergence */}
                      <div className="space-y-1.5">
                        <h4 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'}`}>
                          [02] Mathematical & Algorithmic Integration
                        </h4>
                        <div className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-line p-3 rounded-xl bg-slate-950/40 border border-white/5 border-dashed">
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1 mb-2">Mathematical Integration Blueprints</p>
                          {synthesizedBlueprint.mathematicalConvergence}
                        </div>
                      </div>

                      {/* 3. Phased Roadmap Plan */}
                      <div className="space-y-1.5">
                        <h4 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'}`}>
                          [03] Implementation Phases & Engineering Specs
                        </h4>
                        <div className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-line p-3 rounded-xl bg-slate-950/30 border border-white/5">
                          {synthesizedBlueprint.stepByStepImplementation}
                        </div>
                      </div>

                      {/* 4. Telugu Exposition Briefing */}
                      <div className={`space-y-2 p-3.5 rounded-xl border relative overflow-hidden ${
                        persona === 'hasini' ? 'bg-rose-950/10 border-rose-500/20' : 'bg-cyan-950/10 border-cyan-500/20'
                      }`}>
                        <div className="absolute top-2 right-2 text-[8px] font-mono uppercase text-slate-400 flex items-center gap-1 font-semibold">
                          <Globe className="w-3.5 h-3.5 animate-pulse" /> LINGUISTIC MAIN OFFICE MODULE
                        </div>
                        <h4 className={`text-xs font-mono font-bold uppercase tracking-wide pb-1.5 border-b ${
                          persona === 'hasini' ? 'text-rose-300 border-rose-500/10' : 'text-cyan-300 border-cyan-500/10'
                        }`}>
                          {persona === 'hasini' ? "🌸 సాన్నిహిత్య తెలుగు విశ్లేషణ నివేదిక (Sweet companion breakdown)" : "🧠 'అవెంజర్స్' పారిశ్రామిక వైజ్ఞానిక విశ్లేషణ (Academic Telugu breakdown)"}
                        </h4>
                        <div className="text-xs font-normal text-slate-200 leading-relaxed whitespace-pre-line space-y-3 antialiased font-sans">
                          {synthesizedBlueprint.teluguExposition}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

        </section>

      </main>

      {/* =======================================================
           MODAL SCREEN: DAILY BRIEFING OVERARCHING TRENDS COMPILATION
         ======================================================= */}
      {showBriefingModal && (
        <div className="fixed inset-0 min-h-screen bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="border border-cyan-400 bg-slate-950 w-full max-w-3xl rounded-xl p-6 glow-cyan-strong relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-500"></div>
            
            {/* Modal Exit Button */}
            <button 
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setShowBriefingModal(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/5 hover:border-red-500 text-slate-400 hover:text-red-400 cursor-pointer transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title details */}
            <div className="font-mono space-y-1 mb-5">
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold block">* DAILY COMPILED INTELLIGENCE UPDATE *</span>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                ARXIV COMPUTER SCIENCE LATEST EVOLUTION MEMO
              </h3>
              <p className="text-[11px] text-cyan-600">COMPILED BY J.A.R.V.I.S. PROPORTIONAL METRIC PIPELINE</p>
            </div>

            {isBriefingLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 font-mono space-y-4">
                <div className="w-10 h-10 border-t-2 border-r-2 border-cyan-400 rounded-full animate-spin"></div>
                <p className="text-cyan-400 text-xs tracking-widest animate-pulse uppercase">Querying deep intelligence indices for todays trends...</p>
                <p className="text-[10px] text-cyan-600">Narendra, this takes a few seconds to run comprehensive cognitive mapping.</p>
              </div>
            ) : dailyBriefing ? (
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar text-xs font-mono">
                
                {/* 1. English Grand Summary */}
                <div className="bg-cyan-950/20 border border-cyan-500/20 p-4 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/3 filter blur-3xl pointer-events-none"></div>
                  <h4 className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-2 flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-cyan-500" /> TACTICAL GRAND OVERVIEW
                  </h4>
                  <p className="text-slate-200 leading-relaxed text-xs">
                    {dailyBriefing.summary}
                  </p>
                </div>

                {/* 2. Bilingual premium Telugu Section */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-lg">
                  <h4 className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" /> నేటి AI పరిశోధనా సారాంశం (TELUGU SUMMARY)
                  </h4>
                  <p className="text-slate-200 leading-relaxed text-[11px] font-sans leading-Telugu">
                    {dailyBriefing.teluguSummary}
                  </p>
                </div>

                {/* 3. Thematic Advancement list */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1 px-1">
                    <Cpu className="w-3.5 h-3.5 text-cyan-500" /> IDENTIFIED EVOLUTIONARY REVOLUTIONS
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {dailyBriefing.trends.map((trend, i) => (
                      <div key={i} className="border border-white/5 bg-slate-900/30 rounded-lg p-3.5 space-y-1.5 hover:border-cyan-500/20 transition-all duration-200">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/10">0{i+1}</span>
                          <span className="text-[11px] font-bold text-slate-100">{trend.theme}</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{trend.description}</p>
                        <p className="text-[10px] text-cyan-500/80 italic leading-normal border-l border-cyan-500/40 pl-2 mt-1">Relevance: {trend.relevance}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vocalizer control inside modal */}
                <div className="border-t border-cyan-500/15 pt-3 flex items-center justify-between">
                  <span className="text-[9px] text-cyan-600/80 uppercase">Auditory streaming controls active</span>
                  {dailyBriefing && (
                    <button 
                      onClick={() => speakStandardText(dailyBriefing.summary)}
                      className="px-3 py-1 bg-cyan-900/30 hover:bg-cyan-500/20 border border-cyan-400/30 rounded text-[10px] font-bold text-cyan-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" /> REPLAY ORAL BRIEFING
                    </button>
                  )}
                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* =======================================================
           HOLOGRAPHIC BLUEPRINT INTEL-DRAWER (SLIDE-OVER PANEL)
         ======================================================= */}
      {activeAnalysisPaper && (
        <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-slate-950/98 border-l shadow-2xl z-40 transform transition-transform duration-500 ease-in-out px-5 py-6 flex flex-col justify-between ${
          persona === 'hasini' ? 'border-rose-500/30' : 'border-cyan-500/30'
        } ${activeAnalysisPaper ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Background hologram visuals */}
          <div className="absolute inset-0 scanlines opacity-5 pointer-events-none"></div>
          <div className="absolute top-[30%] right-[-100px] w-80 h-80 bg-cyan-500/3 rounded-full filter blur-3xl pointer-events-none"></div>

          {/* Drawer scroll content segment */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-1.5 scrollbar">
            
            {/* Header branding & back trigger */}
            <div className="flex justify-between items-start border-b border-cyan-500/10 pb-4 mb-3 font-mono">
              <div className="space-y-0.5">
                <span className={`text-[9.5px] uppercase tracking-widest font-bold block ${
                  persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'
                }`}>
                  {persona === 'hasini' ? "🌸 Companion Reader System" : "💎 Core Research Hologram"}
                </span>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className={`w-4.5 h-4.5 animate-pulse ${persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'}`} />
                  COGNITIVE INTEL VAULT
                </h4>
              </div>
              <button 
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setActiveAnalysisPaper(null);
                }}
                className={`p-1 px-2.5 text-[10px] font-mono border rounded transition-colors duration-200 cursor-pointer flex items-center gap-1 ${
                  persona === 'hasini' 
                    ? 'border-rose-500/20 hover:border-rose-400 hover:text-rose-300' 
                    : 'border-white/5 hover:border-cyan-400 hover:text-cyan-300'
                }`}
              >
                <X className="w-3 h-3" /> CLOSE VAULT
              </button>
            </div>

            {/* Section A: Original Paper Specifications */}
            <div className="space-y-2 font-mono">
              <div className="flex flex-wrap gap-1.5">
                {activeAnalysisPaper.categories.map((c, i) => (
                  <span key={i} className={`text-[8px] border px-1.5 py-0.5 rounded font-mono uppercase ${
                    persona === 'hasini' 
                      ? 'bg-rose-950/20 text-rose-300 border-rose-500/20' 
                      : 'bg-cyan-950/20 text-cyan-400 border-cyan-500/20'
                  }`}>
                    {c}
                  </span>
                ))}
                {activeAnalysisPaper.relevanceScore !== undefined && activeAnalysisPaper.relevanceScore > 0 && (
                  <span className="text-[8px] bg-amber-950/40 text-amber-400 border border-amber-500/35 px-1.5 py-0.5 rounded font-bold">
                    SEMANTIC RANK: {activeAnalysisPaper.relevanceScore}%
                  </span>
                )}
              </div>
              
              <h3 className={`text-sm font-sans font-semibold leading-snug text-slate-100 ${
                persona === 'hasini' ? 'text-glow-rose hover:text-rose-300' : 'text-glow-cyan hover:text-cyan-300'
              } transition-colors`}>
                {activeAnalysisPaper.title}
              </h3>
              
              <div className="flex flex-col gap-0.5 text-[10px]">
                <p className="text-slate-400">
                  <strong className="text-slate-500">AUTHORS:</strong> {activeAnalysisPaper.authors.join(", ")}
                </p>
                <p className="text-slate-500 text-[9px]">
                  arXiv ID: {activeAnalysisPaper.id} • {activeAnalysisPaper.published ? new Date(activeAnalysisPaper.published).toLocaleDateString() : 'Active publication'}
                </p>
              </div>

              {/* Dynamic Readability Typography Controls */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-white/5 mt-1">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-500" /> Readability:
                </span>
                <div className="flex gap-1.5 font-mono text-[9px]">
                  <button
                    onClick={() => setReaderFontMode('sans')}
                    className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                      readerFontMode === 'sans' 
                        ? persona === 'hasini' ? 'bg-rose-950/40 border-rose-400 text-rose-300' : 'bg-cyan-950/40 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-white/5 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Sans-UI
                  </button>
                  <button
                    onClick={() => setReaderFontMode('serif')}
                    className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                      readerFontMode === 'serif' 
                        ? persona === 'hasini' ? 'bg-rose-950/40 border-rose-400 text-rose-300 font-serif' : 'bg-cyan-950/40 border-cyan-400 text-cyan-300 font-serif font-bold'
                        : 'bg-slate-950 border-white/5 text-slate-500 hover:text-slate-300 font-serif'
                    }`}
                  >
                    Classic Serif
                  </button>
                  <button
                    onClick={() => setReaderFontMode('mono')}
                    className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                      readerFontMode === 'mono' 
                        ? persona === 'hasini' ? 'bg-rose-950/40 border-rose-400 text-rose-300 font-mono' : 'bg-cyan-950/40 border-cyan-400 text-cyan-300 font-mono font-bold'
                        : 'bg-slate-950 border-white/5 text-slate-500 hover:text-slate-300 font-mono'
                    }`}
                  >
                    Stark Mono
                  </button>
                </div>
              </div>
            </div>

            {/* ADVANCED MULTI-TAB CONTROLLER BAR */}
            <div className="flex border-b border-white/5 pb-1 gap-1 select-none overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setReaderTab('brief')}
                className={`py-1 px-2.5 rounded text-[10.5px] font-mono tracking-wider cursor-pointer whitespace-nowrap transition-all duration-300 uppercase flex items-center gap-1 shrink-0 ${
                  readerTab === 'brief' 
                    ? persona === 'hasini' ? 'text-rose-400 border-b border-rose-400 font-bold' : 'text-cyan-400 border-b border-cyan-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Digest
              </button>
              <button
                type="button"
                onClick={() => setReaderTab('anatomy')}
                className={`py-1 px-2.5 rounded text-[10.5px] font-mono tracking-wider cursor-pointer whitespace-nowrap transition-all duration-300 uppercase flex items-center gap-1 shrink-0 ${
                  readerTab === 'anatomy' 
                    ? persona === 'hasini' ? 'text-rose-400 border-b border-rose-400 font-bold' : 'text-cyan-400 border-b border-cyan-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Anatomy
              </button>
              <button
                type="button"
                onClick={() => setReaderTab('telugu')}
                className={`py-1 px-2.5 rounded text-[10.5px] font-mono tracking-wider cursor-pointer whitespace-nowrap transition-all duration-300 uppercase flex items-center gap-1 shrink-0 ${
                  readerTab === 'telugu' 
                    ? persona === 'hasini' ? 'text-rose-400 border-b border-rose-400 font-bold' : 'text-cyan-400 border-b border-cyan-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> తెలుగు వివరణ
              </button>
              <button
                type="button"
                onClick={() => setReaderTab('probe')}
                className={`py-1 px-2.5 rounded text-[10.5px] font-mono tracking-wider cursor-pointer whitespace-nowrap transition-all duration-300 uppercase flex items-center gap-1 shrink-0 ${
                  readerTab === 'probe' 
                    ? persona === 'hasini' ? 'text-rose-400 border-b border-rose-400 font-bold' : 'text-cyan-400 border-b border-cyan-400 font-bold text-glow-cyan'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" /> AI Probe
              </button>
              <button
                type="button"
                onClick={() => setReaderTab('raw')}
                className={`py-1 px-2.5 rounded text-[10.5px] font-mono tracking-wider cursor-pointer whitespace-nowrap transition-all duration-300 uppercase flex items-center gap-1 shrink-0 ${
                  readerTab === 'raw' 
                    ? persona === 'hasini' ? 'text-rose-400 border-b border-rose-400 font-bold' : 'text-cyan-400 border-b border-cyan-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Abstract
              </button>
            </div>

            {/* Cognitive Generator Loading block / Content Wrapper */}
            {isAnalyzingPaper ? (
              <div className="border border-white/5 rounded-xl p-12 text-center font-mono space-y-4 bg-slate-900/25 animate-fade-in">
                <div className={`w-10 h-10 rounded-full border-2 border-slate-800 border-t-2 animate-spin mx-auto ${
                  persona === 'hasini' ? 'border-t-rose-400 border-r-rose-400' : 'border-t-cyan-400 border-r-cyan-400'
                }`}></div>
                <p className={`text-[11px] tracking-widest animate-pulse font-bold uppercase ${
                  persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'
                }`}>
                  {persona === 'hasini' ? "HASINI IS TRANSCRIBING COGNITION MODEL..." : "J.A.R.V.I.S. SYNCHRONIZING MATHEMATICAL FORMULAS..."}
                </p>
                <p className="text-[10px] text-slate-500 max-w-xs mx-auto uppercase">
                  Structuring beautiful bilingual Telugu reviews, system breakthroughs, and interactive components.
                </p>
              </div>
            ) : blueprintSummary ? (
              <div className="space-y-4 animate-fade-in">
                
                {/* 1. DIGEST TAB CONTENT */}
                {readerTab === 'brief' && (
                  <div className="space-y-4 font-mono">
                    <div className={`p-4 rounded-xl border relative shadow-inner overflow-hidden ${
                      persona === 'hasini' ? 'bg-rose-950/10 border-rose-500/25' : 'bg-cyan-950/15 border-cyan-500/25'
                    }`}>
                      {/* Sub-corner marker */}
                      <div className="absolute top-1 right-2 text-[8px] uppercase tracking-wider text-slate-500 font-semibold select-none">
                        EXECUTIVE SPEC
                      </div>
                      
                      <h4 className={`text-[10px] uppercase tracking-widest font-bold mb-2.5 flex items-center gap-1.5 ${
                        persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5 shrink-0" /> Unified Scientific Summary
                      </h4>
                      
                      <p className={`text-slate-300 text-xs leading-relaxed ${
                        readerFontMode === 'serif' ? 'font-serif' : readerFontMode === 'mono' ? 'font-mono' : 'font-sans'
                      }`}>
                        {blueprintSummary.summary}
                      </p>
                    </div>

                    {/* Active Oral Replay Trigger Bar */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-1.5 w-1.5 relative">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${persona === 'hasini' ? 'bg-rose-400' : 'bg-cyan-450'}`}></span>
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${persona === 'hasini' ? 'bg-rose-500' : 'bg-cyan-500'}`}></span>
                        </span>
                        <span className="text-[9px] text-slate-450 uppercase tracking-wider">Acoustic Audio Channel Active</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => speakStandardText(blueprintSummary.jarvisSpeech, persona)}
                        className={`px-3 py-1.5 text-[9.5px] font-bold border rounded-md uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 font-mono ${
                          persona === 'hasini'
                            ? 'bg-rose-950/20 hover:bg-rose-500/15 border-rose-500/30 text-rose-300'
                            : 'bg-cyan-950/20 hover:bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Play Companion Oral Digest
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. ANATOMY TAB CONTENT */}
                {readerTab === 'anatomy' && (
                  <div className="space-y-4 font-mono">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h4 className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 ${
                          persona === 'hasini' ? 'text-rose-400' : 'text-cyan-400'
                        }`}>
                          <Terminal className="w-3.5 h-3.5" /> Core Innovation Anatomy
                        </h4>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest">{blueprintSummary.highlights.length} Technical Coordinates</span>
                      </div>
                      <div className="space-y-2.5">
                        {blueprintSummary.highlights.map((hlt, idx) => (
                          <div key={idx} className="border border-white/5 bg-slate-900/20 rounded-xl p-3.5 flex items-start gap-3 hover:border-white/10 transition-colors">
                            <span className={`text-[10px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${
                              persona === 'hasini'
                                ? 'bg-rose-950/40 border-rose-500/20 text-rose-300'
                                : 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400'
                            }`}>
                              CRITICAL-{idx+1}
                            </span>
                            <p className={`text-slate-300 text-[11.5px] leading-relaxed ${
                              readerFontMode === 'serif' ? 'font-serif' : readerFontMode === 'mono' ? 'font-mono' : 'font-sans'
                            }`}>{hlt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TELUGU EXPLANATION TAB CONTENT */}
                {readerTab === 'telugu' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border relative shadow-md ${
                      persona === 'hasini' ? 'bg-rose-950/10 border-rose-500/25' : 'bg-cyan-950/15 border-cyan-500/25'
                    }`}>
                      <div className="absolute top-1 right-2 text-[8px] uppercase tracking-widest text-slate-400 font-bold font-mono">
                        TRANSLAT-NODE
                      </div>
                      
                      <h4 className={`text-[11px] uppercase tracking-wider font-bold mb-3.5 font-sans flex items-center gap-1.5 ${
                        persona === 'hasini' ? 'text-rose-300' : 'text-cyan-300'
                      }`}>
                        <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 
                        {persona === 'hasini' ? "🌸 సాన్నిహిత్య తెలుగు విశ్లేషణ (Sweet companion translation)" : "⚙️ అకడమిక్ తెలుగు సమీక్ష (Academic Telugu review)"}
                      </h4>
                      
                      <p className={`text-slate-200 text-xs leading-relaxed whitespace-pre-line antialiased ${
                        readerFontMode === 'serif' ? 'font-serif' : 'font-sans'
                      }`}>
                        {blueprintSummary.teluguExplanation}
                      </p>
                    </div>

                    {/* Quick copy block */}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(blueprintSummary.teluguExplanation);
                        speakStandardText(persona === 'hasini' ? "Sweet Telugu transcription saved to your clipboard!" : "Telugu text secured in temporary storage.");
                      }}
                      className="w-full py-2 bg-slate-900/50 hover:bg-slate-900 border border-white/5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      * Copy Telugu Exposition *
                    </button>
                  </div>
                )}

                {/* 4. COGNITIVE AI PROBE TAB (INTERACTIVE CONTEXTUAL CHAT) */}
                {readerTab === 'probe' && (
                  <div className="space-y-4 font-mono">
                    
                    {/* Explanation */}
                    <div className="border border-white/5 rounded-lg p-3 bg-slate-905/30 text-[10px] text-slate-400 uppercase leading-normal">
                      🚀 <strong className={persona === 'hasini' ? 'text-rose-300' : 'text-cyan-300'}>Cognitive Quick Query Probe:</strong> Ask any specific question regarding this paper's methodologies, datasets, parameter constraints, or mathematics. {persona === 'hasini' ? 'Hasini' : 'JARVIS'} will isolate this document vector and answer instantly!
                    </div>

                    {/* Historical Probe QA list */}
                    {readerProbeHistory.length > 0 && (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 border-t border-b border-white/5 py-3">
                        {readerProbeHistory.map((item, idx) => (
                          <div key={idx} className="space-y-2 text-xs">
                            {/* User Query */}
                            <div className="text-right">
                              <span className="inline-block px-3 py-1.5 rounded-lg rounded-tr-none bg-slate-800 text-slate-200 text-[11px] font-mono text-left max-w-[85%]">
                                {item.query}
                              </span>
                            </div>
                            
                            {/* Companion Response */}
                            <div className="text-left">
                              <div className={`inline-block px-3 py-2 rounded-xl rounded-tl-none border max-w-[90%] space-y-2 ${
                                persona === 'hasini' ? 'bg-rose-950/10 border-rose-500/10' : 'bg-cyan-950/10 border-cyan-500/10'
                              }`}>
                                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest border-b border-white/5 pb-0.5 mb-1.5 flex items-center justify-between">
                                  <span>{persona === 'hasini' ? '🌸 Hasini v1.2' : '🤖 JARVIS CORE'}</span>
                                  <button
                                    onClick={() => speakStandardText(item.answer)}
                                    className="text-slate-400 hover:text-white uppercase text-[8px] cursor-pointer"
                                  >
                                    [Speak Answer]
                                  </button>
                                </div>
                                <p className={`text-slate-350 text-[11px] leading-relaxed block ${
                                  readerFontMode === 'serif' ? 'font-serif' : readerFontMode === 'mono' ? 'font-mono' : 'font-sans'
                                }`}>
                                  {item.answer}
                                </p>
                                {item.answerTelugu && (
                                  <p className="text-slate-400 text-[11px] leading-relaxed border-t border-white/5 pt-1.5 font-sans leading-Telugu">
                                    {item.answerTelugu}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Form Input */}
                    <form onSubmit={handleReaderProbeSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={readerProbeText}
                        onChange={(e) => setReaderProbeText(e.target.value)}
                        disabled={isReaderProbing}
                        placeholder={persona === 'hasini'
                          ? "Narendra, what shall I check in this paper?"
                          : "Command search coordinates, Sir..."}
                        className={`flex-1 bg-slate-950 border text-xs font-mono p-2.5 rounded-lg outline-none text-slate-200 transition-all ${
                          persona === 'hasini' 
                            ? 'border-rose-500/20 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20' 
                            : 'border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={isReaderProbing || !readerProbeText.trim()}
                        className={`px-3.5 rounded-lg text-xs font-bold tracking-wider font-mono transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                          persona === 'hasini'
                            ? 'bg-rose-950 border border-rose-500/40 text-rose-300 hover:bg-rose-900'
                            : 'bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900'
                        }`}
                      >
                        {isReaderProbing ? "Probing..." : "Send"}
                      </button>
                    </form>

                  </div>
                )}

                {/* 5. ABSTRACT ORIGINAL TAB CONTENT */}
                {readerTab === 'raw' && (
                  <div className="space-y-4 font-mono">
                    <div className="border border-white/5 bg-slate-900/10 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5 text-[9px] uppercase text-slate-500">
                        <span>Original Publication Abstract Transcript:</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeAnalysisPaper.summary);
                            speakStandardText("Raw abstract copied!");
                          }}
                          className="hover:text-cyan-400 transition-colors uppercase cursor-pointer"
                        >
                          [Copy Abstract]
                        </button>
                      </div>
                      <p className={`text-[11.5px] text-slate-405 leading-relaxed antialiased ${
                        readerFontMode === 'serif' ? 'font-serif' : readerFontMode === 'mono' ? 'font-mono' : 'font-sans'
                      }`}>
                        {activeAnalysisPaper.summary}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="border border-white/5 rounded-xl p-10 text-center font-mono opacity-50 text-[11px]">
                Unable to synthesize blueprints. Verify network link.
              </div>
            )}

            {/* Abstract overview footer snippet - elegant tiny disclaimer */}
            <div className="flex items-center justify-between py-2 border-t border-white/5 text-[8.5px] font-mono text-slate-600 uppercase">
              <span>Secure telemetry classification level: Alpha</span>
              <span>Source: ArXiv CS Feed Repository</span>
            </div>

          </div>

          {/* Drawer persistent actions bottom */}
          <div className="border-t border-cyan-500/15 pt-4 mt-4 font-mono flex flex-col sm:flex-row gap-2 shrink-0">
            {blueprintSummary && (
              <button
                onClick={() => handleDownloadToDesktop(activeAnalysisPaper, blueprintSummary)}
                className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                  persona === 'hasini'
                    ? 'bg-gradient-to-r from-rose-950/80 to-rose-900/80 hover:from-rose-900 hover:to-rose-800 border border-rose-500/40 hover:border-rose-455 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                    : 'bg-gradient-to-r from-cyan-950/80 to-cyan-900/80 hover:from-cyan-900 hover:to-cyan-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                GIVE REPORT TO DESKTOP
              </button>
            )}

            {activeAnalysisPaper.pdfUrl && (
              <a 
                href={activeAnalysisPaper.pdfUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  persona === 'hasini'
                    ? 'bg-rose-950/20 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-400 text-rose-400'
                    : 'bg-cyan-900/30 hover:bg-cyan-500/20 border border-cyan-400/30 hover:border-cyan-400 text-cmd-cyan text-cyan-400'
                }`}
              >
                OPEN PDF BLUEPRINT
              </a>
            )}
            
            <button
              onClick={() => handleSaveToLibrary(activeAnalysisPaper)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-500 rounded-lg text-xs font-bold shrink-0 text-slate-300 transition-colors duration-200 cursor-pointer"
            >
              {savedPapers.some(p => p.id === activeAnalysisPaper.id) ? "SECURED" : "ARCHIVE"}
            </button>
          </div>

        </div>
      )}

      {/* Futuristic telemetry site margin widgets (Tech LARPIN prevention but authentic Iron Man styling corner sights) */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-[10px] font-mono text-slate-600 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>
            STARK INDUSTRIES SYSTEM DEPLOYMENT // PROTOTYPE MODULE v3.5
          </span>
          <span className="text-cyan-500/80">
            Telugu Cognitive Translation matrix actively aligned for Sir Narendra.
          </span>
        </div>
      </footer>

    </div>
  );
}
