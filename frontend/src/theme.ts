import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#0d1b4a', light: '#1a2d6e', dark: '#080f2e' },
    secondary: { main: '#c99700', light: '#e6b422', dark: '#a67c00' },
    background: { default: '#f0f2f5', paper: '#ffffff' },
    success: { main: '#2e7d32', light: '#4caf50' },
    warning: { main: '#ed6c02', light: '#ff9800' },
    error: { main: '#c62828', light: '#ef5350' },
    info: { main: '#1565c0', light: '#42a5f5' },
    text: { primary: '#1a1a2e', secondary: '#555770' },
    divider: 'rgba(0,0,0,0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.01em' },
    h5: { fontWeight: 600, fontSize: '1.35rem', letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, fontSize: '1.1rem' },
    subtitle1: { fontWeight: 500, fontSize: '0.95rem', color: '#555770' },
    body2: { fontSize: '0.875rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '@import': 'url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap")',
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: '0.9rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0d1b4a 0%, #1a2d6e 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #080f2e 0%, #0d1b4a 100%)' },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #c99700 0%, #e6b422 100%)',
          color: '#fff',
          '&:hover': { background: 'linear-gradient(135deg, #a67c00 0%, #c99700 100%)' },
        },
        outlined: { borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0d1b4a 0%, #1a2d6e 100%)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          borderRadius: 10,
        },
        elevation1: { boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' },
        elevation2: { boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)' },
        elevation3: { boxShadow: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#555770',
            backgroundColor: '#f8f9fc',
            borderBottom: '2px solid #e8eaf0',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: '#f8f9fc' },
            '&:last-child .MuiTableCell-body': { borderBottom: 'none' },
          },
          '& .MuiTableCell-body': {
            padding: '12px 16px',
            fontSize: '0.875rem',
            borderBottom: '1px solid #f0f2f5',
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { borderTop: '1px solid #f0f2f5' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1a2d6e' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0d1b4a', borderWidth: 2 },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#0d1b4a', fontWeight: 500 },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, padding: 4 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 6, fontSize: '0.75rem' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(0,0,0,0.06)' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          padding: '10px 16px',
          '&:hover': { backgroundColor: 'rgba(13,27,74,0.06)' },
          '&.Mui-selected': {
            backgroundColor: 'rgba(13,27,74,0.1)',
            '&:hover': { backgroundColor: 'rgba(13,27,74,0.14)' },
            '& .MuiListItemIcon-root': { color: '#0d1b4a' },
            '& .MuiListItemText-primary': { color: '#0d1b4a', fontWeight: 600 },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { minWidth: 40, color: '#555770' },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#c99700', height: 3, borderRadius: '3px 3px 0 0' },
        root: {
          '& .MuiTab-root.Mui-selected': { color: '#0d1b4a', fontWeight: 600 },
        },
      },
    },
  },
})

export default theme
