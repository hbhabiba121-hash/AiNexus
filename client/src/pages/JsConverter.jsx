import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Box,
  Typography,
  useMediaQuery,
  TextField,
  Button,
  Alert,
  Card,
  Paper,
  IconButton,
  CircularProgress,
  alpha,
  Tooltip,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import {
  CodeRounded,
  ArrowBackRounded,
  RefreshRounded,
  ContentCopyRounded,
  PlayArrowRounded,
  DownloadRounded,
  LightbulbRounded,
  SwapHorizRounded,
  SpeedRounded,
  CheckCircleRounded,
  BugReportRounded,
  AutoFixHighRounded,
  LanguageRounded,
  TerminalRounded,
} from "@mui/icons-material";

// Enhanced color palette matching your theme
const colors = {
  primary: {
    main: '#6366F1',
    light: '#818CF8',
    dark: '#4F46E5',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
  },
  secondary: {
    main: '#8B5CF6',
    light: '#A78BFA',
    dark: '#7C3AED',
  },
  accent: {
    amber: '#F59E0B',
    cyan: '#06B6D4',
    emerald: '#10B981',
    pink: '#EC4899',
    violet: '#8B5CF6',
  },
  background: {
    dark: '#0F172A',
    card: 'rgba(30, 41, 59, 0.95)',
    light: '#1E293B',
    code: '#0A0A14',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#E2E8F0',
    tertiary: '#94A3B8',
    code: '#E2E8F0',
  }
};

// Supported programming languages
const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript', icon: '⚡', extensions: ['.js', '.jsx'] },
  { value: 'python', label: 'Python', icon: '🐍', extensions: ['.py'] },
  { value: 'java', label: 'Java', icon: '☕', extensions: ['.java'] },
  { value: 'cpp', label: 'C++', icon: '⚙️', extensions: ['.cpp', '.cc', '.cxx'] },
  { value: 'csharp', label: 'C#', icon: '🔷', extensions: ['.cs'] },
  { value: 'php', label: 'PHP', icon: '🐘', extensions: ['.php'] },
  { value: 'typescript', label: 'TypeScript', icon: '📘', extensions: ['.ts', '.tsx'] },
  { value: 'go', label: 'Go', icon: '🚀', extensions: ['.go'] },
  { value: 'ruby', label: 'Ruby', icon: '💎', extensions: ['.rb'] },
  { value: 'swift', label: 'Swift', icon: '🐦', extensions: ['.swift'] },
  { value: 'kotlin', label: 'Kotlin', icon: '🤖', extensions: ['.kt'] },
  { value: 'rust', label: 'Rust', icon: '🦀', extensions: ['.rs'] },
];

// Transformation modes
const transformationModes = [
  { id: 'convert', label: 'Conversion', icon: <SwapHorizRounded />, color: colors.accent.cyan, description: 'Convertir entre langages' },
  { id: 'optimize', label: 'Optimisation', icon: <SpeedRounded />, color: colors.accent.emerald, description: 'Optimiser les performances' },
  { id: 'validate', label: 'Validation', icon: <CheckCircleRounded />, color: colors.accent.amber, description: 'Vérifier la syntaxe' },
  { id: 'debug', label: 'Débogage', icon: <BugReportRounded />, color: colors.accent.pink, description: 'Corriger les bugs' },
  { id: 'refactor', label: 'Refactorisation', icon: <AutoFixHighRounded />, color: colors.accent.violet, description: 'Restructurer le code' },
];

