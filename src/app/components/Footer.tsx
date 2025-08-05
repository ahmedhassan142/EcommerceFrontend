

import Link from 'next/link';


const Footer = () => {
  return (
    <footer className='footer'>
      <div className='footerContainer'>
        {/* Logo and Description */}
        <div className='footerSection'>
          <img src="/logo.png" alt="Company Logo" className='footerLogo' />
          <p className='footerDescription'>
            Your company description goes here. A brief introduction about your services or mission.
          </p>
        </div>

        {/* Quick Links */}
        <div className='footerSection'>
          <h4 className='footerHeading'>Quick Links</h4>
          <ul className='footerLinks'>
            <li><Link href="/About">About Us</Link></li>
            <li><Link href="/Sustainability">Sustainability</Link></li>
            <li><Link href="/Quality">Quality</Link></li>
            <li><Link href="/Contact">Contact Us</Link></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className='footerSection'>
          <h4 className='footerHeading'>Contact Us</h4>
          <ul className='footerContact'>
            <li><i className="fas fa-map-marker-alt"></i> 123 Main Street, City, Country</li>
            <li><i className="fas fa-phone"></i> +123 456 7890</li>
            <li><i className="fas fa-envelope"></i> info@yourcompany.com</li>
          </ul>
        </div>

        {/* Social Media Links */}
        <div className='footerSection'>
          <h4 className='footerHeading'>Follow Us</h4>
          <div className='footerSocial'>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className='footerBottom'>
        <p>&copy; 2023 Your Company. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;