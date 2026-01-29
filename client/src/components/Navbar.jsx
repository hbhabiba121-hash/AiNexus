import React from "react";
import { 
  Box, 
  Typography, 
  useTheme, 
  AppBar, 
  Toolbar, 
  Button, 
  Container,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  alpha,
  Badge,
  keyframes
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  HomeRounded,
  LoginRounded,
  LogoutRounded,
  PersonAddRounded,
  Menu as MenuIcon,
  DashboardRounded,
  AccountCircleRounded,
  AutoAwesomeRounded,
  RocketLaunchRounded,
  WorkspacePremiumRounded
} from "@mui/icons-material";

const glowAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
  }
`;

const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = JSON.parse(localStorage.getItem("authToken"));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);

  //handle logout
  const handleLogout = async () => {
    try {
      await axios.post("https://chatgpt-clone-server-p2dj.onrender.com/api/v1/auth/logout");
      localStorage.removeItem("authToken");
      toast.success("Logged out successfully");
      navigate("/login");
      handleClose();
      handleMobileClose();
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileClick = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileClose = () => {
    setMobileMenuAnchor(null);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavButton = ({ to, icon, children, onClick, variant = "text" }) => (
    <Button
      component={onClick ? undefined : Link}
      to={onClick ? undefined : to}
      onClick={onClick}
      startIcon={icon}
      variant={variant}
      sx={{
        mx: 1,
        px: 3,
        py: 1.2,
        borderRadius: 2,
        color: variant === 'contained' ? '#fff' : 
               isActive(to) ? '#6366f1' : '#94a3b8',
        backgroundColor: variant === 'contained' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 
                         isActive(to) ? alpha('#6366f1', 0.1) : 'transparent',
        background: variant === 'contained' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'none',
        fontWeight: 600,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        border: variant === 'outlined' ? `2px solid ${alpha('#6366f1', 0.3)}` : 'none',
        '&:hover': {
          backgroundColor: variant === 'contained' ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 
                           isActive(to) ? alpha('#6366f1', 0.2) : alpha('#6366f1', 0.05),
          transform: 'translateY(-2px)',
          boxShadow: variant === 'contained' ? '0 10px 25px rgba(99, 102, 241, 0.3)' : 'none',
          borderColor: variant === 'outlined' ? '#6366f1' : 'none'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          transition: '0.5s'
        },
        '&:hover::before': {
          left: '100%'
        }
      }}
    >
      {children}
    </Button>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        bgcolor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha('#1e293b', 0.3)}`,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1.5, justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              mr: 4,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                mr: 2,
                animation: `${pulseAnimation} 2s infinite`,
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
              }}
            >
              <RocketLaunchRounded />
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight="900"
                sx={{
                  background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em'
                }}
              >
                AI Nexus
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#94a3b8',
                  fontWeight: 500,
                  letterSpacing: '0.05em'
                }}
              >
             
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center',
            gap: 1
          }}>
            <NavButton to="/" icon={<HomeRounded />}>
              Home
            </NavButton>

<NavButton  
  onClick={() => {
    if (location.pathname === "/") {
      // On homepage, scroll to tools section
      document.getElementById("tools-section")?.scrollIntoView({ 
        behavior: "smooth" 
      });
    } else {
      // On other pages, navigate to homepage then scroll
      navigate("/");
      setTimeout(() => {
        document.getElementById("tools-section")?.scrollIntoView({ 
          behavior: "smooth" 
        });
      }, 100);
    }
  }}
  icon={<AutoAwesomeRounded />}
>
  Tools
