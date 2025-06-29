import React, { useState } from 'react';
import { footerStyles } from './FooterStyles';

const Footer: React.FC = () => {
  const [hoveredLinks, setHoveredLinks] = useState<{ [key: string]: boolean }>({});
  const [hoveredSocial, setHoveredSocial] = useState<{ [key: string]: boolean }>({});

  const handleLinkHover = (linkName: string, isHovered: boolean) => {
    setHoveredLinks(prev => ({ ...prev, [linkName]: isHovered }));
  };

  const handleSocialHover = (socialName: string, isHovered: boolean) => {
    setHoveredSocial(prev => ({ ...prev, [socialName]: isHovered }));
  };

  const getLinkStyle = (linkName: string) => ({
    ...footerStyles.footerLink,
    color: hoveredLinks[linkName] ? '#333' : '#666',
  });

  const getSocialStyle = (socialName: string) => ({
    ...footerStyles.socialLink,
    transform: hoveredSocial[socialName] ? 'scale(1.1)' : 'scale(1)',
  });

  return (
    <footer style={footerStyles.footer}>
      <div style={footerStyles.container}>
        <div style={footerStyles.footerContent}>
          <div style={footerStyles.footerLeft}>
            <div style={footerStyles.footerLogo}>
              <img src="/logo.png" alt="PetWhenua Logo" style={footerStyles.logoImage} />
            </div>
            <div style={footerStyles.footerLinks}>
              <a 
                href="#" 
                style={getLinkStyle('privacy')}
                onMouseEnter={() => handleLinkHover('privacy', true)}
                onMouseLeave={() => handleLinkHover('privacy', false)}
              >
                Privacy
              </a>
              <a 
                href="#" 
                style={getLinkStyle('terms')}
                onMouseEnter={() => handleLinkHover('terms', true)}
                onMouseLeave={() => handleLinkHover('terms', false)}
              >
                Terms
              </a>
              <a 
                href="#" 
                style={getLinkStyle('contact')}
                onMouseEnter={() => handleLinkHover('contact', true)}
                onMouseLeave={() => handleLinkHover('contact', false)}
              >
                Contact
              </a>
              <span>Copyright @Tong Ye 2025 for MSA Phase 2</span>
            </div>
          </div>
          <div style={footerStyles.socialLinks}>
            <a 
              href="#" 
              style={getSocialStyle('instagram')}
              onMouseEnter={() => handleSocialHover('instagram', true)}
              onMouseLeave={() => handleSocialHover('instagram', false)}
            >
              📷
            </a>
            <a 
              href="#" 
              style={getSocialStyle('email')}
              onMouseEnter={() => handleSocialHover('email', true)}
              onMouseLeave={() => handleSocialHover('email', false)}
            >
              ✉️
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
