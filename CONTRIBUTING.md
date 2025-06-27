# 🤝 **Contributing to EcoSentinel**

Thank you for your interest in contributing to EcoSentinel! We're building the future of environmental intelligence together, and every contribution makes a difference in fighting climate change.

---

## 🌟 **Ways to Contribute**

- 🐛 **Bug Reports**: Help us identify and fix issues
- 💡 **Feature Requests**: Suggest new environmental monitoring features
- 🔧 **Code Contributions**: Implement features, fix bugs, improve performance
- 📚 **Documentation**: Improve guides, API docs, and tutorials
- 🎨 **Design**: UI/UX improvements and accessibility enhancements
- 🧪 **Testing**: Write tests, improve test coverage
- 🌍 **Translations**: Help make EcoSentinel accessible globally
- 📊 **Data**: Contribute environmental datasets and AI model improvements

---

## 🚀 **Quick Start for Contributors**

### **1. Fork and Clone**
```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/ecosentinel.git
cd ecosentinel

# Add upstream remote
git remote add upstream https://github.com/original-owner/ecosentinel.git
```

### **2. Set Up Development Environment**
```bash
# Install dependencies
npm install
pip install -r ai/requirements.txt

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### **3. Create Feature Branch**
```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes:
git checkout -b fix/bug-description
```

### **4. Make Your Changes**
- Write clean, documented code
- Follow existing code style
- Add tests for new features
- Update documentation

### **5. Test Your Changes**
```bash
# Run all tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check

# Build to ensure no errors
npm run build
```

### **6. Submit Pull Request**
```bash
# Commit your changes
git add .
git commit -m "feat: add new environmental metric tracking"

# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

---

## 📋 **Development Guidelines**

### **Code Style**

#### **TypeScript/JavaScript**
```typescript
// ✅ Good
interface EnvironmentalData {
  location: string;
  timestamp: string;
  airQuality: number;
  temperature: number;
}

const getEnvironmentalData = async (location: string): Promise<EnvironmentalData> => {
  try {
    const response = await fetch(`/api/environmental-data?location=${location}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch environmental data:', error);
    throw error;
  }
};

// ❌ Avoid
function getData(loc) {
  return fetch('/api/environmental-data?location=' + loc).then(r => r.json());
}
```

#### **Python**
```python
# ✅ Good
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class EnvironmentalPredictor:
    """AI model for environmental predictions."""
    
    def __init__(self, model_path: str) -> None:
        self.model_path = model_path
        self.model = self._load_model()
    
    def predict(self, data: Dict[str, float]) -> Dict[str, float]:
        """Generate environmental predictions."""
        try:
            return self.model.predict(data)
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise

# ❌ Avoid
def predict(data):
    return model.predict(data)
```

### **Commit Messages**
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description

# Types:
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: maintenance tasks

# Examples:
feat(api): add carbon footprint prediction endpoint
fix(websocket): resolve connection timeout issues
docs(readme): update installation instructions
test(ai): add unit tests for prediction models
```

### **Branch Naming**
```bash
# Feature branches
feature/add-biodiversity-tracking
feature/improve-ai-accuracy

# Bug fix branches
fix/websocket-connection-error
fix/memory-leak-in-ai-service

# Documentation branches
docs/api-documentation-update
docs/contributing-guide

# Chore branches
chore/update-dependencies
chore/improve-build-process
```

---

## 🧪 **Testing Guidelines**

### **Writing Tests**
```typescript
// Component tests
import { render, screen } from '@testing-library/react';
import { EnvironmentalDashboard } from '@/components/EnvironmentalDashboard';

describe('EnvironmentalDashboard', () => {
  it('displays environmental metrics correctly', () => {
    const mockData = {
      airQuality: 75,
      temperature: 22.5,
      location: 'San Francisco'
    };

    render(<EnvironmentalDashboard data={mockData} />);
    
    expect(screen.getByText('Air Quality: 75 AQI')).toBeInTheDocument();
    expect(screen.getByText('Temperature: 22.5°C')).toBeInTheDocument();
    expect(screen.getByText('San Francisco')).toBeInTheDocument();
  });

  it('handles loading state properly', () => {
    render(<EnvironmentalDashboard data={null} />);
    expect(screen.getByText('Loading environmental data...')).toBeInTheDocument();
  });
});
```

