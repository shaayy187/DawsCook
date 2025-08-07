import './App.css';
import bannerImg from './images/banner.jpg';
import dawidPhoto from './images/logo.png';
import art1 from './images/tort1.jpg';
import art2 from './images/tort2.jpg';
import art3 from './images/tort3.jpg';
import art4 from './images/tort4.jpg';
import bigFamilyCooking from './images/Family_Cooking_Together.jpg';
import coCreator1 from './images/cutejunkie.jpg';
import coCreator2 from './images/Caasper.jpg';
import coCreator3 from './images/Adam.jpg';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <div className="banner">
        <img src={bannerImg} alt="Banner cooking" className="banner-image" />
        <div className="banner-quote">
          <blockquote>
            “Cooking is an art, but all art requires knowing something about the techniques and materials.”
          </blockquote>
          <cite>— Nathan Myhrvold</cite>
        </div>
      </div>
      <section className="main-creator">
        <div className="creator-text">
          <h2>Main creator</h2>
          <p>
            Hi! <br />
            My name is Dawid, and I’m 23 years old. I live in Kraków, Poland.<br />
            One of my biggest passions is cooking – I absolutely love it!<br />
            My favorite cuisine is Italian because of its rich flavors and simplicity.<br />
            There’s nothing better than making fresh pasta or a perfect homemade pizza.<br />
            Cooking allows me to be creative and experiment with new ingredients.<br />
            It’s not just a hobby for me: it’s a way to relax and bring joy to others through food. 🍕🍓🍫
          </p>
        </div>
        <div className="creator-image">
          <img src={dawidPhoto} alt="Dawid - Main creator" />
        </div>
      </section>
      <div className="line"></div>
      <section className="art-section">
        <h2>My art</h2>
        <div className="art-grid">
          <div className="art-item">
            <img src={art1} alt="Cake 1" />
          </div>
          <div className="art-item">
            <img src={art2} alt="Cake 2" />
          </div>
          <div className="art-item">
            <img src={art3} alt="Cake 3" />
          </div>
          <div className="art-item">
            <img src={art4} alt="Cake 4" />
          </div>
        </div>
      </section>
      <div className="line"></div>
      <section className="big-image-section">
        <img src={bigFamilyCooking} alt="Family Cooking Together" />
      </section>
      <div className="line"></div>
      <section className="co-creators">
        <h2>Co-creators</h2>
        <div className="co-creators-grid">
          <div className="co-creator-item">
            <img src={coCreator1} alt="cutiejunkie" className="co-creator-avatar" />
            <span className="co-creator-name">cutiejunkie</span>
          </div>
          <div className="co-creator-item">
            <img src={coCreator2} alt="Caasper" className="co-creator-avatar" />
            <span className="co-creator-name">Caasper</span>
          </div>
          <div className="co-creator-item">
            <img src={coCreator3} alt="Adam" className="co-creator-avatar" />
            <span className="co-creator-name">Adam</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
