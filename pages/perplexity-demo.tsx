import React from 'react';
import PerplexitySearch from '../components/PerplexitySearch';

const PerplexityDemo: React.FC = () => {
  const handleResponse = (response: any) => {
    console.log('Received response:', response);
    // You can handle responses here for analytics, logging, etc.
  };

  const handleError = (error: string) => {
    console.error('Search error:', error);
    // You can handle errors here for error tracking, notifications, etc.
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <PerplexitySearch
        apiEndpoint="/api/perplexity-search"
        onResponse={handleResponse}
        onError={handleError}
        className="custom-search"
      />
      
      <div style={{ 
        maxWidth: '1000px', 
        margin: '40px auto', 
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ color: '#374151', marginBottom: '20px' }}>🚀 How to Use in Your Project</h2>
        
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '20px', 
          borderRadius: '8px',
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          marginBottom: '20px'
        }}>
          <div style={{ color: '#059669', marginBottom: '10px' }}>{'// 1. Install and import'}</div>
          <div style={{ color: '#374151' }}>import PerplexitySearch from './components/PerplexitySearch';</div>
          <br />
          <div style={{ color: '#059669', marginBottom: '10px' }}>{'// 2. Use in your component'}</div>
          <div style={{ color: '#374151' }}>
            {'<PerplexitySearch'}<br />
            {'  apiEndpoint="/api/perplexity-search"'}<br />
            {'  onResponse={(response) => console.log(response)}'}<br />
            {'  onError={(error) => console.error(error)}'}<br />
            {'  className="my-custom-class"'}<br />
            {'/>'}<br />
          </div>
        </div>

        <h3 style={{ color: '#374151', marginBottom: '15px' }}>✨ Features</h3>
        <ul style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
          <li>🔍 <strong>Real-time web search</strong> with AI-powered insights</li>
          <li>⚡ <strong>Streaming support</strong> for fast responses</li>
          <li>📚 <strong>Citation support</strong> with source links</li>
          <li>🎛️ <strong>Advanced controls</strong> for fine-tuning search parameters</li>
          <li>💰 <strong>Cost estimation</strong> with real-time pricing</li>
          <li>🛑 <strong>Stop/cancel</strong> functionality to save costs</li>
          <li>📱 <strong>Responsive design</strong> that works on all devices</li>
          <li>🎨 <strong>Customizable styling</strong> via className prop</li>
        </ul>

        <h3 style={{ color: '#374151', marginBottom: '15px' }}>🔧 Props</h3>
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          <div><strong>apiEndpoint:</strong> string (optional) - API endpoint URL</div>
          <div><strong>className:</strong> string (optional) - Custom CSS class</div>
          <div><strong>onResponse:</strong> function (optional) - Callback for responses</div>
          <div><strong>onError:</strong> function (optional) - Callback for errors</div>
        </div>

        <h3 style={{ color: '#374151', marginBottom: '15px' }}>📁 File Structure</h3>
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '15px', 
          borderRadius: '8px',
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          color: '#374151'
        }}>
          components/<br />
          └── PerplexitySearch/<br />
          &nbsp;&nbsp;&nbsp;&nbsp;├── PerplexitySearch.tsx<br />
          &nbsp;&nbsp;&nbsp;&nbsp;└── index.ts<br />
        </div>
      </div>
    </div>
  );
};

export default PerplexityDemo; 