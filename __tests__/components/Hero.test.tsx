import { render, screen } from '@testing-library/react'
import { Hero } from '../../components/sections/Hero'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Users: () => <div data-testid="users-icon" />,
}))

describe('Hero Component', () => {
  beforeEach(() => {
    // Mock useEffect and setInterval
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the main heading correctly', () => {
    render(<Hero />)
    
    expect(screen.getByText(/Environmental/)).toBeInTheDocument()
    expect(screen.getByText(/Intelligence/)).toBeInTheDocument()
    expect(screen.getByText(/for Everyone/)).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<Hero />)
    
    expect(screen.getByText(/Real-time environmental monitoring powered by explainable AI/)).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    render(<Hero />)
    
    expect(screen.getByText('Start Monitoring')).toBeInTheDocument()
    expect(screen.getByText('View Live Demo')).toBeInTheDocument()
  })

  it('renders trust indicators', () => {
    render(<Hero />)
    
    expect(screen.getByText('Live Data')).toBeInTheDocument()
    expect(screen.getByText('Enterprise Security')).toBeInTheDocument()
    expect(screen.getByText('94% AI Accuracy')).toBeInTheDocument()
  })

  it('renders the AI-Powered Climate Action badge', () => {
    render(<Hero />)
    
    expect(screen.getByText('AI-Powered Climate Action')).toBeInTheDocument()
  })

  it('renders stats section with Real-Time Impact heading', () => {
    render(<Hero />)
    
    expect(screen.getByText('Real-Time Impact')).toBeInTheDocument()
    expect(screen.getByText('Live environmental monitoring across the globe')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<Hero />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    
    buttons.forEach(button => {
      expect(button).toBeVisible()
    })
  })

  it('renders icons correctly', () => {
    render(<Hero />)
    
    expect(screen.getAllByTestId('zap-icon')).toHaveLength(3) // Badge, trust indicator, and floating element
    expect(screen.getAllByTestId('globe-icon')).toHaveLength(2) // Stats and floating element
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
  })
})
