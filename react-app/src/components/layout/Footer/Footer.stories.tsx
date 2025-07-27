import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Footer from './Footer';

// Create themes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Extended story args interface
interface FooterStoryArgs {
  isDarkMode?: boolean;
  showPageContent?: boolean;
  contentHeight?: 'short' | 'medium' | 'tall';
}

// Wrapper component with all providers
const FooterWrapper = ({ args }: { args: FooterStoryArgs }) => {
  const getContentHeight = () => {
    switch (args.contentHeight) {
      case 'short': return '200px';
      case 'medium': return '400px';
      case 'tall': return '800px';
      default: return '300px';
    }
  };

  return (
    <BrowserRouter>
      <ThemeProvider theme={args.isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Box 
          sx={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: args.isDarkMode ? '#121212' : '#ffffff',
          }}
        >
          {args.showPageContent && (
            <Box 
              sx={{ 
                flex: 1,
                padding: '20px',
                backgroundColor: args.isDarkMode ? '#1e1e1e' : '#f5f5f5',
                minHeight: getContentHeight(),
              }}
            >
              <h1 style={{ color: args.isDarkMode ? 'white' : 'black' }}>
                Sample Page Content
              </h1>
              <p style={{ color: args.isDarkMode ? '#ccc' : '#666' }}>
                This represents the main page content. The footer should stick to the bottom 
                of the page. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p style={{ color: args.isDarkMode ? '#ccc' : '#666' }}>
                Content height: {args.contentHeight || 'medium'}
              </p>
            </Box>
          )}
          <Footer />
        </Box>
      </ThemeProvider>
    </BrowserRouter>
  );
};

const meta: Meta<FooterStoryArgs> = {
  title: 'Layout/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main footer component that provides project information, social links, and navigation. Features responsive design and adapts to different themes.',
      },
    },
  },
  argTypes: {
    isDarkMode: {
      description: 'Whether to use dark theme',
      control: 'boolean',
    },
    showPageContent: {
      description: 'Whether to show page content above footer',
      control: 'boolean',
    },
    contentHeight: {
      description: 'Height of page content for testing footer positioning',
      control: { type: 'select' },
      options: ['short', 'medium', 'tall'],
    },
  },
  render: (args) => <FooterWrapper args={args} />,
};

export default meta;
type Story = StoryObj<FooterStoryArgs>;

// Basic Footer States
export const Default: Story = {
  args: {
    isDarkMode: false,
    showPageContent: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default footer in light mode with logo, navigation links, and social media icons.',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    isDarkMode: true,
    showPageContent: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer in dark mode showing proper theme adaptation.',
      },
    },
  },
};

// Footer with Page Content
export const WithPageContent: Story = {
  args: {
    isDarkMode: false,
    showPageContent: true,
    contentHeight: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer positioned at the bottom of a page with medium-height content.',
      },
    },
  },
};

export const WithPageContentDark: Story = {
  args: {
    isDarkMode: true,
    showPageContent: true,
    contentHeight: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer in dark mode positioned at the bottom of a page with content.',
      },
    },
  },
};

export const WithShortContent: Story = {
  args: {
    isDarkMode: false,
    showPageContent: true,
    contentHeight: 'short',
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer with short page content - should stick to bottom of viewport.',
      },
    },
  },
};

export const WithTallContent: Story = {
  args: {
    isDarkMode: false,
    showPageContent: true,
    contentHeight: 'tall',
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer with tall page content - appears after scrolling down.',
      },
    },
  },
};

// Responsive States
export const MobileView: Story = {
  args: {
    isDarkMode: false,
    showPageContent: true,
    contentHeight: 'medium',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile view of footer with responsive layout adjustments.',
      },
    },
  },
};

export const MobileViewDark: Story = {
  args: {
    isDarkMode: true,
    showPageContent: true,
    contentHeight: 'medium',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile view of footer in dark mode.',
      },
    },
  },
};

export const TabletView: Story = {
  args: {
    isDarkMode: false,
    showPageContent: true,
    contentHeight: 'medium',
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Tablet view of footer showing intermediate responsive state.',
      },
    },
  },
};

// Isolated Components Testing
export const FooterOnly: Story = {
  args: {
    isDarkMode: false,
    showPageContent: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer component in isolation for detailed inspection of layout and styling.',
      },
    },
  },
};

export const FooterOnlyDark: Story = {
  args: {
    isDarkMode: true,
    showPageContent: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer component in dark mode for detailed inspection.',
      },
    },
  },
};

// Social Links Testing
export const SocialLinksInspection: Story = {
  args: {
    isDarkMode: false,
    showPageContent: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer focused on social media links and their hover states. Check external links open in new tabs.',
      },
    },
  },
}; 