```python
# AI model tests
import unittest
from unittest.mock import Mock, patch
from ai.models.air_quality_predictor import AirQualityPredictor

class TestAirQualityPredictor(unittest.TestCase):
    def setUp(self):
        self.predictor = AirQualityPredictor('test_model.pkl')
    
    def test_prediction_accuracy(self):
        """Test prediction accuracy with known data."""
        test_data = {
            'temperature': 25.0,
            'humidity': 60.0,
            'wind_speed': 10.0
        }
        
        prediction = self.predictor.predict(test_data)
        
        self.assertIsInstance(prediction, dict)
        self.assertIn('air_quality', prediction)
        self.assertGreaterEqual(prediction['air_quality'], 0)
        self.assertLessEqual(prediction['air_quality'], 500)
    
    @patch('ai.models.air_quality_predictor.joblib.load')
    def test_model_loading_error(self, mock_load):
        """Test handling of model loading errors."""
        mock_load.side_effect = FileNotFoundError("Model file not found")
        
        with self.assertRaises(FileNotFoundError):
            AirQualityPredictor('nonexistent_model.pkl')
```

### **Test Coverage Requirements**
- **New features**: 90%+ test coverage
- **Bug fixes**: Include regression tests
- **Critical paths**: 100% coverage (authentication, data processing)

---

## 🎨 **Design Guidelines**

### **UI/UX Principles**
1. **Accessibility First**: WCAG 2.1 AA compliance
2. **Mobile Responsive**: Works on all device sizes
3. **Performance**: <200ms interactions, <3s page loads
4. **Consistency**: Follow design system patterns
5. **Environmental Theme**: Green color palette, nature-inspired

### **Component Structure**
```typescript
// ✅ Good component structure
interface EnvironmentalCardProps {
  metric: string;
  value: number;
  unit: string;
  status: 'good' | 'moderate' | 'poor';
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

export const EnvironmentalCard: React.FC<EnvironmentalCardProps> = ({
  metric,
  value,
  unit,
  status,
  trend,
  className
}) => {
  return (
    <div 
      className={`environmental-card ${className}`}
      role="region"
      aria-label={`${metric} information`}
    >
      <h3 className="metric-title">{metric}</h3>
      <div className="metric-value">
        <span className="value">{value}</span>
        <span className="unit">{unit}</span>
      </div>
      <div className={`status status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
      {trend && (
        <div className={`trend trend-${trend}`}>
          <TrendIcon direction={trend} />
        </div>
      )}
    </div>
  );
};
```

### **CSS/Styling**
```css
/* ✅ Good CSS practices */
.environmental-card {
  /* Use CSS custom properties for theming */
  background: var(--card-background);
  border: 1px solid var(--card-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  
  /* Smooth transitions */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Accessibility */
  &:focus-visible {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }
}

/* Status-specific styling */
.status-good { color: var(--success-color); }
.status-moderate { color: var(--warning-color); }
.status-poor { color: var(--error-color); }
```

---

## 🔧 **API Development**

### **Adding New Endpoints**
```typescript
// 1. Define types
interface BiodiversityData {
  location: string;
  species_count: number;
  diversity_index: number;
  threat_level: 'low' | 'medium' | 'high';
}

// 2. Create controller
export const getBiodiversityData = async (req: Request, res: Response) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_LOCATION',
          message: 'Location parameter is required'
        }
      });
    }

    const data = await biodiversityService.getData(location as string);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Failed to fetch biodiversity data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch biodiversity data'
      }
    });
  }
};

// 3. Add route
router.get('/biodiversity', authenticateToken, getBiodiversityData);

