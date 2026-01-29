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
  Chip,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput
} from "@mui/material";
import {
  FormatQuoteRounded,
  ArrowBackRounded,
  RefreshRounded,
  ContentCopyRounded,
  AutoAwesomeRounded,
  DownloadRounded,
  PsychologyRounded,
  StyleRounded,
  TextFieldsRounded,
  FormatSizeRounded,
  LightbulbRounded
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
    emerald: '#10B981',
    amber: '#F59E0B',
    cyan: '#06B6D4',
    purple: '#8B5CF6',
  },
  background: {
    dark: '#0F172A',
    card: 'rgba(30, 41, 59, 0.95)',
    light: '#1E293B',
    paragraph: '#0A0A14',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#E2E8F0',
    tertiary: '#94A3B8',
    paragraph: '#E2E8F0',
  }
};

// Writing styles
const writingStyles = [
  { value: 'professional', label: 'Professional', icon: '👔' },
  { value: 'casual', label: 'Casual', icon: '😊' },
  { value: 'academic', label: 'Academic', icon: '🎓' },
  { value: 'creative', label: 'Creative', icon: '🎨' },
  { value: 'persuasive', label: 'Persuasive', icon: '💬' },
  { value: 'descriptive', label: 'Descriptive', icon: '📝' },
];

// Paragraph lengths
const paragraphLengths = [
  { value: 'short', label: 'Short (50-100 words)' },
  { value: 'medium', label: 'Medium (100-200 words)' },
  { value: 'long', label: 'Long (200-400 words)' },
  { value: 'very-long', label: 'Very Long (400+ words)' },
];

