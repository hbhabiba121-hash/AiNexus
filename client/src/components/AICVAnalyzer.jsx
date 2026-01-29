import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Paper, CircularProgress, Alert, LinearProgress,
  Grid, Card, CardContent, Chip, Stack, IconButton, Tooltip,
  Tabs, Tab, Fade, Zoom, Grow, Slide, Collapse,
  useTheme, useMediaQuery
} from '@mui/material';
import {
  Upload, Description, Image, CheckCircle, Warning, Download, Refresh,
  Email, Phone, LinkedIn, GitHub, School, Work, Code, Assignment,
  Star, TrendingUp, Lightbulb, Speed, Analytics, Equalizer,
  Info, Close, KeyboardArrowRight, KeyboardArrowLeft,
  Dashboard, ViewSidebar, ViewModule, GridView
} from '@mui/icons-material';

const AICVAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [aiStatus, setAiStatus] = useState({ status: "Checking..." });
  const [activeTab, setActiveTab] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? '/api/v1/cv-analyzer/health'
        : 'http://localhost:5000/api/v1/cv-analyzer/health';
      
      const { data } = await axios.get(apiUrl, { timeout: 5000 });
      setAiStatus(data);
    } catch (err) {
      setAiStatus({
        status: "⚠️ Connection issue",
        fallback: "Rule-based analysis available",
        error: "Cannot reach AI service"
      });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload PDF, image, or text file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File too large (max 10MB)');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
      setProgress('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setProgress('Preparing analysis...');

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? '/api/v1/cv-analyzer/analyze'
        : 'http://localhost:5000/api/v1/cv-analyzer/analyze';

      const { data } = await axios.post(apiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(`Uploading: ${percent}%`);
          }
        }
      });

      if (data.success) {
        setResult(data);
        setProgress('Analysis complete!');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }

    } catch (err) {
      console.error('Analysis error:', err);
      let errorMessage = 'Analysis failed';
      if (err.response?.data) {
        errorMessage = err.response.data.error || err.response.data.details || JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  // 3D Score Ring Component
  const render3DScoreRing = (score, size = 180) => {
    const getColor = (score) => {
      if (score >= 90) return '#10B981';
      if (score >= 80) return '#3B82F6';
      if (score >= 70) return '#F59E0B';
      if (score >= 60) return '#EF4444';
      return '#6B7280';
    };

    const color = getColor(score);
    
    return (
      <Box sx={{ 
        position: 'relative', 
        width: size, 
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: size * 1.15,
          height: size * 1.15,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          filter: 'blur(10px)',
          opacity: 0.6,
          zIndex: 0
        }
      }}>
        {/* Outer glow */}
        <Box sx={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(${color} ${score * 3.6}deg, ${color}20 ${score * 3.6}deg)`,
          boxShadow: `0 0 30px ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: size - 20,
            height: size - 20,
            borderRadius: '50%',
            backgroundColor: '#1F2937',
            zIndex: 1
          }
        }}>
          <Box sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center'
          }}>
            <Typography variant="h2" fontWeight="bold" sx={{ 
              color: color,
              textShadow: `0 0 20px ${color}80`,
              fontSize: size * 0.3
            }}>
              {score}
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#9CA3AF',
              fontSize: size * 0.08
            }}>
              /100
            </Typography>
            <Typography variant="caption" sx={{ 
              color: color,
              fontWeight: 'bold',
              fontSize: size * 0.07,
              display: 'block',
              mt: 1
            }}>
              {score >= 90 ? 'A+ (Excellent)' :
               score >= 80 ? 'A (Very Good)' :
               score >= 70 ? 'B+ (Good)' :
               score >= 60 ? 'B (Average)' : 'Needs Work'}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Floating Card Component
  const FloatingCard = ({ children, elevation = 3, sx = {} }) => (
    <Card
      sx={{
        background: 'linear-gradient(145deg, #2D3748, #1F2937)',
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: `
          0 10px 30px rgba(0,0,0,0.3),
          0 1px 3px rgba(0,0,0,0.5),
          inset 0 1px 0 rgba(255,255,255,0.1)
        `,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `
            0 20px 40px rgba(0,0,0,0.4),
            0 1px 3px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.15)
          `
        },
        ...sx
      }}
    >
      {children}
    </Card>
  );

  // Section Status Indicator
  const SectionIndicator = ({ label, present, score }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      p: 1.5,
      mb: 1,
      borderRadius: 2,
      background: present ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      border: `1px solid ${present ? '#10B98140' : '#EF444440'}`,
      transition: 'all 0.2s',
      '&:hover': {
        transform: 'translateX(5px)',
        background: present ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'
      }
    }}>
      <Typography variant="body2" sx={{ color: present ? '#10B981' : '#EF4444' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
          {score}/10
        </Typography>
        {present ? (
          <CheckCircle sx={{ fontSize: 16, color: '#10B981' }} />
        ) : (
          <Warning sx={{ fontSize: 16, color: '#EF4444' }} />
        )}
      </Box>
    </Box>
  );

  // Skill Bubble Component
  const SkillBubble = ({ skill, type = 'tech' }) => {
    const colors = {
      tech: { bg: '#3B82F6', text: '#DBEAFE' },
      tool: { bg: '#8B5CF6', text: '#EDE9FE' },
      soft: { bg: '#10B981', text: '#D1FAE5' },
      missing: { bg: '#EF4444', text: '#FEE2E2' }
    };
    
    const color = colors[type] || colors.tech;
    
    return (
      <Box
        sx={{
          display: 'inline-block',
          px: 2,
          py: 1,
          borderRadius: 20,
          backgroundColor: color.bg,
          color: color.text,
          fontSize: '0.75rem',
          fontWeight: 500,
          margin: 0.5,
          transform: 'scale(1)',
          transition: 'all 0.2s',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: `0 0 15px ${color.bg}80`
          }
        }}
      >
        {skill}
      </Box>
    );
  };

  // Tabs Content
  const tabs = [
    { label: 'Overview', icon: <Dashboard /> },
    { label: 'Skills', icon: <Code /> },
    { label: 'Sections', icon: <Assignment /> },
    { label: 'Feedback', icon: <Analytics /> }
  ];

  const renderTabContent = () => {
    if (!result) return null;

    switch (activeTab) {
      case 0: // Overview
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FloatingCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#E5E7EB' }}>
                    <Lightbulb sx={{ verticalAlign: 'middle', mr: 1, color: '#F59E0B' }} />
                    Executive Summary
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.7 }}>
                    {result.aiAnalysis.summary}
                  </Typography>
                </CardContent>
              </FloatingCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <FloatingCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#E5E7EB' }}>
                    <Equalizer sx={{ verticalAlign: 'middle', mr: 1, color: '#3B82F6' }} />
                    Key Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                          {result.basicMetrics.wordCount}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                          Words
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" sx={{ 
                          color: result.basicMetrics.hasEmail ? '#10B981' : '#EF4444', 
                          fontWeight: 'bold' 
                        }}>
                          {result.basicMetrics.hasEmail ? '✓' : '✗'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                          Email
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" sx={{ 
                          color: result.basicMetrics.hasPhone ? '#10B981' : '#EF4444', 
                          fontWeight: 'bold' 
                        }}>
                          {result.basicMetrics.hasPhone ? '✓' : '✗'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                          Phone
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" sx={{ color: '#F59E0B', fontWeight: 'bold' }}>
                          {result.aiAnalysis.suggestedJobTitles?.length || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                          Suggested Roles
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </FloatingCard>
            </Grid>
          </Grid>
        );

      case 1: // Skills
        return (
          <FloatingCard>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#E5E7EB' }}>
                <Code sx={{ verticalAlign: 'middle', mr: 1, color: '#10B981' }} />
                Skills Analysis
              </Typography>
              
              {/* Technical Skills */}
              {result.aiAnalysis.skillsAnalysis?.technical?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#3B82F6', mb: 2 }}>
                    Technical Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {result.aiAnalysis.skillsAnalysis.technical.slice(0, 20).map((skill, idx) => (
                      <SkillBubble key={idx} skill={skill} type="tech" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Missing Skills */}
              {result.aiAnalysis.skillsAnalysis?.missing?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#EF4444', mb: 2 }}>
                    Recommended Skills to Add
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {result.aiAnalysis.skillsAnalysis.missing.slice(0, 10).map((skill, idx) => (
                      <SkillBubble key={idx} skill={skill} type="missing" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </FloatingCard>
        );

      case 2: // Sections
        return (
          <FloatingCard>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#E5E7EB' }}>
                <Assignment sx={{ verticalAlign: 'middle', mr: 1, color: '#6366F1' }} />
                Sections Analysis
              </Typography>
              
              {result.aiAnalysis.sectionsAnalysis && Object.entries(result.aiAnalysis.sectionsAnalysis).map(([key, section]) => (
                <SectionIndicator 
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  present={section.present}
                  score={section.score}
                />
              ))}
            </CardContent>
          </FloatingCard>
        );

      case 3: // Feedback
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FloatingCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#E5E7EB' }}>
                    <TrendingUp sx={{ verticalAlign: 'middle', mr: 1, color: '#10B981' }} />
                    Strengths
                  </Typography>
                  <Stack spacing={1}>
                    {result.aiAnalysis.strengths?.slice(0, 5).map((strength, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <CheckCircle sx={{ color: '#10B981', mt: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                          {strength}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </FloatingCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <FloatingCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#E5E7EB' }}>
                    <Warning sx={{ verticalAlign: 'middle', mr: 1, color: '#EF4444' }} />
                    Improvements
                  </Typography>
                  <Stack spacing={1}>
                    {result.aiAnalysis.weaknesses?.slice(0, 5).map((weakness, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Warning sx={{ color: '#EF4444', mt: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                          {weakness}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </FloatingCard>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  // Download report
  const downloadReport = () => {
    if (!result) return;
    
    const report = {
      cvAnalysisReport: {
        fileName: result.fileName,
        analyzedAt: result.generatedAt,
        overallScore: result.aiAnalysis.overallScore,
        grade: result.aiAnalysis.grade,
        analysisType: result.analysisType,
        modelUsed: result.aiAnalysis.metadata?.model || 'Unknown'
      },
      analysis: result.aiAnalysis,
      basicMetrics: result.basicMetrics,
      recommendations: result.aiAnalysis.recommendations
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = `CV_Analysis_${result.fileName.replace(/\.[^/.]+$/, "")}_${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#111827',
      overflow: 'hidden'
    }}>
      {/* Top Bar */}
      <Box sx={{ 
        p: 2,
        background: 'linear-gradient(90deg, #1F2937 0%, #111827 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ 
            color: '#E5E7EB',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🤖 AI CV Analyzer
          </Typography>
          <Chip 
            label={aiStatus.status?.includes('✅') ? 'AI Ready' : 'Fallback Mode'}
            color={aiStatus.status?.includes('✅') ? 'success' : 'warning'}
            size="small"
            icon={<Refresh fontSize="small" />}
            onClick={checkAIStatus}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Toggle Sidebar">
            <IconButton 
              onClick={() => setShowSidebar(!showSidebar)}
              sx={{ color: '#9CA3AF' }}
            >
              {showSidebar ? <KeyboardArrowLeft /> : <ViewSidebar />}
            </IconButton>
          </Tooltip>
          
          {result && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={downloadReport}
              sx={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Export
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Content - Split Screen */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        p: 2,
        gap: 2
      }}>
        {/* Left Side - Upload & Analysis */}
        <Collapse 
          in={!result || showSidebar} 
          orientation="horizontal"
          collapsedSize={0}
          sx={{ 
            flexShrink: 0,
            width: result && showSidebar ? '300px' : 'auto'
          }}
        >
          <Box sx={{ 
            height: '100%',
            width: result ? 300 : '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {/* Upload Card */}
            <FloatingCard>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  margin: '0 auto 20px',
                  boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
                }}>
                  <Upload sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ color: '#E5E7EB' }}>
                  Upload Your CV
                </Typography>
                
                <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
                  Drop or select your CV file
                </Typography>
                
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.txt"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="cv-upload-input"
                />
                <label htmlFor="cv-upload-input">
                  <Button 
                    component="span"
                    variant="contained"
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      mb: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      py: 1.5
                    }}
                  >
                    Browse Files
                  </Button>
                </label>
                
                {file && (
                  <Paper sx={{ 
                    p: 1.5, 
                    mt: 2, 
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {file.type === 'application/pdf' ? 
                        <Description sx={{ color: '#3B82F6' }} /> : 
                        <Image sx={{ color: '#3B82F6' }} />
                      }
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="caption" sx={{ color: '#E5E7EB', display: 'block' }}>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}
                
                <Button
                  variant="contained"
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  fullWidth
                  sx={{
                    mt: 3,
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    borderRadius: 2,
                    textTransform: 'none',
                    py: 1.5,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    <>
                      <Speed sx={{ mr: 1 }} />
                      Analyze CV
                    </>
                  )}
                </Button>
              </CardContent>
            </FloatingCard>

            {/* Progress */}
            {loading && progress && (
              <FloatingCard>
                <CardContent>
                  <Typography variant="body2" sx={{ color: '#E5E7EB', mb: 1 }}>
                    {progress}
                  </Typography>
                  <LinearProgress 
                    sx={{ 
                      borderRadius: 1,
                      height: 8,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #10B981, #3B82F6)',
                        borderRadius: 1
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 1, display: 'block' }}>
                    AI analysis in progress...
                  </Typography>
                </CardContent>
              </FloatingCard>
            )}

            {/* Error */}
            {error && (
              <FloatingCard>
                <CardContent sx={{ color: '#EF4444' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning />
                    <Typography variant="body2">{error}</Typography>
                  </Box>
                </CardContent>
              </FloatingCard>
            )}
          </Box>
        </Collapse>

        {/* Right Side - Results Dashboard */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {result ? (
            <>
              {/* Results Header */}
              <Box sx={{ 
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 'bold' }}>
                    CV Analysis Dashboard
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    {result.fileName} • {new Date(result.generatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={result.analysisType === 'ai-powered' ? 'AI-Powered' : 'Rule-Based'}
                    color={result.analysisType === 'ai-powered' ? 'success' : 'warning'}
                    size="small"
                  />
                  <Chip 
                    label={`Model: ${result.aiAnalysis.metadata?.model || 'Local'}`}
                    variant="outlined"
                    size="small"
                    sx={{ color: '#9CA3AF', borderColor: '#4B5563' }}
                  />
                </Box>
              </Box>

              {/* Main Score Display */}
              <Box sx={{ 
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {render3DScoreRing(result.aiAnalysis.overallScore, isMobile ? 140 : 180)}
              </Box>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 3 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      color: '#9CA3AF',
                      textTransform: 'none',
                      minHeight: 48
                    },
                    '& .Mui-selected': {
                      color: '#3B82F6'
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#3B82F6'
                    }
                  }}
                >
                  {tabs.map((tab, index) => (
                    <Tab 
                      key={index}
                      icon={tab.icon}
                      iconPosition="start"
                      label={tab.label}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                pr: 1,
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
              }}>
                <Grow in={true} timeout={500}>
                  <Box>
                    {renderTabContent()}
                    
                    {/* ATS Optimization */}
                    {result.aiAnalysis.atsOptimization && (
                      <FloatingCard sx={{ mt: 3 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ color: '#E5E7EB' }}>
                            <Analytics sx={{ verticalAlign: 'middle', mr: 1, color: '#8B5CF6' }} />
                            ATS Optimization
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ position: 'relative' }}>
                              <CircularProgress 
                                variant="determinate" 
                                value={result.aiAnalysis.atsOptimization.score || 0} 
                                size={80}
                                thickness={4}
                                sx={{ 
                                  color: '#8B5CF6',
                                  filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))'
                                }}
                              />
                              <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#E5E7EB' }}>
                                  {result.aiAnalysis.atsOptimization.score || 0}%
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 1 }}>
                                {result.aiAnalysis.atsOptimization.feedback}
                              </Typography>
                              {result.aiAnalysis.atsOptimization.recommendedKeywords && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                  {result.aiAnalysis.atsOptimization.recommendedKeywords.slice(0, 6).map((kw, idx) => (
                                    <Chip 
                                      key={idx} 
                                      label={kw} 
                                      size="small"
                                      sx={{ 
                                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                        color: '#C4B5FD',
                                        border: '1px solid rgba(139, 92, 246, 0.3)'
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </FloatingCard>
                    )}
                  </Box>
                </Grow>
              </Box>
            </>
          ) : (
            // Empty State
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280'
            }}>
              <Description sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
              <Typography variant="h5" gutterBottom sx={{ color: '#9CA3AF' }}>
                No CV Analyzed Yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', maxWidth: 400, textAlign: 'center' }}>
                Upload your CV to get AI-powered analysis with detailed feedback and improvement recommendations.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AICVAnalyzer;