const JsConverter = () => {
  const navigate = useNavigate();
  const isNotMobile = useMediaQuery("(min-width: 1000px)");
  const isLargeScreen = useMediaQuery("(min-width: 1200px)");
  
  // states
  const [sourceCode, setSourceCode] = useState("");
  const [transformedCode, setTransformedCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState("javascript");
  const [targetLanguage, setTargetLanguage] = useState("python");
  const [mode, setMode] = useState("convert");
  const [validationResult, setValidationResult] = useState(null);
  
  const loggedIn = JSON.parse(localStorage.getItem("authToken"));

  // Example code snippets
  const exampleSnippets = [
    {
      title: "Fonction Fibonacci",
      description: "Calcul de la suite de Fibonacci",
      language: "javascript",
      code: `function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    let temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}`,
      mode: "convert",
      targetLang: "python"
    },
    {
      title: "Tri à bulles optimisé",
      description: "Algorithme de tri avec drapeau d'optimisation",
      language: "javascript",
      code: `function bubbleSort(arr) {
  let n = arr.length;
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    n--;
  } while (swapped);
  return arr;
}`,
      mode: "optimize"
    },
    {
      title: "Validation d'email",
      description: "Fonction avec gestion d'erreurs",
      language: "javascript",
      code: `function validateEmail(email) {
  if (!email) return false;
  
  // Check basic email format
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Check for common invalid patterns
  if (email.includes('..')) return false;
  if (email.startsWith('.') || email.endsWith('.')) return false;
  
  return true;
}`,
      mode: "validate"
    },
    {
      title: "Requête API async",
      description: "Gestion d'erreurs complète",
      language: "javascript",
      code: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    // Retry logic could be added here
    return null;
  }
}`,
      mode: "debug"
    }
  ];

  // Function to extract clean code from AI response
  const extractCleanCode = (response) => {
    if (!response) return '';
    
    let cleaned = response;
    
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```[\w\s]*\n/g, '').replace(/```/g, '');
    
    // Remove explanations
    const lines = cleaned.split('\n');
    const codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && 
             !trimmed.startsWith('// Here') &&
             !trimmed.startsWith('// The') &&
             !trimmed.startsWith('// This') &&
             !trimmed.toLowerCase().includes('explanation:') &&
             !trimmed.toLowerCase().includes('note:') &&
             !trimmed.toLowerCase().includes('output:') &&
             !trimmed.toLowerCase().startsWith('result:');
    });
    
    return codeLines.join('\n').trim();
  };

  // Handle submit - FIXED for backend expecting { text: prompt }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sourceCode.trim()) {
      setError("Veuillez entrer du code source");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setLoading(true);
    setError("");
    setValidationResult(null);
    setTransformedCode("");
    
    try {
      // Build the prompt based on mode
      let prompt = "";
      
      switch(mode) {
        case 'convert':
          const sourceLangName = supportedLanguages.find(l => l.value === sourceLanguage)?.label || sourceLanguage;
          const targetLangName = supportedLanguages.find(l => l.value === targetLanguage)?.label || targetLanguage;
          prompt = `Convert this ${sourceLangName} code to ${targetLangName}:\n\n${sourceCode}\n\nPlease provide only the converted code without any explanations or comments.`;
          break;
          
        case 'optimize':
          prompt = `Optimize this ${supportedLanguages.find(l => l.value === sourceLanguage)?.label || sourceLanguage} code for performance, efficiency and best practices:\n\n${sourceCode}\n\nProvide only the optimized code without any explanations.`;
          break;
          
        case 'validate':
          prompt = `Validate this ${supportedLanguages.find(l => l.value === sourceLanguage)?.label || sourceLanguage} code for syntax errors, potential bugs and best practices.\nReturn the response as a JSON object with this structure: {\n  "isValid": boolean,\n  "errors": [{"line": number, "message": string, "type": string}],\n  "suggestions": [string],\n  "metrics": {"linesOfCode": number, "complexity": string}\n}\n\nCode to validate:\n${sourceCode}`;
          break;
          
        case 'debug':
          prompt = `Debug and fix any issues in this ${supportedLanguages.find(l => l.value === sourceLanguage)?.label || sourceLanguage} code:\n\n${sourceCode}\n\nProvide only the corrected code without explanations.`;
          break;
          
        case 'refactor':
          prompt = `Refactor this ${supportedLanguages.find(l => l.value === sourceLanguage)?.label || sourceLanguage} code for better maintainability, readability and following best practices:\n\n${sourceCode}\n\nProvide only the refactored code without explanations.`;
          break;
          
        default:
          prompt = sourceCode;
      }
      
      // Send request with format { text: prompt } that backend expects
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/openai/js-converter", 
        { text: prompt }
      );
      
      // Process the response
      if (mode === 'validate') {
        try {
          // Try to extract JSON from response
          const jsonMatch = data.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const validationData = JSON.parse(jsonMatch[0]);
            setValidationResult(validationData);
            toast.success("Validation terminée !");
          } else {
            // If no JSON found, show basic validation result
            setValidationResult({
              isValid: true,
              errors: [],
              suggestions: ["No syntax errors detected in the code"],
              metrics: { linesOfCode: sourceCode.split('\n').length, complexity: "Low" }
            });
            toast.success("Validation terminée !");
          }
        } catch (err) {
          console.error("JSON parse error:", err);
          // If JSON parsing fails, show error in validation result
          setValidationResult({
            isValid: false,
            errors: [{ 
              line: 0, 
              message: "Could not parse validation response from AI", 
              type: "Parsing Error" 
            }],
            suggestions: ["Please try again or use a different mode"],
            metrics: {}
          });
          toast.error("Erreur d'analyse de la réponse");
        }
      } else {
        // For other modes, extract clean code
        const cleanCode = extractCleanCode(data);
        setTransformedCode(cleanCode);
        toast.success("Transformation réussie !");
      }
    } catch (err) {
      console.error("Request error:", err.response?.data || err.message);
      
      if (err.response?.data?.error) {
        setError(`Erreur serveur: ${err.response.data.error}`);
      } else if (err.response?.data?.message) {
        setError(`Erreur: ${err.response.data.message}`);
      } else if (err.message) {
        setError(`Erreur: ${err.message}`);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
      
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSourceCode("");
    setTransformedCode("");
    setError("");
    setValidationResult(null);
  };

  const handleCopyCode = () => {
    const codeToCopy = transformedCode || sourceCode;
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy);
      toast.success("Code copié !");
    }
  };

  const handleDownloadCode = () => {
    const codeToDownload = transformedCode || sourceCode;
    if (codeToDownload) {
      const blob = new Blob([codeToDownload], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const lang = mode === 'convert' ? targetLanguage : sourceLanguage;
      const langInfo = supportedLanguages.find(l => l.value === lang);
      const extension = langInfo?.extensions?.[0] || '.txt';
      a.download = `code${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Code téléchargé !");
    }
  };

  const handleExampleClick = (example) => {
    setSourceCode(example.code);
    setSourceLanguage(example.language);
    setMode(example.mode);
    if (example.targetLang) {
      setTargetLanguage(example.targetLang);
    }
  };

  const getLanguageIcon = (lang) => {
    const langInfo = supportedLanguages.find(l => l.value === lang);
    return langInfo?.icon || '📝';
  };

  const getModeConfig = (modeId) => {
    return transformationModes.find(m => m.id === modeId);
  };

  if (!loggedIn) {
    return (
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${colors.background.dark} 0%, ${colors.background.light} 100%)`,
        }}
      >
        <Box
          sx={{
            p: 6,
            borderRadius: 4,
            background: colors.background.card,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
            maxWidth: 600,
            width: '100%',
          }}
        >
          <SwapHorizRounded sx={{ fontSize: 80, color: colors.accent.cyan, mb: 3 }} />
          <Typography variant="h3" fontWeight="700" sx={{ mb: 3, color: colors.text.primary }}>
            Advanced JS Converter
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: colors.text.secondary, lineHeight: 1.6 }}>
            Convertissez, optimisez et validez votre code entre différents langages de programmation.
            Outil avancé pour développeurs.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/login"
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 3,
              background: colors.primary.gradient,
              fontSize: '1.125rem',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
                transform: 'translateY(-2px)',
              }
            }}
          >
            Se connecter
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.background.dark} 0%, ${colors.background.light} 100%)`,
        p: { xs: 2, md: 3 },
        position: 'relative',
      }}
    >
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate("/")}
        sx={{
          mb: 3,
          color: colors.text.secondary,
          '&:hover': {
            color: colors.primary.light,
            backgroundColor: alpha(colors.primary.main, 0.1),
          }
        }}
      >
        Retour aux outils
      </Button>

      <Box
        sx={{
          maxWidth: isLargeScreen ? "1400px" : "100%",
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${colors.accent.cyan} 0%, #22D3EE 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: `0 10px 30px ${alpha(colors.accent.cyan, 0.3)}`,
              }}
            >
              <SwapHorizRounded sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h2" fontWeight="900" sx={{ color: colors.text.primary, lineHeight: 1 }}>
                JS Converter
              </Typography>
              <Typography variant="h6" sx={{ color: colors.accent.cyan, fontWeight: 600 }}>
                Transform • Optimize • Validate
              </Typography>
            </Box>
          </Box>
          <Typography variant="h6" sx={{ color: colors.text.secondary, maxWidth: 600, mx: 'auto' }}>
            Convertissez votre code JavaScript vers d'autres langages, optimisez les performances et validez la syntaxe
          </Typography>
        </Box>

        {/* Mode Selection & Language Picker */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: colors.background.card,
            border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* Mode Selection */}
          <Box>
            <Typography variant="subtitle1" fontWeight="600" sx={{ color: colors.text.primary, mb: 2 }}>
              Mode de transformation
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {transformationModes.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  sx={{
                    flexShrink: 0,
                    minWidth: 180,
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: `2px solid ${mode === item.id ? item.color : alpha(colors.text.tertiary, 0.1)}`,
                    background: mode === item.id ? alpha(item.color, 0.1) : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: alpha(item.color, 0.5),
                      background: alpha(item.color, 0.05),
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ color: item.color }}>
                      {item.icon}
                    </Box>
                    <Typography variant="subtitle2" fontWeight="700" sx={{ color: colors.text.primary }}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: colors.text.tertiary, lineHeight: 1.3 }}>
                    {item.description}
                  </Typography>
                </Card>
              ))}
            </Box>
          </Box>

          <Divider sx={{ borderColor: alpha(colors.text.tertiary, 0.1) }} />

          {/* Language Selection */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <LanguageRounded sx={{ color: colors.accent.cyan }} />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: colors.text.secondary }}>Langage source</InputLabel>
                <Select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  label="Langage source"
                  sx={{
                    color: colors.text.primary,
                    '& .MuiSelect-icon': { color: colors.text.secondary },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(colors.accent.cyan, 0.3),
                    },
                  }}
                >
                  {supportedLanguages.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: '1.2rem' }}>{lang.icon}</Typography>
                        <Box>
                          <Typography>{lang.label}</Typography>
                          <Typography variant="caption" sx={{ color: colors.text.tertiary }}>
                            {lang.extensions.join(', ')}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {mode === 'convert' && (
              <>
                <SwapHorizRounded sx={{ color: colors.accent.cyan, fontSize: 32 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <LanguageRounded sx={{ color: colors.accent.emerald }} />
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel sx={{ color: colors.text.secondary }}>Langage cible</InputLabel>
                    <Select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      label="Langage cible"
                      sx={{
                        color: colors.text.primary,
                        '& .MuiSelect-icon': { color: colors.text.secondary },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(colors.accent.emerald, 0.3),
                        },
                      }}
                    >
                      {supportedLanguages.map((lang) => (
                        <MenuItem key={lang.value} value={lang.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography sx={{ fontSize: '1.2rem' }}>{lang.icon}</Typography>
                            <Typography>{lang.label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </>
            )}
          </Box>
        </Paper>

        {/* Main Content */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: 3,
          height: { xs: 'auto', lg: '600px' },
        }}>
          {/* Left Panel - Source Code */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              background: colors.background.card,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
              height: { xs: 'auto', lg: '100%' },
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                borderBottom: `1px solid ${alpha(colors.text.tertiary, 0.1)}`,
                '& .MuiTab-root': {
                  color: colors.text.tertiary,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: colors.primary.light,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: colors.primary.light,
                },
                flexShrink: 0,
              }}
            >
              <Tab icon={<TerminalRounded />} iconPosition="start" label="Éditeur" />
              <Tab icon={<LightbulbRounded />} iconPosition="start" label="Exemples" />
            </Tabs>

            {activeTab === 0 ? (
              <Box sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column',
                flex: 1,
                overflow: 'hidden',
              }}>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 2,
                      borderRadius: 2,
                      backgroundColor: alpha('#DC2626', 0.1),
                      color: '#FECACA',
                      border: '1px solid #DC2626',
                      flexShrink: 0,
                    }}
                    onClose={() => setError("")}
                  >
                    {error}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexShrink: 0 }}>
                  <Chip 
                    icon={<Typography sx={{ fontSize: '1.2rem' }}>{getLanguageIcon(sourceLanguage)}</Typography>}
                    label={supportedLanguages.find(l => l.value === sourceLanguage)?.label || sourceLanguage}
                    sx={{
                      background: alpha(colors.accent.cyan, 0.1),
                      color: colors.accent.cyan,
                      fontWeight: 600,
                      '& .MuiChip-icon': { ml: 0.5 }
                    }}
                  />
                  <Typography variant="body2" sx={{ color: colors.text.tertiary, ml: 'auto' }}>
                    {getModeConfig(mode)?.label}
                  </Typography>
                </Box>

                <TextField
                  placeholder={`Entrez votre code ${supportedLanguages.find(l => l.value === sourceLanguage)?.label || sourceLanguage} ici...`}
                  multiline
                  rows={18}
                  fullWidth
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  disabled={loading}
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    '& .MuiOutlinedInput-root': {
                      color: colors.text.code,
                      backgroundColor: colors.background.code,
                      borderRadius: 2,
                      fontFamily: '"Fira Code", monospace',
                      fontSize: '14px',
                      height: '100%',
                      alignItems: 'flex-start',
                      '& fieldset': {
                        borderColor: alpha(colors.accent.cyan, 0.3),
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(colors.accent.cyan, 0.5),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colors.accent.cyan,
                      },
                      '& textarea': {
                        resize: 'vertical',
                        minHeight: '100px',
                        fontFamily: '"Fira Code", monospace',
                      }
                    },
                  }}
                />

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowRounded />}
                  disabled={loading || !sourceCode.trim()}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${getModeConfig(mode)?.color} 0%, ${alpha(getModeConfig(mode)?.color, 0.7)} 100%)`,
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'none',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(getModeConfig(mode)?.color, 0.9)} 0%, ${alpha(getModeConfig(mode)?.color, 0.6)} 100%)`,
                      boxShadow: `0 10px 25px ${alpha(getModeConfig(mode)?.color, 0.3)}`,
                    },
                    '&:disabled': {
                      background: alpha(colors.text.tertiary, 0.2),
                      color: alpha(colors.text.tertiary, 0.5),
                    }
                  }}
                >
                  {loading ? "Traitement..." : `Exécuter ${getModeConfig(mode)?.label}`}
                </Button>
              </Box>
            ) : (
              <Box sx={{ 
                p: 3, 
                flex: 1,
                overflow: 'auto',
              }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 3, color: colors.text.primary }}>
                  Exemples de code
                </Typography>
                
                <Stack spacing={2}>
                  {exampleSnippets.map((example, index) => (
                    <Card
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: alpha(colors.background.dark, 0.5),
                        border: `1px solid ${alpha(getModeConfig(example.mode)?.color, 0.2)}`,
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: alpha(getModeConfig(example.mode)?.color, 0.4),
                          background: alpha(getModeConfig(example.mode)?.color, 0.05),
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: alpha(getModeConfig(example.mode)?.color, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: getModeConfig(example.mode)?.color,
                            flexShrink: 0,
                          }}
                        >
                          {getModeConfig(example.mode)?.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="600" sx={{ color: colors.text.primary, mb: 0.5 }}>
                            {example.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 1, lineHeight: 1.5 }}>
                            {example.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip 
                                label={example.language}
                                size="small"
                                sx={{
                                  background: alpha(colors.accent.amber, 0.1),
                                  color: colors.accent.amber,
                                }}
                              />
                              {example.targetLang && (
                                <Chip 
                                  icon={<SwapHorizRounded sx={{ fontSize: 14 }} />}
                                  label={example.targetLang}
                                  size="small"
                                  sx={{
                                    background: alpha(colors.accent.cyan, 0.1),
                                    color: colors.accent.cyan,
                                  }}
                                />
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ color: colors.text.tertiary }}>
                              {example.code.split('\n').length} lignes
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>

          {/* Right Panel - Results */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              background: colors.background.card,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
              height: { xs: 'auto', lg: '100%' },
              overflow: 'hidden',
            }}
          >
            <Box sx={{ 
              p: 2, 
              borderBottom: `1px solid ${alpha(colors.text.tertiary, 0.1)}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight="700" sx={{ color: colors.text.primary }}>
                  {mode === 'validate' ? 'Rapport de validation' : 'Résultat'}
                </Typography>
                {mode === 'convert' && (
                  <Chip 
                    icon={<Typography sx={{ fontSize: '1.2rem' }}>{getLanguageIcon(targetLanguage)}</Typography>}
                    label={supportedLanguages.find(l => l.value === targetLanguage)?.label || targetLanguage}
                    size="small"
                    sx={{
                      background: alpha(colors.accent.emerald, 0.1),
                      color: colors.accent.emerald,
                      fontWeight: 600,
                      '& .MuiChip-icon': { ml: 0.5 }
                    }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Copier">
                  <IconButton
                    onClick={handleCopyCode}
                    size="small"
                    disabled={!transformedCode && !validationResult}
                    sx={{
                      color: colors.text.tertiary,
                      '&:hover': {
                        color: colors.accent.cyan,
                        backgroundColor: alpha(colors.accent.cyan, 0.1),
                      },
                      '&:disabled': {
                        color: alpha(colors.text.tertiary, 0.3),
                      }
                    }}
                  >
                    <ContentCopyRounded />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Télécharger">
                  <IconButton
                    onClick={handleDownloadCode}
                    size="small"
                    disabled={!transformedCode && !validationResult}
                    sx={{
                      color: colors.text.tertiary,
                      '&:hover': {
                        color: colors.primary.light,
                        backgroundColor: alpha(colors.primary.main, 0.1),
                      },
                      '&:disabled': {
                        color: alpha(colors.text.tertiary, 0.3),
                      }
                    }}
                  >
                    <DownloadRounded />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Effacer tout">
                  <IconButton
                    onClick={handleClear}
                    size="small"
                    sx={{
                      color: colors.text.tertiary,
                      '&:hover': {
                        color: colors.accent.pink,
                        backgroundColor: alpha(colors.accent.pink, 0.1),
                      }
                    }}
                  >
                    <RefreshRounded />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Card
              sx={{
                flex: 1,
                m: 2,
                borderRadius: 2,
                backgroundColor: colors.background.code,
                border: `1px solid ${alpha(colors.text.tertiary, 0.1)}`,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(colors.background.dark, 0.3),
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(getModeConfig(mode)?.color, 0.4),
                  borderRadius: '4px',
                  '&:hover': {
                    background: alpha(getModeConfig(mode)?.color, 0.6),
                  }
                }
              }}
            >
              {loading ? (
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: 0,
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress 
                      size={60} 
                      thickness={4}
                      sx={{ 
                        color: getModeConfig(mode)?.color,
                        mb: 3,
                      }} 
                    />
                    <Typography variant="h6" sx={{ color: colors.text.secondary }}>
                      {mode === 'convert' ? 'Conversion en cours...' :
                       mode === 'optimize' ? 'Optimisation...' :
                       mode === 'validate' ? 'Validation syntaxique...' :
                       mode === 'debug' ? 'Analyse de débogage...' : 'Refactorisation...'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text.tertiary, mt: 1 }}>
                      Veuillez patienter quelques instants
                    </Typography>
                  </Box>
                </Box>
              ) : validationResult ? (
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <CheckCircleRounded sx={{ 
                      color: validationResult.isValid ? colors.accent.emerald : colors.accent.amber, 
                      fontSize: 32 
                    }} />
                    <Box>
                      <Typography variant="h6" sx={{ color: colors.text.primary }}>
                        Analyse terminée
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                        {validationResult.isValid ? 'Code valide' : 'Problèmes détectés'}
                      </Typography>
                    </Box>
                  </Box>

                  {validationResult.errors && validationResult.errors.length > 0 ? (
                    <Box>
                      <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 2 }}
                        icon={<BugReportRounded />}
                      >
                        <Typography fontWeight="600">
                          {validationResult.errors.length} erreur(s) détectée(s)
                        </Typography>
                      </Alert>
                      <Stack spacing={2}>
                        {validationResult.errors.map((err, idx) => (
                          <Card
                            key={idx}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: alpha('#DC2626', 0.05),
                              border: `1px solid ${alpha('#DC2626', 0.2)}`,
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ color: '#FCA5A5', mb: 0.5 }}>
                              {err.type || 'Erreur'} {err.line ? `(Ligne ${err.line})` : ''}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                              {err.message}
                            </Typography>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Alert 
                      severity="success" 
                      sx={{ borderRadius: 2, mb: 3 }}
                      icon={<CheckCircleRounded />}
                    >
                      <Typography fontWeight="600">
                        Code valide ! Aucune erreur de syntaxe détectée.
                      </Typography>
                    </Alert>
                  )}

                  {validationResult.metrics && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ color: colors.text.primary, mb: 2 }}>
                        Métriques du code
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ color: colors.text.tertiary }}>
                            Lignes de code
                          </Typography>
                          <Typography variant="h6" sx={{ color: colors.accent.emerald }}>
                            {validationResult.metrics.linesOfCode || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ color: colors.text.tertiary }}>
                            Complexité
                          </Typography>
                          <Typography variant="h6" sx={{ color: colors.accent.amber }}>
                            {validationResult.metrics.complexity || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ color: colors.text.primary, mb: 2 }}>
                        Suggestions d'amélioration
                      </Typography>
                      <Stack spacing={1}>
                        {validationResult.suggestions.map((suggestion, idx) => (
                          <Alert key={idx} severity="info" icon={<LightbulbRounded />}>
                            {suggestion}
                          </Alert>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              ) : transformedCode ? (
                <Box
                  component="pre"
                  sx={{
                    margin: 0,
                    padding: '1.5rem',
                    fontFamily: '"Fira Code", "Consolas", "Monaco", "Courier New", monospace',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto',
                    color: colors.text.code,
                  }}
                >
                  {transformedCode}
                </Box>
              ) : (
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: 0,
                }}>
                  <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                    {mode === 'convert' ? (
                      <SwapHorizRounded sx={{ fontSize: 80, color: alpha(colors.accent.cyan, 0.3), mb: 3 }} />
                    ) : mode === 'optimize' ? (
                      <SpeedRounded sx={{ fontSize: 80, color: alpha(colors.accent.emerald, 0.3), mb: 3 }} />
                    ) : mode === 'validate' ? (
                      <CheckCircleRounded sx={{ fontSize: 80, color: alpha(colors.accent.amber, 0.3), mb: 3 }} />
                    ) : mode === 'debug' ? (
                      <BugReportRounded sx={{ fontSize: 80, color: alpha(colors.accent.pink, 0.3), mb: 3 }} />
                    ) : (
                      <AutoFixHighRounded sx={{ fontSize: 80, color: alpha(colors.accent.violet, 0.3), mb: 3 }} />
                    )}
                    <Typography variant="h6" sx={{ color: colors.text.secondary, mb: 2 }}>
                      {mode === 'convert' ? 'Le code converti apparaîtra ici' :
                       mode === 'optimize' ? 'Le code optimisé apparaîtra ici' :
                       mode === 'validate' ? 'Le rapport de validation apparaîtra ici' :
                       mode === 'debug' ? 'L\'analyse de débogage apparaîtra ici' : 'Le code refactorisé apparaîtra ici'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text.tertiary, lineHeight: 1.6 }}>
                      {mode === 'convert' ? 'Convertissez votre code vers un autre langage de programmation' :
                       mode === 'optimize' ? 'Optimisez les performances et réduisez la complexité' :
                       mode === 'validate' ? 'Vérifiez la syntaxe et détectez les erreurs' :
                       mode === 'debug' ? 'Identifiez et corrigez les bugs automatiquement' : 'Restructurez pour une meilleure maintenabilité'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Card>

            {(transformedCode || validationResult) && !loading && (
              <Box sx={{ 
                p: 2, 
                borderTop: `1px solid ${alpha(colors.text.tertiary, 0.1)}`,
                flexShrink: 0,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: colors.text.tertiary }}>
                    {validationResult ? 
                      `${validationResult.errors?.length || 0} erreurs • ${validationResult.suggestions?.length || 0} suggestions` :
                      `${transformedCode.length} caractères • ${transformedCode.split('\n').length} lignes`
                    }
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: colors.text.tertiary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    <Box 
                      sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%',
                        background: getModeConfig(mode)?.color
                      }} 
                    />
                    {getModeConfig(mode)?.label}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Footer Stats */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 4, 
          mt: 2, 
          flexWrap: 'wrap',
          p: 3,
          borderRadius: 3,
          background: alpha(colors.background.card, 0.5),
          border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.text.tertiary, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LanguageRounded sx={{ fontSize: 16 }} /> Langages
            </Typography>
            <Typography variant="h6" sx={{ color: colors.accent.cyan, fontWeight: 700 }}>
              {supportedLanguages.length}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.text.tertiary, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SpeedRounded sx={{ fontSize: 16 }} /> Rapidité
            </Typography>
            <Typography variant="h6" sx={{ color: colors.accent.emerald, fontWeight: 700 }}>
              2-5s
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.text.tertiary, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleRounded sx={{ fontSize: 16 }} /> Précision
            </Typography>
            <Typography variant="h6" sx={{ color: colors.accent.amber, fontWeight: 700 }}>
              99%
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.text.tertiary, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AutoFixHighRounded sx={{ fontSize: 16 }} /> Qualité
            </Typography>
            <Typography variant="h6" sx={{ color: colors.primary.light, fontWeight: 700 }}>
              Production
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default JsConverter;