const Paragraph = () => {
  const navigate = useNavigate();
  const isNotMobile = useMediaQuery("(min-width: 1000px)");
  const isLargeScreen = useMediaQuery("(min-width: 1200px)");
  
  // states
  const [text, setText] = useState("");
  const [para, setPara] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [writingStyle, setWritingStyle] = useState('professional');
  const [paragraphLength, setParagraphLength] = useState('medium');
  const [creativityLevel, setCreativityLevel] = useState(70);
  const loggedIn = JSON.parse(localStorage.getItem("authToken"));

  // Example prompts
  const examplePrompts = [
    {
      title: "Product Description",
      prompt: "Write a paragraph about a new wireless earbuds with noise cancellation",
      style: "Persuasive"
    },
    {
      title: "Travel Blog",
      prompt: "Describe the experience of visiting the Eiffel Tower at sunset",
      style: "Descriptive"
    },
    {
      title: "Business Email",
      prompt: "Write a professional paragraph for a meeting follow-up email",
      style: "Professional"
    },
    {
      title: "Story Opening",
      prompt: "Begin a story about a mysterious package that arrives at the doorstep",
      style: "Creative"
    }
  ];

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter a topic or prompt");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Enhanced prompt with style and length parameters
      const enhancedPrompt = `Write a ${paragraphLength} paragraph in ${writingStyle} style with creativity level ${creativityLevel}/100 about: ${text}`;
      
      const { data } = await axios.post("http://localhost:5000/api/v1/openai/paragraph", { 
        text: enhancedPrompt 
      });
      setPara(data);
      toast.success("Paragraph generated successfully!");
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setPara("");
    setError("");
  };

  const handleCopyParagraph = () => {
    if (para) {
      navigator.clipboard.writeText(para);
      toast.success("Paragraph copied to clipboard!");
    }
  };

  const handleDownloadParagraph = () => {
    if (para) {
      const blob = new Blob([para], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-paragraph.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Paragraph downloaded!");
    }
  };

  const handleExampleClick = (prompt) => {
    setText(prompt);
    setActiveTab(0);
  };

  const calculateWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
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
          <FormatQuoteRounded sx={{ fontSize: 80, color: colors.accent.emerald, mb: 3 }} />
          <Typography variant="h3" fontWeight="700" sx={{ mb: 3, color: colors.text.primary }}>
            Paragraph Generator Access Required
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: colors.text.secondary, lineHeight: 1.6 }}>
            Please log in to access our intelligent paragraph generator. 
            Create engaging, well-structured paragraphs from simple prompts instantly.
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
            Log In to Continue
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
        Back to Tools
      </Button>

      <Box
        sx={{
          maxWidth: isLargeScreen ? "1200px" : "100%",
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
                background: `linear-gradient(135deg, ${colors.accent.emerald} 0%, #34D399 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: `0 10px 30px ${alpha(colors.accent.emerald, 0.3)}`,
              }}
            >
              <FormatQuoteRounded sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h2" fontWeight="900" sx={{ color: colors.text.primary }}>
              Paragraph Generator
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: colors.text.secondary, maxWidth: 600, mx: 'auto' }}>
            Transform your ideas into well-crafted paragraphs. Generate engaging content 
            in various styles and lengths with AI-powered writing assistance.
          </Typography>
        </Box>

        {/* Main Content */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: 3,
          height: { xs: 'auto', lg: '650px' },
        }}>
          {/* Left Panel - Input & Settings */}
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
              <Tab icon={<TextFieldsRounded />} iconPosition="start" label="Generator" />
              <Tab icon={<LightbulbRounded />} iconPosition="start" label="Examples" />
            </Tabs>

            {activeTab === 0 ? (
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 2, color: colors.text.primary, flexShrink: 0 }}>
                    Enter Your Topic or Prompt
                  </Typography>

                  <TextField
                    placeholder="Describe what you want the paragraph to be about..."
                    type="text"
                    multiline
                    rows={8}
                    required
                    margin="normal"
                    fullWidth
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={loading}
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      '& .MuiOutlinedInput-root': {
                        color: colors.text.primary,
                        backgroundColor: alpha(colors.background.dark, 0.5),
                        borderRadius: 2,
                        height: '100%',
                        alignItems: 'flex-start',
                        '& fieldset': {
                          borderColor: alpha(colors.accent.emerald, 0.3),
                        },
                        '&:hover fieldset': {
                          borderColor: alpha(colors.accent.emerald, 0.5),
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.accent.emerald,
                        },
                        '& textarea': {
                          resize: 'vertical',
                          minHeight: '120px',
                          fontFamily: 'inherit',
                          lineHeight: 1.6,
                          overflow: 'auto',
                        }
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: colors.text.tertiary,
                        opacity: 0.7,
                      }
                    }}
                  />

                  {/* Settings Panel */}
                  <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: alpha(colors.background.dark, 0.3), flexShrink: 0 }}>
                    <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2, color: colors.text.secondary }}>
                      Paragraph Settings
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Writing Style */}
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: colors.text.tertiary, '&.Mui-focused': { color: colors.accent.emerald } }}>
                          Writing Style
                        </InputLabel>
                        <Select
                          value={writingStyle}
                          onChange={(e) => setWritingStyle(e.target.value)}
                          input={<OutlinedInput label="Writing Style" />}
                          sx={{
                            color: colors.text.primary,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha(colors.text.tertiary, 0.3),
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: colors.accent.emerald,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: colors.accent.emerald,
                            },
                          }}
                        >
                          {writingStyles.map((style) => (
                            <MenuItem key={style.value} value={style.value} sx={{ color: colors.text.primary }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography component="span">{style.icon}</Typography>
                                <Typography>{style.label}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Paragraph Length */}
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: colors.text.tertiary, '&.Mui-focused': { color: colors.accent.emerald } }}>
                          Paragraph Length
                        </InputLabel>
                        <Select
                          value={paragraphLength}
                          onChange={(e) => setParagraphLength(e.target.value)}
                          input={<OutlinedInput label="Paragraph Length" />}
                          sx={{
                            color: colors.text.primary,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha(colors.text.tertiary, 0.3),
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: colors.accent.emerald,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: colors.accent.emerald,
                            },
                          }}
                        >
                          {paragraphLengths.map((length) => (
                            <MenuItem key={length.value} value={length.value} sx={{ color: colors.text.primary }}>
                              {length.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Creativity Level */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                            Creativity Level
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: colors.accent.emerald,
                            fontWeight: 600,
                          }}>
                            {creativityLevel}%
                          </Typography>
                        </Box>
                        <Slider
                          value={creativityLevel}
                          onChange={(e, newValue) => setCreativityLevel(newValue)}
                          aria-label="Creativity Level"
                          min={10}
                          max={100}
                          step={10}
                          sx={{
                            color: colors.accent.emerald,
                            '& .MuiSlider-thumb': {
                              '&:hover, &.Mui-focusVisible': {
                                boxShadow: `0 0 0 8px ${alpha(colors.accent.emerald, 0.16)}`,
                              },
                            },
                          }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ color: colors.text.tertiary }}>
                            More Accurate
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.text.tertiary }}>
                            More Creative
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', flexShrink: 0 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeRounded />}
                      disabled={loading || !text.trim()}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${colors.accent.emerald} 0%, #34D399 100%)`,
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'none',
                        minWidth: 150,
                        '&:hover': {
                          background: `linear-gradient(135deg, #059669 0%, #10B981 100%)`,
                          boxShadow: `0 10px 25px ${alpha(colors.accent.emerald, 0.3)}`,
                        },
                        '&:disabled': {
                          background: alpha(colors.text.tertiary, 0.2),
                          color: alpha(colors.text.tertiary, 0.5),
                        }
                      }}
                    >
                      {loading ? "Generating..." : "Generate Paragraph"}
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<RefreshRounded />}
                      onClick={handleClear}
                      disabled={loading}
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(colors.text.tertiary, 0.3)}`,
                        color: colors.text.secondary,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: colors.text.tertiary,
                          backgroundColor: alpha(colors.text.tertiary, 0.1),
                        }
                      }}
                    >
                      Clear
                    </Button>
                  </Box>

                  <Typography variant="body2" sx={{ mt: 2, color: colors.text.tertiary, textAlign: 'center', flexShrink: 0 }}>
                    Tip: Be specific about the topic and desired tone for better results
                  </Typography>
                </form>
              </Box>
            ) : (
              <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 3, color: colors.text.primary }}>
                  Example Prompts
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: colors.text.secondary, lineHeight: 1.6 }}>
                  Click on any example below to load it into the generator
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {examplePrompts.map((example, index) => (
                    <Card
                      key={index}
                      onClick={() => handleExampleClick(example.prompt)}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        background: alpha(colors.background.dark, 0.5),
                        border: `1px solid ${alpha(colors.accent.emerald, 0.2)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: alpha(colors.accent.emerald, 0.4),
                          background: alpha(colors.accent.emerald, 0.05),
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: alpha(colors.accent.emerald, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.accent.emerald,
                            flexShrink: 0,
                          }}
                        >
                          <FormatQuoteRounded sx={{ fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="600" sx={{ color: colors.text.primary, mb: 0.5 }}>
                            {example.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 1, lineHeight: 1.5 }}>
                            {example.prompt}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ 
                              color: colors.accent.emerald,
                              backgroundColor: alpha(colors.accent.emerald, 0.1),
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontWeight: 600,
                            }}>
                              {example.style} Style
                            </Typography>
                            <Button
                              size="small"
                              sx={{
                                color: colors.text.tertiary,
                                fontSize: '0.75rem',
                                '&:hover': {
                                  color: colors.accent.emerald,
                                  backgroundColor: alpha(colors.accent.emerald, 0.1),
                                }
                              }}
                            >
                              Use This
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>

          {/* Right Panel - Generated Paragraph */}
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
              <Typography variant="h6" fontWeight="700" sx={{ color: colors.text.primary }}>
                Generated Paragraph
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {para && (
                  <>
                    <Chip
                      label={writingStyles.find(s => s.value === writingStyle)?.label || writingStyle}
                      size="small"
                      icon={<StyleRounded sx={{ fontSize: 16 }} />}
                      sx={{
                        backgroundColor: alpha(colors.accent.emerald, 0.1),
                        color: colors.accent.emerald,
                        fontWeight: 600,
                      }}
                    />
                    <Tooltip title="Copy Paragraph">
                      <IconButton
                        onClick={handleCopyParagraph}
                        size="small"
                        sx={{
                          color: colors.text.tertiary,
                          '&:hover': {
                            color: colors.accent.emerald,
                            backgroundColor: alpha(colors.accent.emerald, 0.1),
                          }
                        }}
                      >
                        <ContentCopyRounded />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Paragraph">
                      <IconButton
                        onClick={handleDownloadParagraph}
                        size="small"
                        sx={{
                          color: colors.text.tertiary,
                          '&:hover': {
                            color: colors.primary.light,
                            backgroundColor: alpha(colors.primary.main, 0.1),
                          }
                        }}
                      >
                        <DownloadRounded />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </Box>

            <Card
              sx={{
                flex: 1,
                m: 2,
                borderRadius: 2,
                backgroundColor: colors.background.paragraph,
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
                  background: alpha(colors.accent.emerald, 0.4),
                  borderRadius: '4px',
                  '&:hover': {
                    background: alpha(colors.accent.emerald, 0.6),
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
                        color: colors.accent.emerald,
                        mb: 3,
                      }} 
                    />
                    <Typography variant="h6" sx={{ color: colors.text.secondary }}>
                      Crafting Your Paragraph...
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text.tertiary, mt: 1 }}>
                      Writing in {writingStyle} style with {creativityLevel}% creativity
                    </Typography>
                  </Box>
                </Box>
              ) : para ? (
                <Box
                  sx={{
                    flex: 1,
                    p: 3,
                    color: colors.text.paragraph,
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    fontFamily: '"Georgia", "Times New Roman", serif',
                  }}
                >
                  {para}
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
                    <FormatQuoteRounded sx={{ fontSize: 80, color: alpha(colors.text.tertiary, 0.3), mb: 3 }} />
                    <Typography variant="h6" sx={{ color: colors.text.secondary, mb: 2 }}>
                      Generated Paragraph Will Appear Here
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text.tertiary, lineHeight: 1.6 }}>
                      Enter your topic or prompt in the left panel.
                      The AI will generate a well-crafted paragraph based on your settings.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Card>

            {para && !loading && (
              <Box sx={{ 
                p: 2, 
                borderTop: `1px solid ${alpha(colors.text.tertiary, 0.1)}`,
                flexShrink: 0,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: colors.text.tertiary }}>
                      {calculateWordCount(para)} words
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PsychologyRounded sx={{ fontSize: 16, color: colors.accent.emerald }} />
                      <Typography variant="caption" sx={{ color: colors.text.tertiary }}>
                        {creativityLevel}% creativity
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    startIcon={<RefreshRounded />}
                    onClick={() => setPara("")}
                    size="small"
                    sx={{
                      color: colors.text.tertiary,
                      '&:hover': {
                        color: colors.accent.emerald,
                        backgroundColor: alpha(colors.accent.emerald, 0.1),
                      }
                    }}
                  >
                    Clear Paragraph
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Features/Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
              <StyleRounded sx={{ fontSize: 20, color: colors.accent.emerald }} />
              <Typography variant="body2" sx={{ color: colors.text.tertiary }}>
                Writing Styles
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: colors.accent.emerald, fontWeight: 700 }}>
              6 Styles
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
              <FormatSizeRounded sx={{ fontSize: 20, color: colors.accent.cyan }} />
              <Typography variant="body2" sx={{ color: colors.text.tertiary }}>
                Length Options
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: colors.accent.cyan, fontWeight: 700 }}>
              4 Lengths
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
              <PsychologyRounded sx={{ fontSize: 20, color: colors.accent.purple }} />
              <Typography variant="body2" sx={{ color: colors.text.tertiary }}>
                Creativity Control
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: colors.accent.purple, fontWeight: 700 }}>
              10 Levels
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
              <AutoAwesomeRounded sx={{ fontSize: 20, color: colors.accent.amber }} />
              <Typography variant="body2" sx={{ color: colors.text.tertiary }}>
                Generation Time
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: colors.accent.amber, fontWeight: 700 }}>
              3-8 seconds
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Paragraph;