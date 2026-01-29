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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isNotMobile = useMediaQuery("(min-width: 1000px)");
  
  // states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugData, setDebugData] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return false;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 1) {
      setError("Please enter your password");
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
    setIsDemoMode(false);

    // Validate form
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    // First, try to check if we have demo users in localStorage
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    const demoUser = demoUsers.find(user => user.email === email);
    
    // If demo user exists and password matches demo pattern
    if (demoUser && password === "DemoPassword123!") {
      setIsDemoMode(true);
      setTimeout(() => {
        handleLocalStorageLogin(demoUser);
      }, 500);
      return;
    }

    // Try to login with backend
    try {
      const apiUrl = "https://chatgpt-clone-server-p2dj.onrender.com/api/v1/auth/login";
      console.log("🔍 Attempting login to:", apiUrl);
      console.log("📝 Data being sent:", { email, password: password ? "••••••••" : "empty" });

      const response = await axios.post(
        apiUrl,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000, // Reduced timeout
          withCredentials: false,
        }
      );

      console.log("✅ Login response received:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      if (response.data) {
        const successMessage = response.data.message || "Logged in successfully!";
        toast.success(successMessage);
        
        // Store auth token
        localStorage.setItem("authToken", true);
        
        // Store user data if available
        if (response.data.user || response.data.token) {
          localStorage.setItem("currentUser", JSON.stringify({
            ...response.data.user,
            token: response.data.token,
            serverUser: true
          }));
        }
        
        navigate("/");
      }
      
    } catch (err) {
      // Enhanced error logging
      console.error("❌ Login error details:");
      console.error("Error Name:", err.name);
      console.error("Error Message:", err.message);
      console.error("Error Code:", err.code);
      console.error("Error Status:", err.response?.status);
      console.error("Error Status Text:", err.response?.statusText);
      console.error("Error Data:", err.response?.data);
      console.error("Error Config:", {
        url: err.config?.url,
        method: err.config?.method,
        data: err.config?.data,
        headers: err.config?.headers
      });

      // Check if it's an HTML response (server error page)
      if (err.response?.data && typeof err.response.data === 'string') {
        console.error("⚠️ Server returned HTML instead of JSON:");
        if (err.response.data.includes('<html') || err.response.data.includes('<!DOCTYPE')) {
          console.error("This is an HTML error page. Your server might be misconfigured.");
          if (err.response.data.includes('Internal Server Error')) {
            console.error("500 Internal Server Error detected.");
          }
        }
      }

      // Store debug data
      setDebugData({
        error: {
          name: err.name,
          message: err.message,
          code: err.code,
          status: err.response?.status,
          statusText: err.response?.statusText,
          dataType: typeof err.response?.data,
          isHTML: err.response?.data && typeof err.response.data === 'string' && 
                  (err.response.data.includes('<html') || err.response.data.includes('<!DOCTYPE'))
        },
        timestamp: new Date().toISOString(),
        endpoint: err.config?.url,
        method: err.config?.method,
      });

      // Enhanced error type checking
      if (err.code === 'ERR_NETWORK') {
        console.error("🌐 Network error - cannot reach server");
        setError("Cannot connect to server. Please check your internet connection.");
        setServerError(true);
      } else if (err.code === 'ECONNABORTED') {
        console.error("⏰ Connection timeout - server not responding");
        setError("Server is taking too long to respond. It might be offline or sleeping.");
        setServerError(true);
      } else if (err.response?.status === 500) {
        console.error("💥 Server 500 error - internal server error");
        setError("Server encountered an internal error (500).");
        setServerError(true);
        
        // Check if it's an HTML error page
        if (err.response?.data && typeof err.response.data === 'string') {
          if (err.response.data.includes('Internal Server Error')) {
            setError("Server returned: 500 Internal Server Error. Check server logs.");
          }
        }
      } else if (err.response?.status === 404) {
        console.error("🔍 404 error - endpoint not found");
        setError("Login endpoint not found (404). Check API URL configuration.");
        setServerError(true);
      } else if (err.response?.status === 400 || err.response?.status === 401) {
        console.error("🔐 Authentication error");
        let errorMsg = "Invalid email or password.";
        
        // Try to extract error message from response
        if (err.response?.data) {
          if (typeof err.response.data === 'object') {
            errorMsg = err.response.data.error || err.response.data.message || errorMsg;
          } else if (typeof err.response.data === 'string') {
            errorMsg = err.response.data;
          }
        }
        setError(errorMsg);
      } else if (err.response?.status) {
        console.error(`⚠️ HTTP ${err.response.status} error`);
        setError(`Server error: ${err.response.status} ${err.response.statusText || ''}`);
        setServerError(true);
      } else {
        console.error("❓ Unknown error");
        setError("An unexpected error occurred. Please try again.");
      }

      // Check for demo accounts
      if (demoUsers.length > 0) {
        console.log(`📊 Found ${demoUsers.length} demo account(s) in localStorage`);
        if (serverError) {
          toast.info("Server offline. You can use a demo account.");
        }
      }

      // Auto-clear error after 8 seconds
      const errorTimer = setTimeout(() => {
        setError("");
        setServerError(false);
      }, 8000);

      // Clean up timer
      return () => clearTimeout(errorTimer);

    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalStorageLogin = (demoUser) => {
    console.log("🎮 Logging in with demo account:", demoUser.email);
    
    // Set auth token for demo
    const demoToken = `demo-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("authToken", demoToken);
    localStorage.setItem("currentUser", JSON.stringify({
      ...demoUser,
      token: demoToken,
      isDemo: true,
      loginTime: new Date().toISOString()
    }));

    toast.success("Logged in with demo account! (Local storage mode)");
    navigate("/");
  };

  const handleDemoLogin = () => {
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    
    if (demoUsers.length > 0) {
      // Use the first demo user
      const demoUser = demoUsers[0];
      console.log("🔄 Filling demo credentials for:", demoUser.email);
      setEmail(demoUser.email);
      setPassword("DemoPassword123!");
      toast.info(`Demo credentials filled for ${demoUser.email}. Password: "DemoPassword123!"`);
    } else {
      toast.error("No demo accounts found. Please register a demo account first.");
      navigate("/register");
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

  const checkDemoAccounts = () => {
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    return demoUsers.length;
  };

  const testServerConnection = async () => {
    try {
      console.log("🔌 Testing server connection...");
      const response = await axios.get(
        "https://chatgpt-clone-server-p2dj.onrender.com/",
        { timeout: 5000 }
      );
      console.log("✅ Server connection test:", response.status, response.statusText);
      return {
        status: response.status,
        statusText: response.statusText,
        online: true,
      };
    } catch (err) {
      console.error("❌ Server connection test failed:", err.message);
      return {
        status: err.response?.status,
        statusText: err.response?.statusText,
        online: false,
        error: err.message,
      };
    }
  };

  const clearLocalStorageData = () => {
    localStorage.removeItem('demoUsers');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    toast.success("Local storage data cleared!");
    if (showDebugInfo) setShowDebugInfo(false);
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
      <Container maxWidth="sm">
        <Fade in={true} timeout={500}>
          <Box
            sx={{
              width: "100%",
              p: { xs: 3, sm: 4, md: 5 },
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
            {/* Mode Indicator */}
            {isDemoMode && (
              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  backgroundColor: "rgba(255, 193, 7, 0.2)",
                  color: "#ffc107",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  border: "1px solid rgba(255, 193, 7, 0.3)",
                  zIndex: 1,
                }}
              >
                DEMO MODE
              </Box>
            )}

            {/* Back button for mobile */}
            <Box sx={{ display: { xs: "flex", md: "none" }, mb: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/")}
                sx={{ 
                  color: "#b0b7c3",
                  '&:hover': {
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                  }
                }}
              >
                Back to Home
              </Button>
            </Box>

            {/* Server Status Indicator */}
            <Box sx={{ 
              position: "absolute", 
              top: 16, 
              right: 16,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              '&:hover': { opacity: 0.8 }
            }}>
              <Box
                onClick={() => setShowDebugInfo(true)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  transition: "all 0.3s",
                  '&:hover': {
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                  }
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: serverError ? "#f44336" : "#4caf50",
                    animation: serverError ? "pulse 2s infinite" : "none",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.5 },
                      "100%": { opacity: 1 },
                    }
                  }}
                />
                <Typography variant="caption" sx={{ color: "#b0b7c3", fontSize: "0.7rem" }}>
                  {serverError ? "Offline" : "Online"}
                </Typography>
              </Box>
            </Box>

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
                  {serverError && checkDemoAccounts() > 0 && (
                    <>
                      <Typography variant="caption" sx={{ display: "block", mt: 0.5, opacity: 0.9 }}>
                        {checkDemoAccounts()} demo account(s) available locally.
                      </Typography>
                      <Button
                        size="small"
                        onClick={handleDemoLogin}
                        sx={{ mt: 1, color: "#667eea" }}
                      >
                        Use Demo Account
                      </Button>
                    </>
                  )}
                </Box>
              </Alert>
            </Collapse>

            {/* Welcome Section */}
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
                <LoginIcon sx={{ fontSize: 40, color: "#667eea" }} />
              </Box>
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
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ color: "#b0b7c3", mb: 1 }}>
                Sign in to continue to your account
              </Typography>
              {checkDemoAccounts() > 0 && (
                <Typography variant="caption" sx={{ color: "#8a94a6", display: "block" }}>
                  {checkDemoAccounts()} demo account(s) available for offline use
                </Typography>
              )}
            </Box>

            <form onSubmit={handleSubmit}>
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

              {/* Forgot Password & Demo Login */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Link 
                  to="/forgot-password" 
                  style={{ 
                    textDecoration: "none",
                    color: "#667eea",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Forgot Password?
                </Link>
                {checkDemoAccounts() > 0 && (
                  <Button
                    size="small"
                    onClick={handleDemoLogin}
                    sx={{ 
                      color: "#8a94a6",
                      fontSize: "0.875rem",
                      textTransform: "none",
                      '&:hover': {
                        color: "#667eea",
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                      }
                    }}
                  >
                    Use Demo Account
                  </Button>
                )}
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
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
                    Signing In...
                  </Box>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Demo Login Option (when server is down) */}
              {serverError && checkDemoAccounts() === 0 && (
                <Box mt={2} textAlign="center">
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate("/register")}
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
                    Create Demo Account First
                  </Button>
                  <Typography variant="caption" sx={{ color: "#8a94a6", display: "block", mt: 1 }}>
                    Server is offline. Create a demo account to continue.
                  </Typography>
                </Box>
              )}

              {/* Register Link */}
              <Box mt={3} textAlign="center">
                <Typography variant="body2" sx={{ color: "#b0b7c3" }}>
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    style={{ 
                      textDecoration: "none",
                      color: "#667eea",
                      fontWeight: 600,
                      marginLeft: 4,
                    }}
                  >
                    Create Account
                  </Link>
                </Typography>
              </Box>

              {/* Terms */}
              <Box mt={4} textAlign="center">
                <Typography variant="caption" sx={{ color: "#8a94a6" }}>
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </Typography>
              </Box>
            </form>
          </Box>
        </Fade>
      </Container>

      {/* Debug Info Dialog */}
      <Dialog 
        open={showDebugInfo} 
        onClose={() => setShowDebugInfo(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: "#12121e", 
          color: "#fff",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <InfoIcon sx={{ mr: 1, color: "#667eea" }} />
              Debug Information
            </Box>
            <Typography variant="caption" sx={{ color: "#8a94a6" }}>
              Server Status: {serverError ? "❌ Offline" : "✅ Online"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#12121e", color: "#b0b7c3" }}>
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            <Typography variant="subtitle2" sx={{ color: "#667eea", mb: 1, mt: 2 }}>
              🔗 API Endpoint:
            </Typography>
            <Typography variant="body2" sx={{ 
              mb: 2, 
              wordBreak: 'break-all',
              p: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: 1,
              fontFamily: 'monospace'
            }}>
              {debugData?.endpoint || "https://chatgpt-clone-server-p2dj.onrender.com/api/v1/auth/login"}
            </Typography>
            
            <Typography variant="subtitle2" sx={{ color: "#667eea", mb: 1 }}>
              📝 Current Form Data:
            </Typography>
            <Box sx={{ 
              mb: 2,
              p: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: 1
            }}>
              <Typography variant="body2">
                📧 Email: {email || "(empty)"}<br />
                🔐 Password: {password ? '••••••••' : '(empty)'}
              </Typography>
            </Box>

            <Typography variant="subtitle2" sx={{ color: "#667eea", mb: 1 }}>
              💾 Local Storage Status:
            </Typography>
            <Box sx={{ 
              mb: 2,
              p: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: 1
            }}>
              <Typography variant="body2">
                👥 Demo Accounts: {checkDemoAccounts()}<br />
                🔑 Auth Token: {localStorage.getItem('authToken') ? '✅ Present' : '❌ Not set'}<br />
                👤 Current User: {localStorage.getItem('currentUser') ? '✅ Set' : '❌ Not set'}
              </Typography>
            </Box>

            {debugData && (
              <>
                <Typography variant="subtitle2" sx={{ color: "#667eea", mb: 1 }}>
                  ⚠️ Last Error Details:
                </Typography>
                <Box sx={{ 
                  mb: 2,
                  p: 1,
                  backgroundColor: "rgba(211, 47, 47, 0.1)",
                  border: "1px solid rgba(211, 47, 47, 0.3)",
                  borderRadius: 1
                }}>
                  <Typography variant="body2">
                    📛 Name: {debugData.error?.name}<br />
                    📝 Message: {debugData.error?.message}<br />
                    🔢 Code: {debugData.error?.code || 'N/A'}<br />
                    📊 Status: {debugData.error?.status || 'N/A'}<br />
                    📅 Timestamp: {debugData.timestamp}<br />
                    📄 Data Type: {debugData.error?.dataType || 'N/A'}<br />
                    🌐 HTML Response: {debugData.error?.isHTML ? '✅ Yes' : '❌ No'}
                  </Typography>
                </Box>
              </>
            )}

            <Typography variant="caption" sx={{ color: "#8a94a6", display: "block", mt: 2, fontStyle: 'italic' }}>
              💡 Demo accounts password: "DemoPassword123!"
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          backgroundColor: "#12121e",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <Button 
            onClick={clearLocalStorageData}
            sx={{ color: "#ff6b6b" }}
          >
            Clear Data
          </Button>
          <Button 
            onClick={async () => {
              const result = await testServerConnection();
              toast.info(`Server: ${result.online ? '✅ Online' : '❌ Offline'}`);
            }}
            sx={{ color: "#667eea" }}
          >
            Test Server
          </Button>
          <Button 
            onClick={() => {
              window.open('https://chatgpt-clone-server-p2dj.onrender.com/', '_blank');
              setShowDebugInfo(false);
            }}
            sx={{ color: "#667eea" }}
          >
            Open Server
          </Button>
          <Button 
            onClick={() => {
              console.clear();
              console.log("=== DEBUG INFO ===");
              console.log("LocalStorage Demo Users:", JSON.parse(localStorage.getItem('demoUsers') || '[]'));
              console.log("Auth Token:", localStorage.getItem('authToken'));
              console.log("Current User:", JSON.parse(localStorage.getItem('currentUser') || 'null'));
              console.log("=== END DEBUG ===");
              toast.info("Console cleared and debug data logged");
            }}
            sx={{ color: "#667eea" }}
          >
            Log to Console
          </Button>
          <Button 
            onClick={() => setShowDebugInfo(false)}
            sx={{ color: "#667eea", fontWeight: 'bold' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;