import React, { useEffect, useRef } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  Grid, 
  Container,
  useTheme,
  alpha,
  Button,
  Paper,
  keyframes,
  useMediaQuery,
  Chip,
  Fade
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  DescriptionRounded,
  FormatAlignLeftOutlined,
  ChatRounded,
  CodeRounded,
  ImageRounded,
  AutoAwesomeRounded,
  SearchRounded,
  ArrowForwardRounded,
  CheckCircleRounded,
  RocketLaunchRounded,
  TrendingUpRounded,
  AccessTimeRounded,
  StarRounded,
  SchoolRounded,
  PeopleRounded,
  BoltRounded,
  PlayCircleRounded,
  GridViewRounded,
  ArticleRounded,
  PsychologyRounded,
  CodeOffRounded,
  SummarizeRounded
} from "@mui/icons-material";

// SIMPLIFIED color palette - Better contrast
const colors = {
  primary: {
    main: '#4F46E5',
    light: '#6366F1',
    dark: '#4338CA',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
  },
  secondary: {
    main: '#7C3AED',
    light: '#8B5CF6',
    dark: '#6D28D9',
  },
  accent: {
    cyan: '#0891B2',
    emerald: '#059669',
    amber: '#D97706',
    rose: '#DB2777',
  },
  background: {
    dark: '#0F172A',
    darker: '#020617',
    card: 'rgba(30, 41, 59, 0.95)', // Much higher opacity
    glass: 'rgba(15, 23, 42, 0.95)',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#E2E8F0',
    tertiary: '#CBD5E1',
    muted: '#94A3B8',
  }
};

// Simple animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Homepage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const cardsRef = useRef([]);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            entry.target.style.animation = `${slideIn} 0.6s ease forwards ${index * 0.1}s`;
          }
        });
      },
      { threshold: 0.1 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);
