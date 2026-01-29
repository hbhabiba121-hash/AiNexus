import React, { useState, useEffect } from "react";
import { Box, Container, Button, Typography, IconButton, Fade } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { KeyboardArrowUp } from "@mui/icons-material";

const colors = {
  primary: {
    main: '#4F46E5',
    dark: '#4338CA',
  },
  background: {
    darker: '#020617',
  },
  text: {
    primary: '#F8FAFC',
    tertiary: '#CBD5E1',
  }
};

export default function Footer() {
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Scroll event listener to show/hide button
  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 300px down
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box 
      component="footer"
      sx={{ 
        py: 4,
        mt: 'auto',
        borderTop: `1px solid ${alpha(colors.text.primary, 0.1)}`,
        background: colors.background.darker,
        position: 'relative',
      }}
    >
      <Container maxWidth="xl">
        {/* Back to Top Button - Only shows when scrolled down */}
        <Fade in={showScrollButton}>
          <IconButton
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              background: colors.primary.main,
              color: colors.text.primary,
              width: 48,
              height: 48,
              '&:hover': {
                background: colors.primary.dark,
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1000,
            }}
          >
            <KeyboardArrowUp />
          </IconButton>
        </Fade>
      </Container>
    </Box>
  );
}