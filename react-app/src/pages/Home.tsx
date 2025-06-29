import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { homeStyles } from './HomeStyles';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const Home: React.FC = () => {
  const [hoveredCards, setHoveredCards] = useState<{ [key: number]: boolean }>({});
  const [hoveredJoinBtn, setHoveredJoinBtn] = useState(false);
  const navigate = useNavigate();

  const handleCardHover = (cardIndex: number, isHovered: boolean) => {
    setHoveredCards(prev => ({ ...prev, [cardIndex]: isHovered }));
  };

  const getCardStyle = (cardIndex: number) => 
    hoveredCards[cardIndex] ? homeStyles.stepCardHover : homeStyles.stepCard;

  const getJoinBtnStyle = () => 
    hoveredJoinBtn ? homeStyles.joinEventBtnHover : homeStyles.joinEventBtn;

  const iconCircleStyles = [homeStyles.iconCircle1, homeStyles.iconCircle2, homeStyles.iconCircle3];

  const handleSignInClick = () => {
    navigate('/login');
  };

  return (
    <div style={homeStyles.homePage}>
      <Header onSignInClick={handleSignInClick} />

      {/* Hero Section */}
      <section style={homeStyles.hero}>
        <div style={homeStyles.heroContent}>
          <h1 style={homeStyles.heroTitle}>
            PetWhenua: Our Kiwi Pet Networking Community
            <br />
            <span style={homeStyles.heroSubtitle}>Networking for your pet</span>
          </h1>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={homeStyles.howItWorks}>
        <div style={homeStyles.container}>
          <h2 style={homeStyles.sectionTitle}>How It Works</h2>
          <p style={homeStyles.sectionSubtitle}>
            content1
            <br />
            content2
          </p>
          
          <div style={homeStyles.stepsGrid}>
            {[
              {
                icon: '👤',
                title: 'Create your Pet Profile',
                description: 'Share your furry friend\'s story and\nconnect with your community'
              },
              {
                icon: '📍', 
                title: 'Find a pet owner near you',
                description: 'Find pet owners near you and build\nrelationships for your pets'
              },
              {
                icon: '📅',
                title: 'Join Meetups & Events', 
                description: 'Attend local playdates and build lasting\nfriendships'
              }
            ].map((step, index) => (
              <div 
                key={index}
                style={getCardStyle(index)}
                onMouseEnter={() => handleCardHover(index, true)}
                onMouseLeave={() => handleCardHover(index, false)}
              >
                <div style={homeStyles.stepIcon}>
                  <div style={iconCircleStyles[index]}>
                    <span style={homeStyles.icon}>{step.icon}</span>
                  </div>
                </div>
                <h3 style={homeStyles.stepTitle}>{step.title}</h3>
                <p style={homeStyles.stepDescription}>
                  {step.description.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < step.description.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Meetup Section */}
      <section style={homeStyles.upcomingMeetup}>
        <div style={homeStyles.container}>
          <div style={homeStyles.meetupCard}>
            <div style={homeStyles.meetupContent}>
              <div style={homeStyles.meetupIcon}>
                <span>🏃‍♂️</span>
              </div>
              <div>
                <h3 style={homeStyles.meetupTitle}>Upcoming Meetup</h3>
                <p style={homeStyles.meetupInfo}>Christchurch - 20 July at Hagley Park</p>
                <button 
                  style={getJoinBtnStyle()}
                  onMouseEnter={() => setHoveredJoinBtn(true)}
                  onMouseLeave={() => setHoveredJoinBtn(false)}
                >
                  Join Event
                </button>
              </div>
            </div>
            <div style={homeStyles.meetupDots}>
              <span style={homeStyles.dot}></span>
              <span style={homeStyles.dotActive}></span>
              <span style={homeStyles.dot}></span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home; 