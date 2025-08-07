import './App.css';
import chefImage from './images/logo.png';

const ICONS = {
  facebook:  'https://img.icons8.com/ios-filled/50/000000/facebook-new.png',
  instagram: 'https://img.icons8.com/ios-filled/50/000000/instagram-new--v1.png',
  twitter:   'https://img.icons8.com/ios-filled/50/000000/twitter.png',
  youtube:   'https://img.icons8.com/ios-filled/50/000000/youtube-play.png',
  tiktok:    'https://img.icons8.com/ios-filled/50/000000/tiktok.png',
};

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section footer-left">
          <img
            src={chefImage}
            alt="Chef Mascot"
            className="footer-chef-image"
          />
          <div className="footer-logo-and-social">
            <div className="footer-logo">Daws’Cook</div>
            <div className="footer-social-icons">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
              >
                <img src={ICONS.facebook} alt="Facebook" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
              >
                <img src={ICONS.instagram} alt="Instagram" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <img src={ICONS.twitter} alt="Twitter" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noreferrer"
              >
                <img src={ICONS.youtube} alt="YouTube" />
              </a>
              <a href="https://www.tiktok.com" target="_blank" rel="noreferrer">
                <img src={ICONS.tiktok} alt="TikTok" />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-section footer-middle">
          <div className="footer-links-column">
            <h4>Meals</h4>
            Breakfast
            Dinner
            Ingredients
            Allergens
            News
            Features
          </div>
          <div className="footer-links-column">
            <h4>Company</h4>
            Contact us
            About us
            Support young chefs
            Sponsored Content
          </div>
          <div className="footer-links-column">
            <h4>Policy</h4>
            Privacy policy
            Terms of service
            EU privacy
          </div>
        </div>
        <div className="footer-section footer-right">
          <div className="footer-copyright">
            © 2025 Daws’Cook. Design by Puchałka.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
