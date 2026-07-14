import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#9B8ED8', light: '#B8ADE8', dark: '#7B6FC0', contrastText: '#FFFFFF' },
    secondary: { main: '#F2B5AE', light: '#F8D0CC', dark: '#D9928A', contrastText: '#2D2B3D' },
    background: { default: '#F8F6F3', paper: '#FFFFFF' },
    success: { main: '#8BC4A8', light: '#A8D5BA', contrastText: '#1B3B2B' },
    warning: { main: '#E8CF96', light: '#F0DDB0', contrastText: '#3D351B' },
    error: { main: '#E8A8B0', light: '#F0C0C6', contrastText: '#3D1B1B' },
    info: { main: '#A8C8E8', light: '#C0D8F0', contrastText: '#1B2B3D' },
    text: { primary: '#2D2B3D', secondary: '#6E6B7B', disabled: '#B0AEB8' },
    divider: 'rgba(155, 142, 216, 0.12)',
    common: { black: '#1A1826', white: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, fontSize: '1.35rem', letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, fontSize: '1.1rem' },
    subtitle1: { fontWeight: 500, fontSize: '0.95rem', color: '#6E6B7B' },
    body2: { fontSize: '0.875rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          backgroundImage: `
            radial-gradient(ellipse at 15% 20%, rgba(155,142,216,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 85% 15%, rgba(242,181,174,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(139,196,168,0.05) 0%, transparent 50%)
          `,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '*::-webkit-scrollbar': {
          width: 6,
          height: 6,
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          background: 'rgba(155,142,216,0.25)',
          borderRadius: 3,
          '&:hover': { background: 'rgba(155,142,216,0.4)' },
        },
        '.sw-popup': {
          borderRadius: '24px !important',
          padding: '28px 24px 22px',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          boxShadow: `
            0 0 0 1px rgba(155,142,216,0.06),
            0 2px 4px rgba(45,43,61,0.02),
            0 8px 24px rgba(45,43,61,0.04),
            0 20px 48px rgba(155,142,216,0.08),
            0 40px 80px rgba(155,142,216,0.06),
            0 60px 120px rgba(155,142,216,0.04)
          `,
          fontFamily: '"Inter", "Plus Jakarta Sans", "Roboto", "Helvetica Neue", Arial, sans-serif',
          width: '400px',
          maxWidth: '92vw',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '28px',
            padding: '1.5px',
            background: 'linear-gradient(135deg, rgba(155,142,216,0.2) 0%, rgba(242,181,174,0.15) 25%, rgba(139,196,168,0.15) 50%, rgba(155,142,216,0.2) 75%, rgba(242,181,174,0.15) 100%)',
            backgroundSize: '300% 300%',
            animation: 'swBorderGlow 4s ease-in-out infinite',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-6px',
            left: '-6px',
            right: '-6px',
            bottom: '-6px',
            borderRadius: '32px',
            background: 'linear-gradient(135deg, rgba(155,142,216,0.04) 0%, transparent 50%, rgba(139,196,168,0.04) 100%)',
            zIndex: -1,
            pointerEvents: 'none',
          },
          '& .swal2-validation-message': {
            background: 'rgba(232,168,176,0.08)',
            color: '#C2535C',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '0.8rem',
            marginTop: '4px',
            border: '1px solid rgba(232,168,176,0.15)',
          },
        },
        '.sw-title': {
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#2D2B3D',
          padding: '4px 0 10px',
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
          position: 'relative',
        },
        '.sw-html': {
          fontSize: '0.82rem',
          color: '#6E6B7B',
          lineHeight: 1.65,
          padding: '0 2px 10px',
          maxHeight: '200px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(155,142,216,0.2)',
            borderRadius: 2,
          },
        },
        '.sw-btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '10px 22px',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '0.82rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          margin: '0 4px',
          minWidth: '90px',
          letterSpacing: '0.01em',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          },
          '&:hover::after': { opacity: 1 },
          '&:focus': {
            boxShadow: '0 0 0 3px rgba(155,142,216,0.25)',
            outline: 'none',
          },
          '&:active': { transform: 'scale(0.97) !important' },
        },
        '.sw-btn-primary': {
          background: 'linear-gradient(135deg, #9B8ED8 0%, #B8ADE8 50%, #9B8ED8 100%)',
          backgroundSize: '200% 200%',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(155,142,216,0.3)',
          animation: 'swShimmer 3s ease-in-out infinite',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 28px rgba(155,142,216,0.4), 0 0 20px rgba(155,142,216,0.15)',
          },
          '&:active': { transform: 'scale(0.97) !important' },
        },
        '.sw-btn-danger': {
          background: 'linear-gradient(135deg, #E8A8B0 0%, #F0C0C6 50%, #E8A8B0 100%)',
          backgroundSize: '200% 200%',
          color: '#3D1B1B',
          boxShadow: '0 4px 16px rgba(232,168,176,0.3)',
          animation: 'swShimmer 3s ease-in-out infinite',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 28px rgba(232,168,176,0.4), 0 0 20px rgba(232,168,176,0.15)',
          },
          '&:active': { transform: 'scale(0.97) !important' },
        },
        '.sw-btn-outline': {
          background: 'rgba(155,142,216,0.04)',
          color: '#6E6B7B',
          border: '1.5px solid rgba(155,142,216,0.15)',
          boxShadow: 'none',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#9B8ED8',
            background: 'rgba(155,142,216,0.08)',
            boxShadow: '0 4px 16px rgba(155,142,216,0.1)',
            color: '#5A5770',
          },
          '&:active': { transform: 'scale(0.97) !important' },
        },
        '.sw-icon': {
          border: 'none !important',
          width: '56px !important',
          height: '56px !important',
          margin: '0 auto 10px !important',
          display: 'flex !important',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          position: 'relative',
          animation: 'swIconIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transition: 'box-shadow 0.3s ease',
        },
        '.swal2-icon-show': {
          animation: 'none !important',
        },
        '.swal2-icon.swal2-success': {
          background: 'rgba(139,196,168,0.1)',
          boxShadow: '0 0 0 0 rgba(139,196,168,0.25)',
          animation: 'swIconSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '& .swal2-success-ring': {
            border: '3px solid #8BC4A8',
            borderRadius: '50%',
            animation: 'swRingPulse 2s ease-in-out infinite',
          },
          '& .swal2-success-line-tip, & .swal2-success-line-long': {
            background: '#8BC4A8',
            height: '2.8px',
            borderRadius: '2px',
          },
          '& .swal2-success-line-tip': {
            top: '31px',
            left: '11px',
            width: '16px',
            transform: 'rotate(42deg)',
            animation: 'swCheckTip 0.4s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          },
          '& .swal2-success-line-long': {
            top: '28px',
            right: '7px',
            width: '30px',
            transform: 'rotate(-45deg)',
            animation: 'swCheckLong 0.4s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          },
          '& .swal2-success-fix': {
            background: 'transparent',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            border: '2px solid rgba(139,196,168,0.08)',
            animation: 'swRipple 2s ease-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,196,168,0.06) 0%, transparent 70%)',
            animation: 'swGlow 2s ease-in-out infinite alternate',
          },
        },
        '.swal2-icon.swal2-error': {
          background: 'rgba(232,168,176,0.1)',
          boxShadow: '0 0 0 0 rgba(232,168,176,0.25)',
          animation: 'swIconSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '& .swal2-x-mark': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'swShake 0.5s 0.25s ease both',
          },
          '& .swal2-x-mark-line-left, & .swal2-x-mark-line-right': {
            background: '#E8A8B0',
            width: '24px',
            height: '3px',
            borderRadius: '2px',
          },
          '& .swal2-x-mark-line-left': {
            transform: 'rotate(45deg)',
          },
          '& .swal2-x-mark-line-right': {
            transform: 'rotate(-45deg)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            border: '2px solid rgba(232,168,176,0.08)',
            animation: 'swRipple 2s ease-out infinite',
          },
        },
        '.swal2-icon.swal2-warning': {
          background: 'rgba(232,207,150,0.1)',
          color: '#C4A858',
          fontSize: '42px',
          fontWeight: 300,
          boxShadow: '0 0 0 0 rgba(232,207,150,0.25)',
          animation: 'swIconSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '& .swal2-warning': {
            border: 'none',
            animation: 'swWarningBounce 1s 0.3s ease infinite',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            border: '2px solid rgba(232,207,150,0.08)',
            animation: 'swRipple 2s ease-out infinite',
          },
        },
        '.swal2-icon.swal2-question': {
          background: 'rgba(168,200,232,0.1)',
          color: '#6E9EC8',
          fontSize: '38px',
          fontWeight: 700,
          boxShadow: '0 0 0 0 rgba(168,200,232,0.25)',
          animation: 'swIconSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            border: '2px solid rgba(168,200,232,0.08)',
            animation: 'swRipple 2s ease-out infinite',
          },
        },
        '.swal2-icon.swal2-info': {
          background: 'rgba(168,200,232,0.1)',
          color: '#6E9EC8',
          fontSize: '34px',
          fontWeight: 700,
          boxShadow: '0 0 0 0 rgba(168,200,232,0.25)',
          animation: 'swIconSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            border: '2px solid rgba(168,200,232,0.08)',
            animation: 'swRipple 2s ease-out infinite',
          },
        },
        '.sw-progress': {
          height: '3px',
          borderRadius: '2px',
          background: 'rgba(155,142,216,0.08)',
          '&::-webkit-progress-bar': {
            background: 'rgba(155,142,216,0.08)',
            borderRadius: '2px',
          },
          '&::-webkit-progress-value': {
            background: 'linear-gradient(90deg, #9B8ED8, #B8ADE8, #C4BAF0, #9B8ED8)',
            backgroundSize: '300% 100%',
            borderRadius: '2px',
            animation: 'swProgress 1.5s linear infinite',
          },
        },
        '.sw-close': {
          color: '#B0AEB8',
          fontSize: '24px',
          fontWeight: 300,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          '&:hover': {
            color: '#6E6B7B',
            transform: 'rotate(180deg) scale(1.1)',
            background: 'rgba(155,142,216,0.06)',
          },
          '&:active': { transform: 'rotate(180deg) scale(0.95)' },
        },
        '.sw-toast': {
          borderRadius: '18px !important',
          padding: '16px 22px !important',
          background: 'rgba(255,255,255,0.9) !important',
          backdropFilter: 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: 'blur(20px) saturate(200%)',
          boxShadow: `
            0 0 0 1px rgba(155,142,216,0.06),
            0 4px 12px rgba(45,43,61,0.04),
            0 12px 32px rgba(155,142,216,0.08),
            0 24px 60px rgba(155,142,216,0.06)
          `,
          fontFamily: '"Inter", "Plus Jakarta Sans", "Roboto", "Helvetica Neue", Arial, sans-serif',
          display: 'flex !important',
          alignItems: 'center',
          gap: '14px',
          width: 'auto !important',
          maxWidth: 'min(440px, calc(100vw - 32px)) !important',
          minWidth: 'min(300px, calc(100vw - 32px))',
          animation: 'swToastSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '8px',
            bottom: '8px',
            width: '4px',
            borderRadius: '2px',
            transition: 'background 0.3s ease',
          },
          '&.swal2-icon-success::before': { background: '#8BC4A8' },
          '&.swal2-icon-error::before': { background: '#E8A8B0' },
          '&.swal2-icon-warning::before': { background: '#E8CF96' },
          '&.swal2-icon-info::before': { background: '#A8C8E8' },
          '& .swal2-title': {
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#2D2B3D',
            padding: 0,
            margin: 0,
            textAlign: 'left',
            lineHeight: 1.4,
          },
          '& .swal2-icon': {
            margin: '0 !important',
            width: '32px !important',
            height: '32px !important',
            fontSize: '16px !important',
            boxShadow: 'none !important',
            animation: 'swToastIconBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          },
          '& .swal2-timer-progress-bar': {
            height: '2.5px',
            borderRadius: '2px',
            background: 'rgba(155,142,216,0.06)',
          },
          '&.swal2-top-end': {
            right: '28px',
            top: '28px',
          },
          '&.swal2-top-start': {
            left: '28px',
            top: '28px',
          },
        },
        '.sw-in': {
          animation: 'swIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        '.sw-out': {
          animation: 'swOut 0.25s cubic-bezier(0.4, 0, 1, 1) forwards',
        },
        '@keyframes swIn': {
          '0%': { opacity: 0, transform: 'scale(0.88) translateY(24px)' },
          '50%': { transform: 'scale(1.02) translateY(-2px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        '@keyframes swOut': {
          '0%': { opacity: 1, transform: 'scale(1)' },
          '100%': { opacity: 0, transform: 'scale(0.92) translateY(-12px)' },
        },
        '@keyframes swBorderGlow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        '@keyframes swIconIn': {
          '0%': { opacity: 0, transform: 'scale(0.3) rotate(-15deg)' },
          '50%': { transform: 'scale(1.15) rotate(3deg)' },
          '70%': { transform: 'scale(0.95) rotate(-1deg)' },
          '100%': { opacity: 1, transform: 'scale(1) rotate(0deg)' },
        },
        '@keyframes swIconSpring': {
          '0%': { opacity: 0, transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(0.93)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        '@keyframes swCheckTip': {
          '0%': { width: 0 },
          '100%': { width: '16px' },
        },
        '@keyframes swCheckLong': {
          '0%': { width: 0 },
          '100%': { width: '30px' },
        },
        '@keyframes swRingPulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        '@keyframes swRipple': {
          '0%': { transform: 'scale(0.8)', opacity: 1 },
          '100%': { transform: 'scale(1.5)', opacity: 0 },
        },
        '@keyframes swGlow': {
          '0%': { opacity: 0.3, transform: 'scale(1)' },
          '100%': { opacity: 1, transform: 'scale(1.2)' },
        },
        '@keyframes swShake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px) rotate(-2deg)' },
          '40%': { transform: 'translateX(4px) rotate(2deg)' },
          '60%': { transform: 'translateX(-3px) rotate(-1deg)' },
          '80%': { transform: 'translateX(2px) rotate(1deg)' },
        },
        '@keyframes swWarningBounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        '@keyframes swShimmer': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        '@keyframes swTitleUnderline': {
          '0%': { width: 0, opacity: 0 },
          '100%': { width: '36px', opacity: 1 },
        },
        '@keyframes swProgress': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '300% 0%' },
        },
        '@keyframes swToastSlideIn': {
          '0%': { opacity: 0, transform: 'translateX(32px) scale(0.92)' },
          '60%': { transform: 'translateX(-4px) scale(1.01)' },
          '100%': { opacity: 1, transform: 'translateX(0) scale(1)' },
        },
        '@keyframes swToastIconBounce': {
          '0%': { opacity: 0, transform: 'scale(0) rotate(-90deg)' },
          '60%': { transform: 'scale(1.2) rotate(10deg)' },
          '100%': { opacity: 1, transform: 'scale(1) rotate(0deg)' },
        },
        '@keyframes swSpin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 22px',
          fontSize: '0.9rem',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(155,142,216,0.25)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #9B8ED8 0%, #B8ADE8 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7B6FC0 0%, #9B8ED8 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #F2B5AE 0%, #F8D0CC 100%)',
          color: '#2D2B3D',
          '&:hover': {
            background: 'linear-gradient(135deg, #D9928A 0%, #F2B5AE 100%)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          borderColor: 'rgba(155,142,216,0.3)',
          '&:hover': {
            borderWidth: 1.5,
            borderColor: '#9B8ED8',
            background: 'rgba(155,142,216,0.06)',
          },
        },
        text: {
          '&:hover': {
            background: 'rgba(155,142,216,0.08)',
          },
        },
        sizeSmall: {
          padding: '6px 14px',
          fontSize: '0.8rem',
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '1rem',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: '0 1px 3px rgba(155,142,216,0.08), 0 1px 2px rgba(155,142,216,0.04)',
          color: '#2D2B3D',
          borderBottom: '1px solid rgba(155,142,216,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '2px 0 24px rgba(155,142,216,0.06)',
          backgroundColor: '#FFFFFF',
          backgroundImage: 'linear-gradient(180deg, rgba(155,142,216,0.02) 0%, rgba(242,181,174,0.02) 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(155,142,216,0.06), 0 1px 2px rgba(155,142,216,0.04)',
          borderRadius: 12,
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(155,142,216,0.06), 0 1px 2px rgba(155,142,216,0.04)',
        },
        elevation2: {
          boxShadow: '0 4px 6px rgba(155,142,216,0.07), 0 2px 4px rgba(155,142,216,0.04)',
        },
        elevation3: {
          boxShadow: '0 10px 25px rgba(155,142,216,0.08), 0 4px 10px rgba(155,142,216,0.04)',
        },
        elevation4: {
          boxShadow: '0 14px 35px rgba(155,142,216,0.1), 0 6px 12px rgba(155,142,216,0.05)',
        },
        elevation8: {
          boxShadow: '0 20px 50px rgba(155,142,216,0.12), 0 8px 20px rgba(155,142,216,0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 1px 3px rgba(155,142,216,0.06), 0 1px 2px rgba(155,142,216,0.04)',
          transition: 'box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            boxShadow: '0 14px 35px rgba(155,142,216,0.1), 0 6px 12px rgba(155,142,216,0.05)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#6E6B7B',
            backgroundColor: 'rgba(155,142,216,0.04)',
            borderBottom: '2px solid rgba(155,142,216,0.1)',
            paddingTop: 14,
            paddingBottom: 14,
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            transition: 'background-color 0.2s ease',
            '&:hover': { backgroundColor: 'rgba(155,142,216,0.03)' },
            '&:last-child .MuiTableCell-body': { borderBottom: 'none' },
          },
          '& .MuiTableCell-body': {
            padding: '12px 16px',
            fontSize: '0.875rem',
            borderBottom: '1px solid rgba(155,142,216,0.06)',
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { borderTop: '1px solid rgba(155,142,216,0.06)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.7rem' },
        outlined: {
          borderColor: 'rgba(155,142,216,0.25)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#B8ADE8',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#9B8ED8',
              borderWidth: 2,
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(155,142,216,0.1)',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#9B8ED8',
            fontWeight: 500,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          padding: 4,
          boxShadow: '0 25px 60px rgba(155,142,216,0.15), 0 8px 20px rgba(155,142,216,0.08)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
          background: 'rgba(45,43,61,0.92)',
          backdropFilter: 'blur(4px)',
          padding: '6px 12px',
        },
        arrow: { color: 'rgba(45,43,61,0.92)' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(155,142,216,0.08)' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '3px 8px',
          padding: '10px 16px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(155,142,216,0.07)',
            transform: 'translateX(2px)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(155,142,216,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(155,142,216,0.14)',
            },
            '& .MuiListItemIcon-root': { color: '#9B8ED8' },
            '& .MuiListItemText-primary': { color: '#9B8ED8', fontWeight: 600 },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { minWidth: 40, color: '#6E6B7B' },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#9B8ED8',
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
        root: {
          '& .MuiTab-root.Mui-selected': { color: '#9B8ED8', fontWeight: 600 },
          '& .MuiTab-root': { transition: 'all 0.2s ease' },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 10px 35px rgba(155,142,216,0.12), 0 4px 10px rgba(155,142,216,0.06)',
          border: '1px solid rgba(155,142,216,0.06)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#8BC4A8',
          },
          '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: 'rgba(139,196,168,0.4)',
          },
        },
        track: {
          borderRadius: 12,
          backgroundColor: 'rgba(155,142,216,0.15)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
        standardSuccess: { backgroundColor: 'rgba(139,196,168,0.12)', color: '#1B3B2B' },
        standardWarning: { backgroundColor: 'rgba(232,207,150,0.12)', color: '#3D351B' },
        standardError: { backgroundColor: 'rgba(232,168,176,0.12)', color: '#3D1B1B' },
        standardInfo: { backgroundColor: 'rgba(168,200,232,0.12)', color: '#1B2B3D' },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          background: 'rgba(45,43,61,0.3)',
          backdropFilter: 'blur(4px)',
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 10px 35px rgba(155,142,216,0.15)',
        },
      },
    },
  },
})

export default theme
