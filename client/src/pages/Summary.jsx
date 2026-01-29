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
  Divider,
  Chip
} from "@mui/material";
import {
  SummarizeRounded,
  ArrowBackRounded,
  RefreshRounded,
  ContentCopyRounded,
  ArticleRounded,
  DownloadRounded,
  TimerRounded,
  AutoAwesomeRounded
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
    cyan: '#06B6D4',
    emerald: '#10B981',
    amber: '#F59E0B',
    purple: '#8B5CF6',
  },
  background: {
    dark: '#0F172A',
    card: 'rgba(30, 41, 59, 0.95)',
    light: '#1E293B',
    summary: '#0A0A14',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#E2E8F0',
    tertiary: '#94A3B8',
    summary: '#E2E8F0',
  }
};

const Summary = () => {
  const navigate = useNavigate();
  const isNotMobile = useMediaQuery("(min-width: 1000px)");
  const isLargeScreen = useMediaQuery("(min-width: 1200px)");
  
  // states
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const loggedIn = JSON.parse(localStorage.getItem("authToken"));

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter text to summarize");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    if (text.length < 150) {
      setError("Please enter at least 150 characters for better summarization");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const { data } = await axios.post("http://localhost:5000/api/v1/openai/chatbot", { text });
      setSummary(data);
      toast.success("Text summarized successfully!");
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
    setSummary("");
    setError("");
  };

  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      toast.success("Summary copied to clipboard!");
    }
  };

  const handleDownloadSummary = () => {
    if (summary) {
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'text-summary.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Summary downloaded!");
    }
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
          <SummarizeRounded sx={{ fontSize: 80, color: colors.accent.cyan, mb: 3 }} />
          <Typography variant="h3" fontWeight="700" sx={{ mb: 3, color: colors.text.primary }}>
            Text Summarizer Access Required
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: colors.text.secondary, lineHeight: 1.6 }}>
            Please log in to access our intelligent text summarizer. 
            Transform lengthy articles and documents into concise summaries instantly.
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
                background: `linear-gradient(135deg, ${colors.accent.cyan} 0%, #22D3EE 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: `0 10px 30px ${alpha(colors.accent.cyan, 0.3)}`,
              }}
            >
              <SummarizeRounded sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h2" fontWeight="900" sx={{ color: colors.text.primary }}>
              Text Summarizer
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: colors.text.secondary, maxWidth: 600, mx: 'auto' }}>
            Transform lengthy articles, documents, and texts into concise, easy-to-read summaries.
            Save time and extract key information instantly.
          </Typography>
        </Box>

        {/* Main Content */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: 3,
          height: { xs: 'auto', lg: '600px' },
        }}>
          {/* Left Panel - Input */}
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
                Input Text
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<ArticleRounded sx={{ fontSize: 16 }} />}
                  label={`${calculateWordCount(text)} words`}
                  size="small"
                  sx={{
                    backgroundColor: alpha(colors.accent.cyan, 0.1),
                    color: colors.accent.cyan,
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>

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
                <TextField
                  placeholder="Paste or type your text here (minimum 150 characters for best results)..."
                  type="text"
                  multiline
                  rows={15}
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
                        minHeight: '150px',
                        maxHeight: '350px',
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

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mt: 2,
                  mb: 1,
                  flexShrink: 0,
                }}>
                  <Typography variant="caption" sx={{ color: colors.text.tertiary }}>
                    {text.length >= 150 ? (
                      <Box component="span" sx={{ color: colors.accent.emerald, fontWeight: 600 }}>
                        ✓ Minimum length reached
                      </Box>
                    ) : (
                      `Need ${150 - text.length} more characters`
                    )}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.text.tertiary }}>
                    {text.length} / 150 characters
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap', flexShrink: 0 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeRounded />}
                    disabled={loading || text.length < 150}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${colors.accent.cyan} 0%, #22D3EE 100%)`,
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'none',
                      minWidth: 150,
                      '&:hover': {
                        background: `linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)`,
                        boxShadow: `0 10px 25px ${alpha(colors.accent.cyan, 0.3)}`,
                      },
                      '&:disabled': {
                        background: alpha(colors.text.tertiary, 0.2),
                        color: alpha(colors.text.tertiary, 0.5),
                      }
                    }}
                  >
                    {loading ? "Summarizing..." : "Generate Summary"}
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
                  Tip: The longer and more detailed your input text, the better the summary quality
                </Typography>
              </form>
            </Box>
          </Paper>

          {/* Right Panel - Summary */}
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
                AI Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {summary && (
                  <>
                    <Tooltip title="Copy Summary">
                      <IconButton
                        onClick={handleCopySummary}
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
                    <Tooltip title="Download Summary">
                      <IconButton
                        onClick={handleDownloadSummary}
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
                backgroundColor: colors.background.summary,
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
                  background: alpha(colors.accent.cyan, 0.4),
                  borderRadius: '4px',
                  '&:hover': {
                    background: alpha(colors.accent.cyan, 0.6),
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
                        color: colors.accent.cyan,
                        mb: 3,
                      }} 
                    />
                    <Typography variant="h6" sx={{ color: colors.text.secondary }}>
                      Analyzing and Summarizing...
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text.tertiary, mt: 1 }}>
                      Extracting key points from your text
                    </Typography>
                  </Box>
                </Box>
              ) : summary ? (
                <Box
                  sx={{
                    flex: 1,
                    p: 3,
                    color: colors.text.summary,
                    lineHeight: 1.8,
                    fontSize: '1.05rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    '& p': {
                      marginBottom: '1.2rem',
                      '&:last-child': {
                        marginBottom: 0,
                      }
                    }
                  }}
                >
                  {summary.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <Typography 
                        key={index} 
                        component="p"
                        sx={{ 
                          color: colors.text.summary,
                          lineHeight: 1.8,
                          fontSize: '1.05rem',
                          mb: 2,
                          '&:last-child': {
                            mb: 0,
                          }
                        }}
                      >
                        {paragraph}
                      </Typography>
                    )
                  ))}
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
                    <SummarizeRounded sx={{ fontSize: 80, color: alpha(colors.text.tertiary, 0.3), mb: 3 }} />
                    <Typography variant="h6" sx={{ color: colors.text.secondary, mb: 2 }}>
                      Summary Will Appear Here
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text.tertiary, lineHeight: 1.6 }}>
                      Enter your text in the left panel and generate a concise summary.
                      The AI will extract key points and present them here.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Card>

            {summary && !loading && (
              <Box sx={{ 
                p: 2, 
                borderTop: `1px solid ${alpha(colors.text.tertiary, 0.1)}`,
                flexShrink: 0,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: colors.text.tertiary }}>
                      {calculateWordCount(text)} → {calculateWordCount(summary)} words
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: colors.accent.emerald,
                      backgroundColor: alpha(colors.accent.emerald, 0.1),
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 600,
                    }}>
                      {Math.round((1 - calculateWordCount(summary) / calculateWordCount(text)) * 100)}% shorter
                    </Typography>
                  </Box>
                  <Button
                    startIcon={<RefreshRounded />}
                    onClick={() => setSummary("")}
                    size="small"
                    sx={{
                      color: colors.text.tertiary,
                      '&:hover': {
                        color: colors.accent.cyan,
                        backgroundColor: alpha(colors.accent.cyan, 0.1),
                      }
                    }}
                  >
                    Clear Summary
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
              <TimerRounded sx={{ fontSize: 20, color: colors.accent.cyan }} />
              <Typography variant="body2" sx={{ color: colors.text.tertiary }}>
                Processing Time
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: colors.accent.cyan, fontWeight: 700 }}>
              2-5 seconds
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
              <AutoAwesomeRounded sx={{ fontSize: 20, color: colors.accent.emerald }} />
              <Typography variant="body2" sx={{ color: colors.text.tertiary }}>
                AI Model
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: colors.accent.emerald, fontWeight: 700 }}>
              GPT-4 Powered
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
              <ArticleRounded sx={{ fontSize: 20, color: colors.accent.purple }} />
              <Typography variant="body2" sx={{ color: colors.text.tertiary }}>
                Max Input
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: colors.accent.purple, fontWeight: 700 }}>
              10,000 characters
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
              <SummarizeRounded sx={{ fontSize: 20, color: colors.accent.amber }} />
              <Typography variant="body2" sx={{ color: colors.text.tertiary }}>
                Compression
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: colors.accent.amber, fontWeight: 700 }}>
              60-80% shorter
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Summary;