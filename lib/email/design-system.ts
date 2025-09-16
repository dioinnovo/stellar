/**
 * Email Design System
 * 
 * Centralized design constants ensuring consistent UI/UX across all client emails
 * Enterprise-grade visual standards for professional communications
 */

/**
 * Core brand colors with accessibility considerations
 */
export const BRAND_COLORS = {
  // Primary brand palette - Purple/Indigo theme
  primary: {
    main: '#667eea',
    light: '#8FA5F3',
    dark: '#4D5DB5',
    contrast: '#ffffff',
  },
  secondary: {
    main: '#764ba2',
    light: '#9B6FBF',
    dark: '#5A387A',
    contrast: '#ffffff',
  },
  accent: {
    success: '#10B981',  // Emerald green for CTA
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    cta: '#8B5CF6',      // Vibrant purple for primary actions
  },
  
  // Text colors
  text: {
    primary: '#2c3e50',
    secondary: '#5a6c7d',
    light: '#7f8c8d',
    white: '#ffffff',
  },
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    light: '#fafbfc',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  
  // Border and divider colors
  borders: {
    light: '#e9ecef',
    medium: '#dee2e6',
    dark: '#adb5bd',
  },
} as const;

/**
 * Typography system with responsive scaling
 */
export const TYPOGRAPHY = {
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },
  
  sizes: {
    // Desktop sizes
    desktop: {
      h1: '28px',
      h2: '24px', 
      h3: '20px',
      h4: '18px',
      body: '16px',
      small: '14px',
      caption: '12px',
    },
    // Mobile sizes - slightly smaller
    mobile: {
      h1: '24px',
      h2: '20px',
      h3: '18px', 
      h4: '16px',
      body: '15px',
      small: '13px',
      caption: '11px',
    },
  },
  
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeights: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.6',
    loose: '1.8',
  },
} as const;

/**
 * Spacing system for consistent layout
 */
export const SPACING = {
  // Base unit: 4px
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  
  // Specific use cases
  sections: '40px',        // Between major email sections
  paragraphs: '16px',      // Between paragraphs
  elements: '12px',        // Between small elements
  containerPadding: {
    desktop: '40px',
    mobile: '20px',        // Fix the large gap issue from original
  },
  
  // Header specific spacing (addresses the visual gap issue)
  header: {
    desktop: '24px',       // Reduced from problematic 40px
    mobile: '16px',        // Mobile-optimized
  },
} as const;

/**
 * Layout constants for responsive design
 */
export const LAYOUT = {
  maxWidth: '600px',
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  
  shadows: {
    light: '0 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0 2px 8px rgba(0, 0, 0, 0.1)',
    strong: '0 4px 16px rgba(0, 0, 0, 0.15)',
  },
  
  // Email client specific adjustments
  emailClient: {
    tableWidth: '100%',
    cellpadding: '0',
    cellspacing: '0',
    border: '0',
  },
} as const;

/**
 * Premium visual elements for world-class email design
 */
export const PREMIUM_VISUALS = {
  // Card system for modern layout
  cards: {
    default: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(102, 126, 234, 0.1)',
      padding: '32px',
      margin: '24px 0',
    },
    highlight: {
      backgroundColor: '#ffffff',
      borderRadius: '12px', 
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
      border: '2px solid rgba(102, 126, 234, 0.2)',
      padding: '32px',
      margin: '24px 0',
      position: 'relative' as const,
    },
    vision: {
      background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
      borderRadius: '16px',
      boxShadow: '0 6px 28px rgba(102, 126, 234, 0.12)',
      border: '1px solid rgba(102, 126, 234, 0.15)',
      padding: '40px',
      margin: '32px 0',
      position: 'relative' as const,
    },
  },
  
  // Icon system for visual hierarchy
  icons: {
    vision: '🎯',
    results: '📊', 
    nextSteps: '🚀',
    contact: '💬',
    success: '✨',
    automation: '⚡',
    growth: '📈',
    time: '⏰',
  },
  
  // Premium gradients with 3D effect
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
    vision: 'linear-gradient(145deg, #f0f4ff 0%, #e0e7ff 100%)',
    card: 'linear-gradient(145deg, #ffffff 0%, #fafbff 100%)',
    cta: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    ctaGreen: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    subtle: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
  },
  
  // Advanced 3D shadows for depth
  elevations: {
    card: '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.06)',
    cardHover: '0 20px 40px rgba(102, 126, 234, 0.2), 0 2px 10px rgba(0, 0, 0, 0.08)',
    hero: '0 20px 60px rgba(102, 126, 234, 0.25), 0 0 40px rgba(102, 126, 234, 0.1)',
    cta: '0 8px 30px rgba(139, 92, 246, 0.35), 0 2px 8px rgba(0, 0, 0, 0.1)',
    ctaHover: '0 12px 40px rgba(139, 92, 246, 0.45), 0 4px 12px rgba(0, 0, 0, 0.15)',
    subtle: '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.08)',
  },
} as const;