</NavButton>
            
      
            
            {loggedIn ? (
              <>
                
                
                <IconButton
                  onClick={handleClick}
                  sx={{
                    ml: 2,
                    width: 48,
                    height: 48,
                    border: `2px solid ${alpha('#6366f1', 0.3)}`,
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    animation: `${glowAnimation} 3s infinite`,
                    '&:hover': {
                      borderColor: '#6366f1',
                      backgroundColor: alpha('#6366f1', 0.1),
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-dot': {
                        backgroundColor: '#10b981',
                        boxShadow: '0 0 10px #10b981'
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                      }}
                    >
                      <AccountCircleRounded />
                    </Avatar>
                  </Badge>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 2,
                      minWidth: 220,
                      borderRadius: 3,
                      background: 'rgba(30, 41, 59, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('#1e293b', 0.3)}`,
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                      overflow: 'hidden'
                    }
                  }}
                >
                  <MenuItem 
                    sx={{ 
                      py: 2,
                      fontWeight: 700,
                      color: '#f1f5f9',
                      borderBottom: `1px solid ${alpha('#1e293b', 0.3)}`,
                      background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent)'
                    }}
                  >
                    <AccountCircleRounded sx={{ mr: 2, color: '#6366f1' }} />
                    My Account
                  </MenuItem>
                  <MenuItem 
                    onClick={() => {
                      navigate('/dashboard');
                      handleClose();
                    }}
                    sx={{ 
                      py: 1.5,
                      color: '#cbd5e1',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha('#6366f1', 0.1),
                        color: '#6366f1'
                      }
                    }}
                  >
                    <DashboardRounded sx={{ mr: 2 }} />
                    Dashboard
                  </MenuItem>
                  <MenuItem 
                    onClick={() => {
                      navigate('/profile');
                      handleClose();
                    }}
                    sx={{ 
                      py: 1.5,
                      color: '#cbd5e1',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha('#6366f1', 0.1),
                        color: '#6366f1'
                      }
                    }}
                  >
                    <AccountCircleRounded sx={{ mr: 2 }} />
                    Profile Settings
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      py: 1.5,
                      color: '#ef4444',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha('#ef4444', 0.1)
                      }
                    }}
                  >
                    <LogoutRounded sx={{ mr: 2 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <NavButton to="/login" icon={<LoginRounded />}>
                  Login
                </NavButton>
                <NavButton to="/register" icon={<PersonAddRounded />} variant="contained">
                  Get Started
                </NavButton>
              </>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            sx={{ 
              display: { xs: 'flex', md: 'none' },
              color: '#94a3b8',
              border: `1px solid ${alpha('#1e293b', 0.3)}`,
              background: 'rgba(30, 41, 59, 0.5)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#6366f1',
                borderColor: '#6366f1',
                backgroundColor: alpha('#6366f1', 0.1)
              }
            }}
            onClick={handleMobileClick}
          >
            <MenuIcon />
          </IconButton>

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 280,
                borderRadius: 3,
                background: 'rgba(30, 41, 59, 0.98)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha('#1e293b', 0.3)}`,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
              }
            }}
          >
            {loggedIn ? (
              <>
                <Box sx={{ p: 2, borderBottom: `1px solid ${alpha('#1e293b', 0.3)}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 48, 
                        height: 48,
                        mr: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                      }}
                    >
                      <AccountCircleRounded />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="700" sx={{ color: '#f1f5f9' }}>
                        Welcome Back!
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Premium User
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <MenuItem 
                  component={Link} 
                  to="/dashboard" 
                  onClick={handleMobileClose}
                  sx={{ 
                    py: 1.5,
                    color: isActive('/dashboard') ? '#6366f1' : '#cbd5e1',
                    background: isActive('/dashboard') ? alpha('#6366f1', 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha('#6366f1', 0.1),
                      color: '#6366f1'
                    }
                  }}
                >
                  <DashboardRounded sx={{ mr: 2 }} />
                  Dashboard
                </MenuItem>
                
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    py: 1.5,
                    color: '#ef4444',
                    '&:hover': {
                      backgroundColor: alpha('#ef4444', 0.1)
                    }
                  }}
                >
                  <LogoutRounded sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem 
                  component={Link} 
                  to="/register" 
                  onClick={handleMobileClose}
                  sx={{ 
                    py: 1.5,
                    mb: 1,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: 2,
                    mx: 2,
                    textAlign: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                    }
                  }}
                >
                  <PersonAddRounded sx={{ mr: 2 }} />
                  Get Started Free
                </MenuItem>
                
                <MenuItem 
                  component={Link} 
                  to="/login" 
                  onClick={handleMobileClose}
                  sx={{ 
                    py: 1.5,
                    color: isActive('/login') ? '#6366f1' : '#cbd5e1',
                    '&:hover': {
                      backgroundColor: alpha('#6366f1', 0.1),
                      color: '#6366f1'
                    }
                  }}
                >
                  <LoginRounded sx={{ mr: 2 }} />
                  Login
                </MenuItem>
              </>
            )}
            
            <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${alpha('#1e293b', 0.3)}` }}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                AI Nexus v2.0 • Powered by Advanced AI
              </Typography>
            </Box>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;