// 4. Add tests
describe('GET /biodiversity', () => {
  it('returns biodiversity data for valid location', async () => {
    const response = await request(app)
      .get('/api/v1/biodiversity?location=Amazon')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('species_count');
  });
});
```

### **Database Migrations**
```sql
-- migrations/001_add_biodiversity_table.sql
CREATE TABLE biodiversity_data (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    species_count INTEGER NOT NULL,
    diversity_index DECIMAL(5,2) NOT NULL,
    threat_level VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_biodiversity_location ON biodiversity_data(location);
CREATE INDEX idx_biodiversity_recorded_at ON biodiversity_data(recorded_at);
```

---

## 🤖 **AI/ML Contributions**

### **Adding New Models**
```python
# ai/models/new_model.py
import joblib
import numpy as np
from typing import Dict, List
from .base_model import BaseEnvironmentalModel

class NewEnvironmentalModel(BaseEnvironmentalModel):
    """New environmental prediction model."""
    
    def __init__(self, model_path: str):
        super().__init__(model_path)
        self.feature_names = [
            'temperature', 'humidity', 'pressure', 
            'wind_speed', 'solar_radiation'
        ]
    
    def preprocess_data(self, raw_data: Dict) -> np.ndarray:
        """Preprocess raw environmental data for model input."""
        features = []
        for feature in self.feature_names:
            if feature not in raw_data:
                raise ValueError(f"Missing required feature: {feature}")
            features.append(raw_data[feature])
        
        return np.array(features).reshape(1, -1)
    
    def predict(self, data: Dict) -> Dict:
        """Generate predictions with confidence intervals."""
        processed_data = self.preprocess_data(data)
        
        # Main prediction
        prediction = self.model.predict(processed_data)[0]
        
        # Confidence estimation (if model supports it)
        if hasattr(self.model, 'predict_proba'):
            confidence = np.max(self.model.predict_proba(processed_data))
        else:
            confidence = 0.85  # Default confidence
        
        return {
            'prediction': float(prediction),
            'confidence': float(confidence),
            'model_version': self.version,
            'features_used': self.feature_names
        }
    
    def explain_prediction(self, data: Dict) -> Dict:
        """Provide explanation for the prediction."""
        # Feature importance analysis
        feature_importance = self.get_feature_importance()
        
        explanation = {
            'top_factors': [],
            'reasoning': ""
        }
        
        # Sort features by importance
        for i, feature in enumerate(self.feature_names):
            importance = feature_importance[i]
            if importance > 0.1:  # Only include significant factors
                explanation['top_factors'].append({
                    'feature': feature,
                    'importance': float(importance),
                    'value': data[feature]
                })
        
        return explanation
```

### **Model Training Pipeline**
```python
# ai/training/train_new_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def train_new_model(data_path: str, output_path: str):
    """Train new environmental prediction model."""
    
    # Load and prepare data
    df = pd.read_csv(data_path)
    
    # Feature engineering
    features = ['temperature', 'humidity', 'pressure', 'wind_speed']
    X = df[features]
    y = df['target_variable']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train model
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Model Performance:")
    print(f"MAE: {mae:.4f}")
    print(f"R²: {r2:.4f}")
    
    # Save model
    joblib.dump(model, output_path)
    
    return {
        'mae': mae,
        'r2': r2,
        'feature_importance': dict(zip(features, model.feature_importances_))
    }

if __name__ == "__main__":
    results = train_new_model('data/training_data.csv', 'models/new_model.pkl')
    print("Training completed:", results)
```

---

## 📚 **Documentation Contributions**

### **Documentation Standards**
- **Clear and Concise**: Easy to understand for all skill levels
- **Code Examples**: Include working code snippets
- **Screenshots**: Visual guides for UI features
- **Up-to-date**: Keep documentation current with code changes

### **Documentation Structure**
```markdown
# Feature Name

## Overview
Brief description of what this feature does and why it's useful.

## Quick Start
```bash
# Minimal example to get started
npm run feature-command
```

## Detailed Usage
### Basic Usage
```typescript
// Simple example
const result = useFeature();
```

### Advanced Usage
```typescript
// Complex example with all options
const result = useFeature({
  option1: 'value1',
  option2: true,
  callbacks: {
    onSuccess: (data) => console.log(data),
    onError: (error) => console.error(error)
  }
});
```

## API Reference
### Parameters
- `param1` (string, required): Description of parameter
- `param2` (boolean, optional): Description with default value

### Returns
Returns a `Promise<FeatureResult>` with the following structure:
```typescript
interface FeatureResult {
  success: boolean;
  data?: any;
  error?: string;
}
```

## Examples
### Real-world Example
```typescript
// Practical example showing common use case
```

## Troubleshooting
### Common Issues
**Issue**: Description of problem
**Solution**: How to fix it

## Related
- [Related Feature 1](link)
- [Related Feature 2](link)
```

---

## 🌍 **Internationalization (i18n)**

### **Adding Translations**
```typescript
// locales/en.json
{
  "dashboard": {
    "title": "Environmental Dashboard",
    "airQuality": "Air Quality",
    "temperature": "Temperature",
    "loading": "Loading environmental data..."
  },
  "alerts": {
    "highPollution": "High pollution levels detected",
    "extremeWeather": "Extreme weather conditions"
  }
}

// locales/es.json
{
  "dashboard": {
    "title": "Panel Ambiental",
    "airQuality": "Calidad del Aire",
    "temperature": "Temperatura",
    "loading": "Cargando datos ambientales..."
  },
  "alerts": {
    "highPollution": "Niveles altos de contaminación detectados",
    "extremeWeather": "Condiciones climáticas extremas"
  }
}
```

### **Using Translations**
```typescript
import { useTranslation } from 'next-i18next';

export const Dashboard = () => {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.loading')}</p>
    </div>
  );
};
```

---

## 🐛 **Bug Reports**

### **Bug Report Template**
```markdown
**Bug Description**
A clear and concise description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear description of what you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96.0]
- Node.js Version: [e.g. 18.0.0]
- EcoSentinel Version: [e.g. 1.0.0]

