import React, { useState } from "react";
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
  Container,
  Fade,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  HowToReg as RegisterIcon,
  CheckCircle,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isNotMobile = useMediaQuery("(min-width: 1000px)");
  
  // states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugData, setDebugData] = useState(null);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    if (!username || !email || !password) {
      setError("Please fill in all fields");
      return false;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setIsLoading(true);
    setError("");
    setServerError(false);
    setDebugData(null);

    // Validate form
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    // Try to register with backend
    try {
      const apiUrl = "https://chatgpt-clone-server-p2dj.onrender.com/api/v1/auth/register";
      console.log("Attempting registration to:", apiUrl);
      console.log("Data:", { username, email, password: "***" });

      const response = await axios.post(
        apiUrl,
        { username, email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 15000,
          withCredentials: false,
        }
      );

      console.log("Response received:", response);
      
      if (response.data) {
        toast.success(response.data.message || "Account created successfully!");
        navigate("/login");
      }
      
    } catch (err) {
      console.error("Registration error details:", {
        name: err.name,
        message: err.message,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config,
      });

      // Store debug data
      setDebugData({
        error: err,
        timestamp: new Date().toISOString(),
        endpoint: err.config?.url,
        method: err.config?.method,
      });

      // Check error type
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        setError("Unable to connect to server. The server might be offline or sleeping.");
        setServerError(true);
        toast.error("Server connection failed. Using local storage fallback.");
        
        // Fallback to localStorage for demo
        setTimeout(() => {
          handleLocalStorageFallback();
        }, 1000);
        
      } else if (err.response?.status === 500) {
        setError("Server encountered an internal error. This is a server-side issue.");
        setServerError(true);
        
        // Try to extract more info from HTML response
        if (err.response?.data && typeof err.response.data === 'string' && err.response.data.includes('html')) {
          toast.error("Server returned HTML error page. Check server logs.");
        }
        
      } else if (err.response?.status === 400) {
        const serverMessage = err.response?.data?.error || err.response?.data?.message;
        setError(serverMessage || "Invalid request. Please check your input.");
      } else if (err.response?.status === 409) {
        setError("An account with this email already exists.");
      } else if (err.response?.status === 422) {
        setError("Validation failed. Please check your input data.");
      } else if (err.response?.status === 404) {
        setError("Registration endpoint not found. Check the API URL.");
        setServerError(true);
      } else if (err.response?.status) {
        setError(`Server error: ${err.response.status} - ${err.response.statusText}`);
        setServerError(true);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }

      // Auto-clear error after 8 seconds
      setTimeout(() => {
        setError("");
        setServerError(false);
      }, 8000);

    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalStorageFallback = () => {
    // Store user data in localStorage for demo purposes
    const demoUser = {
      username,
      email,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      isDemo: true,
    };

    // Get existing users or create new array
    const existingUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    existingUsers.push(demoUser);
    localStorage.setItem('demoUsers', JSON.stringify(existingUsers));
    
    // Set auth token for demo
    localStorage.setItem("authToken", "demo-token-" + Date.now());
    localStorage.setItem("currentUser", JSON.stringify(demoUser));

    toast.success("Demo account created! (Local storage only - server is offline)");
    navigate("/");
  };

  const handleDemoRegister = () => {
    setUsername("demo_user_" + Math.floor(Math.random() * 1000));
    setEmail(`demo${Math.floor(Math.random() * 1000)}@example.com`);
    setPassword("DemoPassword123!");
    toast.info("Demo credentials filled. Click Register to continue.");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

  const testServerConnection = async () => {
    try {
      const testResponse = await axios.get(
        "https://chatgpt-clone-server-p2dj.onrender.com/",
        { timeout: 5000 }
      );
      return {
        status: testResponse.status,
        statusText: testResponse.statusText,
        online: true,
      };
    } catch (err) {
      return {
        status: err.response?.status,
        statusText: err.response?.statusText,
        online: false,
        error: err.message,
      };
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Fade in={true} timeout={500}>
          <Grid container spacing={4} alignItems="center">
            {/* Left side - Illustration/Info */}
            {isNotMobile && (
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: "rgba(18, 18, 30, 0.85)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 30px",
                      border: "2px solid rgba(102, 126, 234, 0.3)",
                    }}
                  >
                    <RegisterIcon sx={{ fontSize: 60, color: "#667eea" }} />
                  </Box>
                  <Typography 
                    variant="h4" 
                    fontWeight="700" 
                    gutterBottom
                    textAlign="center"
                    sx={{
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Join Our Community
                  </Typography>
                  
                  <Box sx={{ mt: 4 }}>
                    {[
                      "✨ Create your account instantly",
                      "🚀 Fast & secure registration", 
                      "🤖 Get AI-powered assistance",
                      "💬 Access community features"
                    ].map((item, index) => (
                      <Box key={index} display="flex" alignItems="center" mb={2}>
                        <CheckCircle sx={{ color: "#667eea", mr: 2, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: "#b0b7c3" }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Server Status */}
                  <Box mt={4} p={2} borderRadius={2} sx={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" sx={{ color: "#b0b7c3" }}>
                        Server Status
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => setShowDebugInfo(true)}
                        sx={{ color: "#667eea", fontSize: "0.75rem" }}
                      >
                        Debug Info
                      </Button>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: serverError ? "#f44336" : "#4caf50",
                          mr: 1,
                          animation: serverError ? "pulse 2s infinite" : "none",
                          "@keyframes pulse": {
                            "0%": { opacity: 1 },
                            "50%": { opacity: 0.5 },
                            "100%": { opacity: 1 },
                          }
                        }}
                      />
                      <Typography variant="caption" sx={{ color: serverError ? "#f44336" : "#4caf50" }}>
                        {serverError ? "Server issues detected" : "Server operational"}
                      </Typography>
                    </Box>
                    {serverError && (
                      <Typography variant="caption" sx={{ color: "#ff9800", display: "block", mt: 1 }}>
                        Using local storage fallback available
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Right side - Registration Form */}
            <Grid item xs={12} md={isNotMobile ? 6 : 12}>
              <Box
                sx={{
                  width: "100%",
                  p: { xs: 3, sm: 4 },
                  borderRadius: 3,
                  backgroundColor: "rgba(18, 18, 30, 0.85)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                  position: "relative",
                  overflow: "hidden",
                  '&::before': {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  }
                }}
              >
                {!isNotMobile && (
                  <Box textAlign="center" mb={4}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        border: "2px solid rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <RegisterIcon sx={{ fontSize: 40, color: "#667eea" }} />
                    </Box>
                  </Box>
                )}

                {/* Error Alert */}
                <Collapse in={!!error}>
                  <Alert 
                    severity={serverError ? "warning" : "error"}
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      backgroundColor: serverError ? "rgba(255, 152, 0, 0.1)" : "rgba(211, 47, 47, 0.1)",
                      color: serverError ? "#ff9800" : "#ff6b6b",
                      border: `1px solid ${serverError ? "rgba(255, 152, 0, 0.3)" : "rgba(211, 47, 47, 0.3)"}`,
                      '& .MuiAlert-icon': {
                        color: serverError ? "#ff9800" : "#ff6b6b",
                      }
                    }}
                    icon={serverError ? <WarningIcon /> : undefined}
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setError("");
                          setServerError(false);
                        }}
                      >
                        Dismiss
                      </Button>
                    }
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {error}
                      </Typography>
                      {serverError && (
                        <>
                          <Typography variant="caption" sx={{ display: "block", mt: 0.5, opacity: 0.9 }}>
                            You can still create a demo account using local storage.
                          </Typography>
                          <Button
                            size="small"
                            onClick={handleDemoRegister}
                            sx={{ mt: 1, color: "#667eea" }}
                          >
                            Fill Demo Credentials
                          </Button>
                        </>
                      )}
                    </Box>
                  </Alert>
                </Collapse>

                {/* Form Header */}
                <Box textAlign="center" mb={4}>
                  <Typography 
                    variant="h3" 
                    fontWeight="700" 
                    gutterBottom
                    sx={{
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                    }}
                  >
                    Create Account
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#b0b7c3" }}>
                    Register to get started with our platform
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  {/* Username Field */}
                  <TextField
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    required
                    disabled={isLoading}
                    helperText="Minimum 3 characters"
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ color: "#667eea", mr: 1 }} />
                      ),
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: "#b0b7c3",
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: "#667eea",
                      },
                      '& .MuiFormHelperText-root': {
                        color: "#8a94a6",
                      },
                      '& .MuiOutlinedInput-root': {
                        color: "#ffffff",
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        '& fieldset': {
                          borderColor: "rgba(255, 255, 255, 0.1)",
                        },
                        '&:hover fieldset': {
                          borderColor: "#667eea",
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: "#667eea",
                        }
                      }
                    }}
                  />

                  {/* Email Field */}
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ color: "#667eea", mr: 1 }} />
                      ),
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: "#b0b7c3",
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: "#667eea",
                      },
                      '& .MuiOutlinedInput-root': {
                        color: "#ffffff",
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        '& fieldset': {
                          borderColor: "rgba(255, 255, 255, 0.1)",
                        },
                        '&:hover fieldset': {
                          borderColor: "#667eea",
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: "#667eea",
                        }
                      }
                    }}
                  />

                  {/* Password Field */}
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                    disabled={isLoading}
                    helperText="Minimum 8 characters"
                    InputProps={{
                      startAdornment: (
                        <LockIcon sx={{ color: "#667eea", mr: 1 }} />
                      ),
                      endAdornment: (
                        <Button
                          size="small"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          sx={{ 
                            minWidth: "auto",
                            color: "#b0b7c3",
                            '&:hover': {
                              backgroundColor: "rgba(102, 126, 234, 0.1)",
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      ),
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: "#b0b7c3",
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: "#667eea",
                      },
                      '& .MuiFormHelperText-root': {
                        color: "#8a94a6",
                      },
                      '& .MuiOutlinedInput-root': {
                        color: "#ffffff",
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        '& fieldset': {
                          borderColor: "rgba(255, 255, 255, 0.1)",
                        },
                        '&:hover fieldset': {
                          borderColor: "#667eea",
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: "#667eea",
                        }
                      }
                    }}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      py: 1.5,
                      mt: 3,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "1rem",
                      textTransform: "none",
                      transition: "all 0.3s",
                      boxShadow: "0 4px 14px 0 rgba(102, 126, 234, 0.4)",
                      '&:hover': {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px 0 rgba(102, 126, 234, 0.6)",
                        background: "linear-gradient(135deg, #5a6fd8 0%, #6a4299 100%)",
                      },
                      '&:active': {
                        transform: "translateY(0)",
                      },
                      '&.Mui-disabled': {
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.3)",
                      }
                    }}
                  >
                    {isLoading ? (
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <CircularProgress size={24} sx={{ color: "white", mr: 1 }} />
                        Creating Account...
                      </Box>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  {/* Demo Mode Option */}
                  {serverError && (
                    <Box mt={2} textAlign="center">
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          handleDemoRegister();
                          setTimeout(() => handleSubmit(new Event('submit')), 100);
                        }}
                        sx={{
                          py: 1,
                          borderRadius: 2,
                          borderColor: "rgba(102, 126, 234, 0.5)",
                          color: "#667eea",
                          fontWeight: 500,
                          textTransform: "none",
                          '&:hover': {
                            borderColor: "#667eea",
                            backgroundColor: "rgba(102, 126, 234, 0.1)",
                          }
                        }}
                      >
                        Create Demo Account (Local Storage)
                      </Button>
                      <Typography variant="caption" sx={{ color: "#8a94a6", display: "block", mt: 1 }}>
                        Note: Demo accounts are stored locally in your browser
                      </Typography>
                    </Box>
                  )}

                  {/* Login Link */}
                  <Box mt={3} textAlign="center">
                    <Typography variant="body2" sx={{ color: "#b0b7c3" }}>
                      Already have an account?{" "}
                      <Link 
                        to="/login" 
                        style={{ 
                          textDecoration: "none",
                          color: "#667eea",
                          fontWeight: 600,
                          marginLeft: 4,
                        }}
                      >
                        Sign In
                      </Link>
                    </Typography>
                  </Box>

                  {/* Terms */}
                  <Box mt={4} textAlign="center">
                    <Typography variant="caption" sx={{ color: "#8a94a6" }}>
                      By creating an account, you agree to our Terms of Service and Privacy Policy
                    </Typography>
                  </Box>
                </form>
              </Box>
            </Grid>
          </Grid>
        </Fade>
      </Container>

      {/* Debug Info Dialog */}
      <Dialog 
        open={showDebugInfo} 
        onClose={() => setShowDebugInfo(false)}
        maxWidth="md"
      >
        <DialogTitle sx={{ backgroundColor: "#12121e", color: "#fff" }}>
          <Box display="flex" alignItems="center">
            <InfoIcon sx={{ mr: 1, color: "#667eea" }} />
            Debug Information
          </Box>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#12121e", color: "#b0b7c3" }}>
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            <Typography variant="subtitle2" sx={{ color: "#667eea", mb: 1 }}>
              API Endpoint:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, wordBreak: 'break-all' }}>
              https://chatgpt-clone-server-p2dj.onrender.com/api/v1/auth/register
            </Typography>
            
            <Typography variant="subtitle2" sx={{ color: "#667eea", mb: 1 }}>
              Current Form Data:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Username: {username}<br />
              Email: {email}<br />
              Password: {password ? '••••••••' : '(empty)'}
            </Typography>

            {debugData && (
              <>
                <Typography variant="subtitle2" sx={{ color: "#667eea", mb: 1 }}>
                  Last Error:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Message: {debugData.error?.message}<br />
                  Code: {debugData.error?.code}<br />
                  Status: {debugData.error?.response?.status}<br />
                  Timestamp: {debugData.timestamp}
                </Typography>
              </>
            )}

            <Typography variant="caption" sx={{ color: "#8a94a6", display: "block", mt: 2 }}>
              Check if the server is running and accessible from your browser.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#12121e" }}>
          <Button 
            onClick={() => setShowDebugInfo(false)}
            sx={{ color: "#667eea" }}
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              window.open('https://chatgpt-clone-server-p2dj.onrender.com/', '_blank');
              setShowDebugInfo(false);
            }}
            sx={{ color: "#667eea" }}
          >
            Check Server
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Register;