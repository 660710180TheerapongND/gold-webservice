import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '40px', 
        right: '40px', 
        zIndex: 9999, 
        display: isVisible ? 'block' : 'none' 
      }}
    >
      <button
        onClick={scrollToTop}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '45px',
          height: '45px',
          backgroundColor: '#B8872A',
          color: '#0E0B06',
          borderRadius: '50%',
          border: '2px solid #E8C56A',
          boxShadow: '0 10px 30px rgba(184, 135, 42, 0.5)',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <ChevronUp size={25} strokeWidth={3} />
      </button>
    </div>
  );
};

export default ScrollToTop;