/**
 * Component-specific design tokens
 */
export const COMPONENTS = {
  header: {
    minHeight: '140px',      // Increased for premium feel
    maxHeight: '200px',      
    textAlign: 'center' as const,
    padding: {
      desktop: '48px 32px',  // More generous padding
      mobile: '32px 20px',
    },
    background: PREMIUM_VISUALS.gradients.primary,
    borderRadius: '0 0 24px 24px', // Soft bottom corners
  },
  
  button: {
    primary: {
      background: PREMIUM_VISUALS.gradients.cta,
      color: '#ffffff',
      padding: '16px 32px',
      fontSize: '18px',
      fontWeight: TYPOGRAPHY.weights.semibold,
      borderRadius: '12px',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'all 0.3s ease',
      boxShadow: PREMIUM_VISUALS.elevations.cta,
      border: 'none',
      letterSpacing: '0.5px',
      textTransform: 'none' as const,
      minWidth: '200px',
      textAlign: 'center' as const,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: BRAND_COLORS.primary.main,
      padding: '14px 28px',
      fontSize: '16px',
      fontWeight: TYPOGRAPHY.weights.medium,
      border: `2px solid ${BRAND_COLORS.primary.main}`,
      borderRadius: '10px',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'all 0.3s ease',
      letterSpacing: '0.3px',
    },
  },
  
  card: {
    backgroundColor: BRAND_COLORS.background.primary,
    borderRadius: LAYOUT.borderRadius.medium,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    boxShadow: LAYOUT.shadows.light,
  },
  
  highlight: {
    backgroundColor: BRAND_COLORS.background.secondary,
    borderLeft: `4px solid ${BRAND_COLORS.primary.main}`,
    padding: SPACING.lg,
    margin: `${SPACING.md} 0`,
    borderRadius: `0 ${LAYOUT.borderRadius.small} ${LAYOUT.borderRadius.small} 0`,
  },
} as const;

/**
 * Responsive design rules for email clients
 */
export const RESPONSIVE = {
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
  },
  
  // Media query patterns for email
  mediaQueries: {
    mobile: '@media screen and (max-width: 480px)',
    tablet: '@media screen and (max-width: 768px)',
  },
  
  // Mobile-specific overrides
  mobile: {
    container: {
      padding: SPACING.containerPadding.mobile,
      fontSize: TYPOGRAPHY.sizes.mobile.body,
    },
    header: {
      padding: SPACING.header.mobile,
      fontSize: TYPOGRAPHY.sizes.mobile.h1,
    },
    button: {
      padding: '14px 20px',    // Larger tap targets on mobile
      fontSize: TYPOGRAPHY.sizes.mobile.body,
    },
  },
} as const;

/**
 * Animation and interaction constants
 */
export const INTERACTIONS = {
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  },
  
  hover: {
    button: {
      primary: {
        backgroundColor: BRAND_COLORS.primary.dark,
        transform: 'translateY(-1px)',
        boxShadow: LAYOUT.shadows.medium,
      },
      secondary: {
        backgroundColor: BRAND_COLORS.primary.main,
        color: BRAND_COLORS.primary.contrast,
      },
    },
  },
} as const;

/**
 * Accessibility constants
 */
export const ACCESSIBILITY = {
  contrast: {
    minimum: '4.5:1',        // WCAG AA standard
    enhanced: '7:1',         // WCAG AAA standard
  },
  
  focusStyles: {
    outline: `2px solid ${BRAND_COLORS.accent.info}`,
    outlineOffset: '2px',
  },
  
  altText: {
    decorative: '',          // Empty alt for decorative images
    logo: 'Innovoco AI & Automation',
    icons: {
      email: 'Email icon',
      phone: 'Phone icon',
      calendar: 'Calendar icon',
      checkmark: 'Success checkmark',
    },
  },
} as const;