**Additional Context**
Add any other context about the problem here.

**Logs**
```
Paste relevant logs here
```
```

---

## 💡 **Feature Requests**

### **Feature Request Template**
```markdown
**Feature Summary**
A brief, clear description of the feature you'd like to see.

**Problem Statement**
What problem does this feature solve? Who would benefit from it?

**Proposed Solution**
Describe your ideal solution to the problem.

**Alternative Solutions**
Describe any alternative solutions you've considered.

**Use Cases**
Provide specific examples of how this feature would be used.

**Environmental Impact**
How would this feature help with environmental monitoring or climate action?

**Additional Context**
Add any other context, mockups, or examples about the feature request.
```

---

## 🏆 **Recognition**

### **Contributors Hall of Fame**
We recognize and celebrate our contributors:

- **🌟 Core Contributors**: Major feature development and maintenance
- **🐛 Bug Hunters**: Finding and fixing critical issues
- **📚 Documentation Heroes**: Improving guides and tutorials
- **🎨 Design Champions**: UI/UX improvements
- **🌍 Translation Team**: Making EcoSentinel globally accessible
- **🧪 Testing Experts**: Ensuring quality and reliability

### **Contribution Rewards**
- **GitHub Profile Recognition**: Featured in our contributors section
- **EcoSentinel Swag**: T-shirts, stickers, and eco-friendly merchandise
- **Conference Opportunities**: Speaking opportunities at environmental tech events
- **Early Access**: Beta features and exclusive previews
- **Mentorship**: Connect with environmental tech leaders

---

## 📞 **Getting Help**

### **Communication Channels**
- **💬 Slack**: [StackOverflow Teams](https://stackoverflowteams.com/c/morningstarxcdcode/users/1/)
- **📧 Email**: [morningstar.xcd@gmail.com](mailto:morningstar.xcd@gmail.com)
- **💼 LinkedIn**: [Sourav Rajak](https://www.linkedin.com/in/sourav-rajak-6294682b2/)
- **🐛 GitHub Issues**: For bug reports and feature requests
- **📖 Discussions**: For questions and general discussion

### **Mentorship Program**
New to open source? We offer mentorship for:
- First-time contributors
- Students and early-career developers
- Environmental scientists interested in tech
- Anyone passionate about climate action

### **Office Hours**
Join our weekly contributor office hours:
- **When**: Fridays 2-3 PM UTC
- **Where**: Discord voice channel
- **What**: Q&A, code reviews, planning discussions

---

## 📜 **Code of Conduct**

### **Our Pledge**
We are committed to making participation in EcoSentinel a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### **Our Standards**
**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

### **Enforcement**
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at conduct@ecosentinel.com. All complaints will be reviewed and investigated promptly and fairly.

---

## 🎯 **Roadmap and Priorities**

### **Current Priorities**
1. **🌡️ Climate Data Integration**: More comprehensive climate datasets
2. **🤖 AI Model Improvements**: Better prediction accuracy and explainability
3. **📱 Mobile App**: Native iOS and Android applications
4. **🌍 Global Expansion**: Support for more cities and regions
5. **♿ Accessibility**: WCAG 2.1 AAA compliance

### **Future Vision**
- **🛰️ Satellite Integration**: Real-time satellite environmental data
- **🏭 Industrial Monitoring**: Corporate environmental impact tracking
- **🏛️ Policy Tools**: Government decision-making support
- **🎓 Educational Platform**: Environmental science learning resources
- **🤝 Community Actions**: Coordinated environmental initiatives

---

## 📈 **Impact Metrics**

Help us track our environmental impact:
- **🌍 Global Coverage**: Cities and regions monitored
- **📊 Data Points**: Environmental measurements processed
- **🔮 Predictions**: AI forecasts generated
- **👥 Community**: Active users and contributors
- **🌱 Actions**: Environmental actions inspired

---

## 🙏 **Thank You**

Every contribution to EcoSentinel, no matter how small, helps us build a better future for our planet. Whether you're fixing a typo, adding a feature, or spreading awareness, you're making a difference in the fight against climate change.

**Together, we can build the tools needed to understand, monitor, and protect our environment. Thank you for being part of the solution! 🌍💚**

---

## 📄 **License**

By contributing to EcoSentinel, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

**Ready to contribute? [Start here](https://github.com/morningstarxcdcode/ecosentinel/issues/good-first-issue) with a good first issue! 🚀**
