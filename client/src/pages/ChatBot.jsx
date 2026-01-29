import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  TextField,
  Button,
  Alert,
  Collapse,
  Card,
  Paper,
  IconButton,
  CircularProgress,
  alpha
} from "@mui/material";
import {
  SendRounded,
  ArrowBackRounded,
  SmartToyRounded,
  RefreshRounded,
  KeyboardArrowDownRounded
} from "@mui/icons-material";

// Enhanced color palette
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
  background: {
    dark: '#0F172A',
    card: 'rgba(30, 41, 59, 0.9)',
    light: '#1E293B',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#E2E8F0',
    tertiary: '#94A3B8',
  }
};

const ChatBot = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isNotMobile = useMediaQuery("(min-width: 1000px)");
  
  // states
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const loggedIn = JSON.parse(localStorage.getItem("authToken"));
  
  // Refs for scrolling
  const responseContainerRef = useRef(null);
  const scrollToBottomBtnRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll when response is updated
  useEffect(() => {
    if (response && !loading) {
      scrollToBottom();
    }
  }, [response, loading]);

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const container = responseContainerRef.current;
    if (container) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
        setShowScrollButton(!isAtBottom);
      };

      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTo({
        top: responseContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter a message");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const { data } = await axios.post("http://localhost:5000/api/v1/openai/chatbot", { text });
      setResponse(data);
      toast.success("Response received!");
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
    setResponse("");
    setError("");
  };

  const handleExample = () => {
    setText("Explain quantum computing in simple terms");
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
          <SmartToyRounded sx={{ fontSize: 80, color: colors.primary.light, mb: 3 }} />
          <Typography variant="h3" fontWeight="700" sx={{ mb: 3, color: colors.text.primary }}>
            AI ChatBot Access Required
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: colors.text.secondary, lineHeight: 1.6 }}>
            Please log in to access our intelligent AI ChatBot assistant. 
            Have natural conversations and get instant responses powered by advanced AI.
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
        p: { xs: 2, md: 4 },
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
          maxWidth: isNotMobile ? "900px" : "100%",
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
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
                background: colors.primary.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: `0 10px 30px ${alpha(colors.primary.main, 0.3)}`,
              }}
            >
              <SmartToyRounded sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h2" fontWeight="900" sx={{ color: colors.text.primary }}>
              AI ChatBot
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: colors.text.secondary, maxWidth: 600, mx: 'auto' }}>
            Have intelligent conversations with our AI assistant. Ask questions, get explanations, 
            or brainstorm ideas with natural language responses.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Left Panel - Input */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 4,
              borderRadius: 4,
              background: colors.background.card,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Collapse in={!!error}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: alpha('#DC2626', 0.1),
                  color: '#FECACA',
                  border: '1px solid #DC2626',
                }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            </Collapse>

            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 3, color: colors.text.primary }}>
                Your Message
              </Typography>

              <TextField
                placeholder="Type your message here..."
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
                  '& .MuiOutlinedInput-root': {
                    color: colors.text.primary,
                    backgroundColor: alpha(colors.background.dark, 0.5),
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: alpha(colors.primary.main, 0.3),
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(colors.primary.main, 0.5),
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.primary.main,
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: colors.text.tertiary,
                    opacity: 0.7,
                  }
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SendRounded />}
                  disabled={loading || !text.trim()}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    borderRadius: 2,
                    background: colors.primary.gradient,
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'none',
                    minWidth: 150,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 10px 25px ${alpha(colors.primary.main, 0.3)}`,
                    },
                    '&:disabled': {
                      background: alpha(colors.text.tertiary, 0.2),
                      color: alpha(colors.text.tertiary, 0.5),
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Send Message"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleExample}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(colors.secondary.main, 0.3)}`,
                    color: colors.secondary.light,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: colors.secondary.main,
                      backgroundColor: alpha(colors.secondary.main, 0.1),
                    }
                  }}
                >
                  Try Example
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

              <Typography variant="body2" sx={{ mt: 3, color: colors.text.tertiary, textAlign: 'center' }}>
                Tip: Be specific with your questions for better responses
              </Typography>
            </form>
          </Paper>

          {/* Right Panel - Response */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                p: 4,
                borderRadius: 4,
                background: colors.background.card,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '500px',
              }}
            >
              <Typography variant="h5" fontWeight="700" sx={{ mb: 3, color: colors.text.primary }}>
                AI Response
              </Typography>

              <Card
                ref={responseContainerRef}
                sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: alpha(colors.background.dark, 0.5),
                  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  maxHeight: 'calc(500px - 100px)', // Adjust based on your layout
                }}
              >
                {loading ? (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress 
                        size={60} 
                        thickness={4}
                        sx={{ 
                          color: colors.primary.main,
                          mb: 3,
                        }} 
                      />
                      <Typography variant="h6" sx={{ color: colors.text.secondary }}>
                        AI is thinking...
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text.tertiary, mt: 1 }}>
                        This may take a few seconds
                      </Typography>
                    </Box>
                  </Box>
                ) : response ? (
                  <Typography 
                    sx={{ 
                      color: colors.text.secondary,
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      pb: 2, // Padding bottom for scroll button
                    }}
                  >
                    {response}
                  </Typography>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                      <SmartToyRounded sx={{ fontSize: 80, color: alpha(colors.text.tertiary, 0.3), mb: 3 }} />
                      <Typography variant="h6" sx={{ color: colors.text.secondary, mb: 2 }}>
                        AI Response Will Appear Here
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text.tertiary, lineHeight: 1.6 }}>
                        Send a message to start a conversation with our AI assistant. 
                        The response will appear in this area.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Scroll to bottom button */}
                {showScrollButton && response && !loading && (
                  <Box
                    ref={scrollToBottomBtnRef}
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      zIndex: 10,
                    }}
                  >
                    
                  </Box>
                )}
              </Card>

              {response && !loading && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="caption" sx={{ color: colors.text.tertiary, fontStyle: 'italic' }}>
                    ✨ Response auto-scrolled to bottom
                  </Typography>
                  <Button
                    startIcon={<RefreshRounded />}
                    onClick={() => setResponse("")}
                    sx={{
                      color: colors.text.tertiary,
                      '&:hover': {
                        color: colors.primary.light,
                        backgroundColor: alpha(colors.primary.main, 0.1),
                      }
                    }}
                  >
                    Clear Response
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Auto-scroll status indicator */}
            {response && !loading && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: alpha(colors.primary.main, 0.1),
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
                  zIndex: 1,
                  animation: 'fadeIn 0.5s ease',
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0, transform: 'translateX(-50%) translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: colors.primary.light, fontWeight: 600 }}>
                  ↓ Auto-scroll enabled
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Stats/Info */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.text.tertiary, mb: 0.5 }}>
              Response Time
            </Typography>
            <Typography variant="h6" sx={{ color: colors.primary.light, fontWeight: 700 }}>
              2-5 seconds
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.text.tertiary, mb: 0.5 }}>
              Model
            </Typography>
            <Typography variant="h6" sx={{ color: colors.primary.light, fontWeight: 700 }}>
              GPT-4 Powered
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.text.tertiary, mb: 0.5 }}>
              Language Support
            </Typography>
            <Typography variant="h6" sx={{ color: colors.primary.light, fontWeight: 700 }}>
              Multi-language
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.text.tertiary, mb: 0.5 }}>
              Auto-scroll
            </Typography>
            <Typography variant="h6" sx={{ color: colors.primary.light, fontWeight: 700 }}>
              Enabled
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBot;