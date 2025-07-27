import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Switch, FormControlLabel, Tooltip, styled, Box } from '@mui/material';
import { LightMode as LightModeIcon, DarkMode as DarkModeIcon } from '@mui/icons-material';

// Mock ThemeToggle component for Storybook to avoid context issues
interface MockThemeToggleProps {
  showLabel?: boolean;
  isDarkMode?: boolean;
  onToggle?: () => void;
}

// Replicate the styling from the original component
const trackStyles = {
  opacity: 1,
  backgroundColor: '#aab4be',
  borderRadius: 10,
};

const darkTrackStyles = {
  backgroundColor: '#8796A5',
};

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& + .MuiSwitch-track': {
        ...trackStyles,
        ...theme.applyStyles('dark', darkTrackStyles),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: 'transparent',
    width: 32,
    height: 32,
    border: 'none',
    boxShadow: 'none',
  },
  '& .MuiSwitch-track': {
    ...trackStyles,
    ...theme.applyStyles('dark', darkTrackStyles),
  },
}));

const createIconBox = (backgroundColor: string, shadowIntensity: number) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  backgroundColor,
  borderRadius: '50%',
  boxShadow: `0 2px 8px rgba(0,0,0,${shadowIntensity})`,
});

const MockThemeToggle: React.FC<MockThemeToggleProps> = ({
  showLabel = false,
  isDarkMode = false,
  onToggle = fn()
}) => {
  const mode = isDarkMode ? 'dark' : 'light';

  const createIcon = (type: 'light' | 'dark') => {
    const config = {
      light: {
        backgroundColor: '#ffa000',
        shadowIntensity: 0.3,
        IconComponent: LightModeIcon,
        iconColor: '#ffffff',
      },
      dark: {
        backgroundColor: '#003892',
        shadowIntensity: 0.5,
        IconComponent: DarkModeIcon,
        iconColor: '#90caf9',
      },
    }[type];
    
    const { IconComponent, iconColor, backgroundColor, shadowIntensity } = config;
    
    return (
      <Box sx={createIconBox(backgroundColor, shadowIntensity)}>
        <IconComponent sx={{
          fontSize: 18,
          color: iconColor
        }} />
      </Box>
    );
  };

  const switchControl = (
    <MaterialUISwitch
      checked={isDarkMode}
      onChange={onToggle}
      icon={createIcon('light')}
      checkedIcon={createIcon('dark')}
    />
  );

  if (showLabel) {
    return (
      <FormControlLabel
        control={switchControl}
        label={`${mode === 'light' ? 'Light' : 'Dark'} Mode`}
        labelPlacement="start"
        sx={{
          margin: 0,
          '& .MuiFormControlLabel-label': {
            fontSize: '1rem',
            fontWeight: 500,
          },
        }}
      />
    );
  }

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`} arrow>
      {switchControl}
    </Tooltip>
  );
};

// Simple wrapper that provides visual context
const StoryWrapper: React.FC<{ 
  children: React.ReactNode; 
  theme?: 'light' | 'dark' 
}> = ({ children, theme = 'light' }) => {
  return (
    <div style={{ 
      padding: '30px', 
      backgroundColor: theme === 'light' ? '#ffffff' : '#121212',
      color: theme === 'light' ? '#000000' : '#ffffff',
      borderRadius: '8px',
      border: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333333'}`,
      minWidth: '300px'
    }}>
      <div style={{ marginBottom: '20px', fontSize: '14px', opacity: 0.7 }}>
        Current theme: <strong>{theme}</strong>
      </div>
      {children}
      <div style={{ marginTop: '20px', fontSize: '12px', opacity: 0.6 }}>
        Note: This is a mocked version for Storybook demonstration
      </div>
    </div>
  );
};

const meta = {
  title: 'UI/ThemeToggle',
  component: MockThemeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A theme toggle switch component that allows users to switch between light and dark modes. Features custom icons and smooth animations. This is a mocked version for Storybook.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showLabel: {
      control: 'boolean',
      description: 'Whether to show a text label next to the toggle',
    },
    isDarkMode: {
      control: 'boolean',
      description: 'Whether the toggle is in dark mode',
    },
    onToggle: {
      action: 'toggled',
      description: 'Function called when the toggle is clicked',
    },
  },
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
  args: {
    onToggle: fn(),
  },
} satisfies Meta<typeof MockThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithLabel: Story = {
  args: {
    showLabel: true,
  },
};

export const LightMode: Story = {
  args: {
    isDarkMode: false,
  },
  decorators: [
    (Story) => (
      <StoryWrapper theme="light">
        <Story />
      </StoryWrapper>
    ),
  ],
};

export const DarkMode: Story = {
  args: {
    isDarkMode: true,
  },
  decorators: [
    (Story) => (
      <StoryWrapper theme="dark">
        <Story />
      </StoryWrapper>
    ),
  ],
};

export const LightModeWithLabel: Story = {
  args: {
    showLabel: true,
    isDarkMode: false,
  },
  decorators: [
    (Story) => (
      <StoryWrapper theme="light">
        <Story />
      </StoryWrapper>
    ),
  ],
};

export const DarkModeWithLabel: Story = {
  args: {
    showLabel: true,
    isDarkMode: true,
  },
  decorators: [
    (Story) => (
      <StoryWrapper theme="dark">
        <Story />
      </StoryWrapper>
    ),
  ],
};

export const AllStates: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '400px' }}>
      <div>
        <h3>Light Mode</h3>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ffffff',
          color: '#000000',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px' }}>Default</div>
              <MockThemeToggle isDarkMode={false} onToggle={fn()} />
            </div>
            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px' }}>With Label</div>
              <MockThemeToggle showLabel isDarkMode={false} onToggle={fn()} />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3>Dark Mode</h3>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#121212',
          color: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #333333'
        }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px' }}>Default</div>
              <MockThemeToggle isDarkMode={true} onToggle={fn()} />
            </div>
            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px' }}>With Label</div>
              <MockThemeToggle showLabel isDarkMode={true} onToggle={fn()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All possible states of the ThemeToggle component displayed in both light and dark theme contexts.',
      },
    },
  },
}; 