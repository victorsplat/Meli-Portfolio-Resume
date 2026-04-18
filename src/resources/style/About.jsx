const About = ({ onHover }) => (
  <section 
    id="about" 
    className="panel"
    onMouseEnter={() => onHover(true)}
    onMouseLeave={() => onHover(false)}
  >
    <h2>About</h2>
    <p>
      A self-taught young professional committed to personal and collective growth.
      Focusing on practical web projects with React, Vite, and accessible UI patterns.
    </p>
  </section>
);
export default About;