const scrollToTools = () => {
  const toolsSection = document.getElementById('tools-section');
  if (toolsSection) {
    toolsSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};
  // SIMPLIFIED tools with clear features
  const tools = [
       {
      title: "AI Chat Assistant",
      description: "Have natural conversations with an intelligent AI assistant.",
      icon: <ChatRounded />,
      path: "/chatbot",
      color: colors.primary.main,
      features: ["Context aware", "Multi-language", "Real-time"]
    },
    {
      title: "Text Summarizer",
      description: "Condense long articles and documents into clear, concise summaries.",
      icon: <SummarizeRounded />,
      path: "/summary",
      color: colors.accent.cyan,
      features: ["Extract key points", "Adjustable length", "Multiple formats"]
    },
    {
      title: "Paragraph Generator",
      description: "Create well-structured paragraphs from simple prompts and ideas.",
      icon: <FormatAlignLeftOutlined />,
      path: "/paragraph",
      color: colors.accent.emerald,
      features: ["SEO optimization", "Tone control", "Creative options"]
    },

    {
      title: "Code Converter",
      description: "Convert code between languages and optimize for production.",
      icon: <CodeOffRounded />,
      path: "/js-converter",
      color: colors.accent.amber,
      features: ["Multiple languages", "Syntax check", "Best practices"]
    },
      {
  title: "CV Analyzer",
    description: "Get AI-powered resume feedback with ATS scoring and optimization tips.",
  icon: <DescriptionRounded />,
  path: "/cv-analyzer",
  badge: "Most Popular",
  color: "#f63b4b", // Or use your theme color
  features: [
    "AI-powered analysis",
    "ATS compatibility score", 
    "Keyword optimization",
    "Improvement suggestions",
    "Formatting check"
  ]
},
    {
      title: "Article Writer",
      description: "Generate complete articles with proper structure and research.",
      icon: <ArticleRounded />,
      path: "/scifi-image",
      color: colors.secondary.main,
      features: ["SEO friendly", "Research based", "Various formats"]
    }
 
  ];

  const stats = [
    { value: "120K+", label: "Active Users", icon: <PeopleRounded />, color: colors.primary.main },
    { value: "99.9%", label: "Uptime", icon: <TrendingUpRounded />, color: colors.accent.emerald },
    { value: "4.8/5", label: "Rating", icon: <StarRounded />, color: colors.accent.amber },
    { value: "24/7", label: "Support", icon: <AccessTimeRounded />, color: colors.secondary.main }
  ];

  return (
    <Box sx={{ 
      bgcolor: colors.background.dark,
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.background.darker} 0%, ${colors.background.dark} 100%)`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Main content */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box sx={{ 
          pt: { xs: 10, md: 14 },
          pb: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative'
        }}>
          <Fade in={mounted} timeout={800}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Chip
                icon={<BoltRounded />}
                label="AI Content Tools"
                sx={{
                  mb: 3,
                  px: 2,
                  py: 1,
                  background: alpha(colors.primary.main, 0.2),
                  color: colors.primary.light,
                  fontWeight: 700,
                  border: `1px solid ${alpha(colors.primary.main, 0.3)}`,
                }}
              />
              
              <Typography 
                variant="h2" 
                fontWeight="900"
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  color: colors.text.primary,
                  letterSpacing: '-0.02em',
                }}
              > Boost Your Digital Workflow
                <Box component="span" sx={{ 
                  display: 'block',
                  color: colors.primary.light,
                }}>
                   With AI-Powered Content Solutions
                </Box>
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  maxWidth: 800, 
                  mx: 'auto', 
                  mb: 6,
                  color: colors.text.secondary,
                  fontWeight: 400,
                  lineHeight: 1.7,
                }}
              >
                From resumes to code - smarter tools for better results
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: 'center',
                mb: 8,
                flexWrap: 'wrap',
              }}>
          
                <Button
  variant="outlined"
  size="large"
  startIcon={<PlayCircleRounded />}
  onClick={scrollToTools}  // Add this line
  sx={{
     px: 5,
                    py: 2,
                    borderRadius: 2,
                  
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    textTransform: 'none',
    textTransform: 'none',
    '&:hover': {
      background: colors.primary.dark,
    }
  }}
>
     Try For Free
</Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayCircleRounded />}
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 2,
                    border: `2px solid ${colors.primary.main}`,
                    color: colors.primary.light,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: colors.primary.light,
                    }
                  }}
                >
                  View Demo
                </Button>
              </Box>
            </Box>
          </Fade>

          {/* Stats Bar */}
          <Fade in={mounted} timeout={1000}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                background: colors.background.glass,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
                maxWidth: 1000,
                mx: 'auto',
              }}
            >
              <Grid container spacing={3} justifyContent="center">
                {stats.map((stat, idx) => (
                  <Grid item xs={6} sm={3} key={idx}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 1.5,
                        mb: 1 
                      }}>
                        <Box sx={{ 
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          background: alpha(stat.color, 0.2),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: stat.color,
                        }}>
                          {stat.icon}
                        </Box>
                        <Typography variant="h3" fontWeight="900" sx={{ color: colors.text.primary }}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Fade>
        </Box>

        {/* Tools Section - SIMPLIFIED for better visibility */}
    <Box 
  id="tools-section"  // <-- ADD THIS LINE
  sx={{ mb: { xs: 10, md: 14 }, position: 'relative' }}
>
  <Box sx={{ textAlign: 'center', mb: 6, position: 'relative', zIndex: 1 }}>
            <Chip
              icon={<GridViewRounded />}
              label="OUR AI TOOLS"
              sx={{
                mb: 3,
                background: alpha(colors.primary.main, 0.2),
                color: colors.primary.light,
                fontWeight: 700,
                border: `1px solid ${alpha(colors.primary.main, 0.3)}`,
              }}
            />
            
            <Typography 
              variant="h2" 
              fontWeight="900"
              sx={{ 
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                color: colors.text.primary,
                letterSpacing: '-0.02em'
              }}
            >
              Powerful AI Tools
            </Typography>
            <Typography variant="h6" sx={{ 
              color: colors.text.secondary, 
              maxWidth: 700, 
              mx: 'auto',
              lineHeight: 1.7,
            }}>
              Choose from our suite of AI-powered tools designed to enhance your productivity.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {tools.map((tool, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  ref={el => cardsRef.current[index] = el}
                  onClick={() => navigate(tool.path)}
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 4,
                    borderRadius: 3,
                    background: colors.background.card,
                    border: `2px solid ${alpha(tool.color, 0.3)}`,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: 0,
                    animation: `${slideIn} 0.6s ease forwards ${index * 0.1}s`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: alpha(tool.color, 0.6),
                      boxShadow: `0 20px 40px ${alpha(tool.color, 0.2)}`,
                    }
                  }}
                >
                  {/* Tool header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(tool.color, 0.2)} 0%, ${alpha(tool.color, 0.4)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tool.color,
                      }}
                    >
                      {React.cloneElement(tool.icon, { sx: { fontSize: 30 } })}
                    </Box>
                    
                    <Box>
                      <Typography variant="h5" fontWeight="800" sx={{ 
                        color: colors.text.primary,
                        fontSize: '1.5rem',
                      }}>
                        {tool.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: colors.text.secondary,
                      }}>
                        {tool.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Features Section - MADE CLEARLY VISIBLE */}
                  <Box sx={{ mt: 3, mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ 
                      mb: 2, 
                      color: colors.text.primary,
                      fontWeight: 700,
                      fontSize: '1rem'
                    }}>
                      Features:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {tool.features.map((feature, idx) => (
                        <Box key={idx} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 1,
                          background: alpha(colors.background.darker, 0.5),
                          border: `1px solid ${alpha(tool.color, 0.2)}`,
                        }}>
                          <CheckCircleRounded sx={{ 
                            fontSize: 20, 
                            color: tool.color,
                          }} />
                          <Typography variant="body2" sx={{ 
                            color: colors.text.secondary,
                            fontSize: '0.95rem',
                          }}>
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Action button */}
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardRounded />}
                    sx={{
                      py: 1.5,
                      borderRadius: 1,
                      background: alpha(tool.color, 0.2),
                      color: tool.color,
                      fontWeight: 700,
                      fontSize: '1rem',
                      border: `1px solid ${alpha(tool.color, 0.3)}`,
                      textTransform: 'none',
                      '&:hover': {
                        background: alpha(tool.color, 0.3),
                      }
                    }}
                  >
                    Start Using
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ mb: { xs: 10, md: 14 }, textAlign: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.1)} 0%, ${alpha(colors.secondary.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
            }}
          >
            <Chip
              icon={<BoltRounded />}
              label="GET STARTED"
              sx={{
                mb: 4,
                background: alpha(colors.primary.main, 0.2),
                color: colors.primary.light,
                fontWeight: 700,
                border: `1px solid ${alpha(colors.primary.main, 0.3)}`,
              }}
            />
            
            <Typography 
              variant="h2" 
              fontWeight="900"
              sx={{ 
                mb: 3,
                fontSize: { xs: '2rem', md: '3rem' },
                color: colors.text.primary,
              }}
            >
              Ready to Boost Your Productivity?
            </Typography>
            
            <Typography variant="h6" sx={{ 
              mb: 6, 
              color: colors.text.secondary, 
              maxWidth: 600, 
              mx: 'auto',
              lineHeight: 1.7
            }}>
              Join thousands of users who are already transforming their workflow.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<RocketLaunchRounded />}
              onClick={() => navigate("/summarizer")}
              sx={{
                px: 6,
                py: 2,
                borderRadius: 2,
                background: colors.primary.gradient,
                fontSize: '1.125rem',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  background: colors.primary.dark,
                }
              }}
            >
              Start Free Trial
            </Button>
          </Paper>
        </Box>
      </Container>

      {/* Footer */}
      <Box 
        sx={{ 
          py: 4,
          borderTop: `1px solid ${alpha(colors.text.primary, 0.1)}`,
          background: colors.background.darker,
        }}
      >
        <Container maxWidth="xl">
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              color: colors.text.tertiary,
            }}
          >
            © {new Date().getFullYear()} AI Content Tools. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;