/**
 * Email client compatibility styles
 */
export const EMAIL_CLIENT_FIXES = {
  // Outlook specific fixes
  outlook: {
    lineHeight: '1.4',       // Outlook line-height rendering
    fontSize: '16px',        // Minimum readable size
    fontFamily: 'Arial, sans-serif', // Safe fallback
  },
  
  // Gmail specific fixes  
  gmail: {
    maxWidth: '600px',
    tableLayout: 'fixed' as const,
  },
  
  // Apple Mail fixes
  appleMail: {
    textSizeAdjust: '100%',  // Prevents automatic scaling
    webkitTextSizeAdjust: '100%',
  },
} as const;

/**
 * Helper function to generate consistent CSS styles
 */
export function generateEmailStyles(): string {
  return `
    /* Base styles for email clients */
    body {
      margin: 0;
      padding: 0;
      font-family: ${TYPOGRAPHY.fonts.primary};
      line-height: ${TYPOGRAPHY.lineHeights.normal};
      color: ${BRAND_COLORS.text.primary};
      background-color: ${BRAND_COLORS.background.secondary};
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    
    /* Container styles */
    .email-container {
      max-width: ${LAYOUT.maxWidth};
      margin: 0 auto;
      background-color: ${BRAND_COLORS.background.primary};
      box-shadow: ${LAYOUT.shadows.medium};
    }
    
    /* Header styles - fixed gap issue */
    .email-header {
      background: ${BRAND_COLORS.background.gradient};
      color: ${BRAND_COLORS.text.white};
      padding: ${SPACING.header.desktop};
      text-align: center;
    }
    
    /* Content styles */
    .email-content {
      padding: ${SPACING.containerPadding.desktop};
    }
    
    /* Button styles */
    .btn-primary {
      background: ${COMPONENTS.button.primary.background};
      color: ${COMPONENTS.button.primary.color};
      padding: ${COMPONENTS.button.primary.padding};
      font-size: ${COMPONENTS.button.primary.fontSize};
      font-weight: ${COMPONENTS.button.primary.fontWeight};
      border-radius: ${COMPONENTS.button.primary.borderRadius};
      text-decoration: none;
      display: inline-block;
      transition: ${INTERACTIONS.transitions.normal};
    }
    
    .btn-secondary {
      background-color: ${COMPONENTS.button.secondary.backgroundColor};
      color: ${COMPONENTS.button.secondary.color};
      padding: ${COMPONENTS.button.secondary.padding};
      border: ${COMPONENTS.button.secondary.border};
      border-radius: ${COMPONENTS.button.secondary.borderRadius};
      text-decoration: none;
      display: inline-block;
    }
    
    /* Responsive styles */
    ${RESPONSIVE.mediaQueries.mobile} {
      .email-container {
        width: 100% !important;
        min-width: 100% !important;
      }
      
      .email-header {
        padding: ${SPACING.header.mobile} !important;
        font-size: ${TYPOGRAPHY.sizes.mobile.h1} !important;
      }
      
      .email-content {
        padding: ${SPACING.containerPadding.mobile} !important;
      }
      
      .btn-primary,
      .btn-secondary {
        padding: ${RESPONSIVE.mobile.button.padding} !important;
        font-size: ${RESPONSIVE.mobile.button.fontSize} !important;
        display: block !important;
        text-align: center !important;
        margin-bottom: ${SPACING.md} !important;
      }
    }
  `;
}

/**
 * Template-specific style variations
 */
export const TEMPLATE_STYLES = {
  welcome: {
    headerColor: BRAND_COLORS.accent.success,
    primaryButton: COMPONENTS.button.primary,
    tone: 'friendly' as const,
  },
  consultation: {
    headerColor: BRAND_COLORS.primary.main,
    primaryButton: COMPONENTS.button.primary,
    tone: 'professional' as const,
  },
  executive: {
    headerColor: BRAND_COLORS.secondary.main,
    primaryButton: COMPONENTS.button.secondary,
    tone: 'formal' as const,
  },
  nurture: {
    headerColor: BRAND_COLORS.accent.info,
    primaryButton: COMPONENTS.button.secondary,
    tone: 'educational' as const,
  },
} as const;