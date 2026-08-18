import { useState } from 'react';
import { Check, ChevronDown, Clock3, Code2, ExternalLink, LockKeyhole, Menu, PlayCircle, Sparkles, X, Zap } from 'lucide-react';

const courses = [
  {
    id: 'java-dsa', title: 'Java + DSA Mastery', category: 'JAVA & DSA', price: 299, oldPrice: 999,
    description: 'Core Java, OOP, Collections, problem solving and interview-focused DSA.',
    features: ['Core Java + OOP', 'DSA & LeetCode', 'Interview Questions'],
    demo: 'https://drive.google.com/drive/folders/1DC6Eqns61atRRvQmvXg-GsrLLzrCBbeJ?usp=drive_link', icon: Code2, tone: 'violet'
  },
  {
    id: 'mern', title: 'MERN Stack Web Development', category: 'WEB DEVELOPMENT', price: 299, oldPrice: 1499,
    description: 'Build modern full-stack applications with MongoDB, Express, React and Node.js.',
    features: ['React + Node.js', 'MongoDB + Express', 'Full-Stack Projects'],
    demo: 'https://drive.google.com/drive/folders/1WFSmzivBfNjWGjpGvZsQqz1PRbZRoXCT?usp=drive_link', icon: Zap, tone: 'blue'
  },
  {
    id: 'aiml', title: 'AI & Machine Learning', category: 'AI / ML', price: 299, oldPrice: 1999,
    description: 'Learn practical AI/ML concepts, Python workflows, models and real-world projects.',
    features: ['Python + ML', 'AI Fundamentals', 'Project Based Learning'],
    demo: 'https://drive.google.com/drive/folders/1nd1094h_hkt_NElB3FMrtCRlH_KG9JqB?usp=drive_link', icon: Sparkles, tone: 'green'
  }
];

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:9090';
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [loadingCourse, setLoadingCourse] = useState('');
  const [accessUrl, setAccessUrl] = useState('');
  const [accessTitle, setAccessTitle] = useState('');

  const showNotice = (message) => {
    setNotice(message);
    window.clearTimeout(window.__skillforgeToast);
    window.__skillforgeToast = window.setTimeout(() => setNotice(''), 3000);
  };

  const buyNow = async (course) => {
    if (loadingCourse) return;
    setLoadingCourse(course.id);

    if (!razorpayKey) {
      showNotice('Razorpay key missing. Add VITE_RAZORPAY_KEY_ID in .env.');
      setLoadingCourse('');
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: course.price,
          cartItems: [{ id: course.id, title: course.title, price: course.price, qty: 1 }]
        })
      });

      if (!response.ok) throw new Error('Payment order creation failed');
      const order = await response.json();
      if (!window.Razorpay) throw new Error('Razorpay SDK not loaded');

      const options = {
        key: razorpayKey,
        amount: order.amount || course.price * 100,
        currency: order.currency || 'INR',
        name: 'SkillForge',
        description: course.title,
        order_id: order.id,
        handler: async (payment) => {
          try {
            const verify = await fetch(`${apiBase}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...payment, courseId: course.id })
            });
            if (!verify.ok) throw new Error('Verification failed');
            const result = await verify.json();
            if (!result.verified || !result.accessUrl) throw new Error('Course access could not be activated.');
                    localStorage.setItem(`skillforge-access-${course.id}`, result.accessUrl);
            setAccessUrl(result.accessUrl);
            setAccessTitle(course.title);
            showNotice('Payment verified! Your course is unlocked.');
          } catch {
            showNotice('Payment received, but server verification needs attention.');
          }
        },
        prefill: {},
        notes: { courseId: course.id, courseName: course.title },
        theme: { color: '#1e3a8a' },
        modal: { ondismiss: () => showNotice('Payment window closed.') }
      };

      new window.Razorpay(options).open();
    } catch (error) {
      showNotice(error.message || 'Unable to start payment.');
    } finally {
      setLoadingCourse('');
    }
  };

  return (
    <div className="site">
      <header className="header">
        <div className="container nav-wrap">
          <a href="#top" className="brand"><span className="brand-mark">S</span><span>Skill<span>Forge</span></span></a>
          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <a href="#courses" onClick={() => setMenuOpen(false)}>Courses</a>
            <a href="#why" onClick={() => setMenuOpen(false)}>Why SkillForge</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          </nav>
          <button className="menu-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Menu"><Menu size={21}/></button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <div className="eyebrow-pill"><Sparkles size={14}/> PRACTICAL COURSES • ONE-TIME PAYMENT</div>
              <h1>Learn skills that <span>build your career.</span></h1>
              <p>Focused, project-based courses for developers who want practical skills without complicated pricing or distractions.</p>
              <div className="hero-actions"><a className="primary" href="#courses">Explore Courses <ChevronDown size={17}/></a><span className="trust"><LockKeyhole size={15}/> Secure Razorpay checkout</span></div>
              <div className="hero-points"><span><Check size={15}/> Lifetime access</span><span><Check size={15}/> Project focused</span><span><Check size={15}/> Beginner friendly</span></div>
            </div>
            <div className="hero-visual">
              <div className="hero-panel"><div className="panel-top"><span></span><span></span><span></span><small>skillforge.in</small></div><div className="panel-body"><div className="mini-stat"><strong>3</strong><small>career courses</small></div><div className="mini-stat"><strong>₹299</strong><small>per course</small></div><div className="progress-card"><div><b>Learning path</b><span>Ready to start</span></div><div className="bar"><i></i></div></div></div></div>
              <div className="float-tag one"><PlayCircle size={15}/> Demo available</div><div className="float-tag two"><Clock3 size={15}/> Learn at your pace</div>
            </div>
          </div>
        </section>

        <section className="stats"><div className="container stats-grid"><div><strong>₹299</strong><span>Simple pricing</span></div><div><strong>3</strong><span>Focused courses</span></div><div><strong>100%</strong><span>Project oriented</span></div><div><strong>24/7</strong><span>Learn anytime</span></div></div></section>

        <section className="courses section" id="courses">
          <div className="container"><div className="section-head"><div><div className="eyebrow">CHOOSE YOUR PATH</div><h2>Three skills. One smart start.</h2><p>Watch the demo and buy any course directly with Razorpay.</p></div></div>
            <div className="course-grid">{courses.map(course => <CourseCard key={course.id} course={course} onBuy={buyNow} loading={loadingCourse === course.id} />)}</div>
          </div>
        </section>

        <section className="why section" id="why"><div className="container"><div className="center-head"><div className="eyebrow">WHY SKILLFORGE</div><h2>Less theory. More building.</h2><p>Everything is designed to help you learn, practice and create portfolio-ready work.</p></div><div className="why-grid"><Why icon={<Code2/>} title="Practical learning" text="Learn concepts through code, projects and real development workflows."/><Why icon={<Zap/>} title="Career focused" text="Interview-ready topics and skills aligned with modern developer roles."/><Why icon={<LockKeyhole/>} title="Simple checkout" text="Buy any course directly with Razorpay and complete payment securely."/></div></div></section>

        <section className="faq section" id="faq"><div className="container faq-box"><div><div className="eyebrow">FAQ</div><h2>Questions, answered.</h2></div><div className="faq-list"><details open><summary>How do I buy a course?</summary><p>Click Buy Now on the course card. Razorpay Checkout will open for the selected course.</p></details><details><summary>Is Razorpay payment real?</summary><p>Yes. The frontend is wired for Razorpay Checkout. Configure your Razorpay key and connect the create/verify payment API endpoints on your backend.</p></details><details><summary>Can I watch a demo before buying?</summary><p>Yes. Every course has a Demo button. Replace the demo URL with your actual video or course preview link.</p></details></div></div></section>
      </main>

      <footer><div className="container footer"><div><a className="brand" href="#top"><span className="brand-mark">S</span><span>Skill<span>Forge</span></span></a><p>Practical skills for the next step in your career.</p></div><div><b>Courses</b><a href="#courses">Java + DSA</a><a href="#courses">MERN Stack</a><a href="#courses">AI & ML</a></div><div><b>Support</b><a href="#faq">FAQ</a><a href="#top">Home</a></div></div><div className="copyright">© 2026 SkillForge. All rights reserved.</div></footer>

      {accessUrl && <div className="access-panel"><div><strong>🎉 {accessTitle} unlocked</strong><span>Payment verified successfully. Open your course below.</span></div><a className="access-btn" href={accessUrl} target="_blank" rel="noreferrer">Open Course <ExternalLink size={15}/></a><button onClick={() => setAccessUrl('')} aria-label="Close"><X size={17}/></button></div>}
      {notice && <div className="toast">{notice}<button onClick={() => setNotice('')} aria-label="Close"><X size={15}/></button></div>}
    </div>
  );
}

function CourseCard({ course, onBuy, loading }) {
  const Icon = course.icon;
  return <article className="course-card">
    <div className={`course-cover ${course.tone}`}><div className="cover-icon"><Icon size={30}/></div><span>{course.category}</span><strong>{course.title}</strong><small>SkillForge course</small></div>
    <div className="course-info">
      <div className="meta"><span>SELF-PACED</span><span>★ 4.8</span></div>
      <h3>{course.title}</h3><p>{course.description}</p>
      <div className="features">{course.features.map(x => <span key={x}><Check size={13}/>{x}</span>)}</div>
      <div className="price-row"><div><small className="old">₹{course.oldPrice}</small><strong>₹{course.price}</strong></div><span>one-time</span></div>
      <div className="card-actions">
        <a className="demo" href={course.demo} target="_blank" rel="noreferrer"><PlayCircle size={16}/> Demo <ExternalLink size={12}/></a>
        <button className="buy" disabled={loading} onClick={() => onBuy(course)}>{loading ? 'Opening…' : 'Buy Now'}</button>
      </div>
    </div>
  </article>;
}

function Why({ icon, title, text }) { return <div className="why-card"><div className="why-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>; }
