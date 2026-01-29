import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast"; // Add this line
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
  CardContent,
  Paper,
  CircularProgress,
  IconButton,
  Divider,
  Chip,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel
} from "@mui/material";
import {
  ContentCopy,
  Download,
  Refresh,
  Article,
  Title,
  FormatQuote,
  List,
  TrendingUp,
  AutoFixHigh
} from "@mui/icons-material";

const ArticleWriter = () => {
  const theme = useTheme();
  const isNotMobile = useMediaQuery("(min-width: 1000px)");
  
  // states
  const [topic, setTopic] = useState("");
  const [article, setArticle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [articleType, setArticleType] = useState("blog");
  const [tone, setTone] = useState("professional");
  const [wordCount, setWordCount] = useState(500);
  const [includeSEO, setIncludeSEO] = useState(true);
  const [includeSections, setIncludeSections] = useState(true);
  
  const loggedIn = JSON.parse(localStorage.getItem("authToken"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a topic for the article");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const { data } = await axios.post("http://localhost:5000/api/v1/openai/article-writer", {
        topic,
        articleType,
        tone,
        wordCount,
        includeSEO,
        includeSections
      });
      
      setArticle(data.article || data);
      toast.success("Article generated successfully!");
    } catch (err) {
      console.log(err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to generate article. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(article);
    toast.success("Article copied to clipboard!");
  };

  const downloadArticle = () => {
    const element = document.createElement("a");
    const file = new Blob([article], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `article-${topic.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Article downloaded!");
  };

  const resetForm = () => {
    setTopic("");
    setArticle("");
    setError("");
    setArticleType("blog");
    setTone("professional");
    setWordCount(500);
    setIncludeSEO(true);
    setIncludeSections(true);
  };

  const toneOptions = [
    { value: "professional", label: "Professional", color: "#3B82F6" },
    { value: "casual", label: "Casual", color: "#10B981" },
    { value: "academic", label: "Academic", color: "#8B5CF6" },
    { value: "persuasive", label: "Persuasive", color: "#F59E0B" },
    { value: "storytelling", label: "Storytelling", color: "#EC4899" }
  ];

  const articleTypes = [
    { value: "blog", label: "Blog Post" },
    { value: "news", label: "News Article" },
    { value: "tutorial", label: "Tutorial/Guide" },
    { value: "opinion", label: "Opinion Piece" },
    { value: "product", label: "Product Review" },
    { value: "academic", label: "Academic Paper" },
    { value: "marketing", label: "Marketing Copy" }
  ];

  if (!loggedIn) {
    return (
      <Box sx={{ 
        minHeight: "80vh", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center",
        p: 3
      }}>
        <Typography variant="h3" gutterBottom align="center" sx={{ color: theme.palette.text.primary }}>
          Welcome to Article Writer
        </Typography>
        <Typography variant="h6" align="center" sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 600 }}>
          Create professional, SEO-optimized articles with AI assistance
        </Typography>
        <Card sx={{ p: 4, borderRadius: 3, maxWidth: 500 }}>
          <Typography variant="h5" gutterBottom align="center">
            Please <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
              Log In
            </Link> to Continue
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 2, color: theme.palette.text.secondary }}>
            Or <Link to="/register" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
              create an account
            </Link> to get started
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 },
      maxWidth: 1400,
      margin: "0 auto",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ 
          fontWeight: "bold",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: isNotMobile ? "left" : "center"
        }}>
          <Article sx={{ verticalAlign: "middle", mr: 2, fontSize: "2.5rem" }} />
          AI Article Writer
        </Typography>
        <Typography variant="h6" sx={{ 
          color: theme.palette.text.secondary,
          textAlign: isNotMobile ? "left" : "center"
        }}>
          Generate professional, SEO-optimized articles in seconds
        </Typography>
      </Box>

      {/* Error Alert */}
      <Collapse in={error !== ''}>
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      </Collapse>

      <Grid container spacing={4}>
        {/* Left Column - Input Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3,
            height: "100%",
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.text.primary }}>
              Article Settings
            </Typography>
            
            <form onSubmit={handleSubmit}>
              {/* Topic Input */}
              <TextField
                placeholder="Enter your article topic or title..."
                type="text"
                multiline
                rows={2}
                required
                fullWidth
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
                InputProps={{
                  startAdornment: <Title sx={{ mr: 1, color: theme.palette.primary.main }} />
                }}
              />

              {/* Article Type */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Article Type</InputLabel>
                <Select
                  value={articleType}
                  label="Article Type"
                  onChange={(e) => setArticleType(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {articleTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Tone Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ color: theme.palette.text.secondary }}>
                  Select Tone:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  {toneOptions.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      onClick={() => setTone(option.value)}
                      sx={{
                        backgroundColor: tone === option.value ? option.color : `${option.color}20`,
                        color: tone === option.value ? "white" : option.color,
                        border: `1px solid ${option.color}40`,
                        '&:hover': {
                          backgroundColor: `${option.color}30`
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Word Count Slider */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ color: theme.palette.text.secondary }}>
                  Target Word Count: {wordCount} words
                </Typography>
                <Slider
                  value={wordCount}
                  onChange={(e, newValue) => setWordCount(newValue)}
                  min={200}
                  max={2000}
                  step={100}
                  marks={[
                    { value: 200, label: '200' },
                    { value: 1000, label: '1000' },
                    { value: 2000, label: '2000' }
                  ]}
                  sx={{
                    color: theme.palette.primary.main,
                    '& .MuiSlider-markLabel': {
                      color: theme.palette.text.secondary
                    }
                  }}
                />
              </Box>

              {/* Options */}
              <Box sx={{ mb: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={includeSEO}
                      onChange={(e) => setIncludeSEO(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TrendingUp sx={{ mr: 1, fontSize: 20 }} />
                      Include SEO Optimization
                    </Box>
                  }
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={includeSections}
                      onChange={(e) => setIncludeSections(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <List sx={{ mr: 1, fontSize: 20 }} />
                      Include Sections & Subheadings
                    </Box>
                  }
                />
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    '&:hover': {
                      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 10px 25px rgba(102, 126, 234, 0.3)"
                    },
                    '&.Mui-disabled': {
                      background: theme.palette.action.disabled
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ color: "white", mr: 1 }} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <AutoFixHigh sx={{ mr: 1 }} />
                      Generate Article
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={resetForm}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2
                    }
                  }}
                >
                  <Refresh sx={{ mr: 1 }} />
                  Reset
                </Button>
              </Stack>

              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: "center" }}>
                Need inspiration? Try topics like "Benefits of Remote Work" or "Future of AI in Healthcare"
              </Typography>
            </form>
          </Card>
        </Grid>

        {/* Right Column - Results */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              mb: 3 
            }}>
              <Typography variant="h5" sx={{ color: theme.palette.text.primary }}>
                Generated Article
              </Typography>
              
              {article && (
                <Stack direction="row" spacing={1}>
                  <IconButton
                    onClick={copyToClipboard}
                    sx={{
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      '&:hover': {
                        backgroundColor: "rgba(59, 130, 246, 0.2)"
                      }
                    }}
                  >
                    <ContentCopy sx={{ color: theme.palette.primary.main }} />
                  </IconButton>
                  
                  <IconButton
                    onClick={downloadArticle}
                    sx={{
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      '&:hover': {
                        backgroundColor: "rgba(16, 185, 129, 0.2)"
                      }
                    }}
                  >
                    <Download sx={{ color: "#10B981" }} />
                  </IconButton>
                </Stack>
              )}
            </Box>

            {article ? (
              <Paper
                sx={{
                  p: 3,
                  flex: 1,
                  overflow: "auto",
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.default,
                  border: "1px solid rgba(255,255,255,0.1)",
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '4px'
                  }
                }}
              >
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "'Merriweather', serif",
                    lineHeight: 1.8,
                    color: theme.palette.text.primary,
                    '& h1, & h2, & h3': {
                      color: theme.palette.primary.main,
                      marginTop: 2,
                      marginBottom: 1
                    },
                    '& p': {
                      marginBottom: 1.5
                    },
                    '& ul, & ol': {
                      paddingLeft: 3,
                      marginBottom: 1.5
                    },
                    '& blockquote': {
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      paddingLeft: 2,
                      marginLeft: 0,
                      fontStyle: "italic",
                      color: theme.palette.text.secondary
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: article }}
                />
              </Paper>
            ) : (
              <Paper
                sx={{
                  p: 3,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.default,
                  border: "2px dashed rgba(255,255,255,0.1)",
                  textAlign: "center"
                }}
              >
                <FormatQuote sx={{ 
                  fontSize: 60, 
                  color: theme.palette.text.disabled,
                  mb: 2 
                }} />
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Your Article Will Appear Here
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                  Enter a topic and click "Generate Article" to create your content
                </Typography>
              </Paper>
            )}

            {/* Article Stats */}
            {article && (
              <>
                <Divider sx={{ my: 3 }} />
                <Stack 
                  direction="row" 
                  spacing={2} 
                  sx={{ 
                    justifyContent: "space-between",
                    flexWrap: "wrap"
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Word Count
                    </Typography>
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                      {article.split(/\s+/).length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Reading Time
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#10B981" }}>
                      {Math.ceil(article.split(/\s+/).length / 200)} min
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Type
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#8B5CF6" }}>
                      {articleTypes.find(t => t.value === articleType)?.label || "Blog"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Tone
                    </Typography>
                    <Typography variant="h6" sx={{ color: toneOptions.find(t => t.value === tone)?.color || "#F59E0B" }}>
                      {toneOptions.find(t => t.value === tone)?.label || "Professional"}
                    </Typography>
                  </Box>
                </Stack>
              </>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Features Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ color: theme.palette.text.primary, mb: 3 }}>
          Why Use AI Article Writer?
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              title: "SEO Optimized",
              description: "Articles are optimized for search engines with proper keywords and structure",
              icon: "🔍"
            },
            {
              title: "Time Saving",
              description: "Generate complete articles in seconds instead of hours",
              icon: "⏱️"
            },
            {
              title: "Quality Content",
              description: "Well-researched and structured articles with proper formatting",
              icon: "✨"
            },
            {
              title: "Multiple Formats",
              description: "Create blogs, news articles, tutorials, reviews, and more",
              icon: "📝"
            }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                p: 2, 
                height: "100%",
                borderRadius: 3,
                textAlign: "center",
                transition: "all 0.3s ease",
                '&:hover': {
                  transform: "translateY(-4px)",
                  boxShadow: `0 10px 30px ${theme.palette.primary.main}20`
                }
              }}>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ArticleWriter;