/* Verified starter content supplied by the client. Nothing here claims
   results, rankings, placements, testimonials or credentials. */

export const DEFAULT_SETTINGS = {
  branding: {
    businessName: "STEEL BOYZ 7-7",
    affiliation: "Affiliate of Under the Radar Recruiting FLPA",
    logo: "/images/branding/logo.png",
    favicon: "",
  },
  contact: {
    ownerName: "Scott Stephens",
    ownerTitle: "Owner",
    email: "sdstephens321@gmail.com",
    phone: "+1 727 992 4101",
    opsName: "Cameron Stephens",
    opsTitle: "Co-Owner / Operations Manager / 18U Coach",
    opsPhone: "+1 814 574 6469",
  },
  social: { twitter: "https://x.com/UnderRadarFLPA",instagram: "", facebook: "", tiktok: "", youtube: "", hudl: "" },
  footer: {
    mission:
      "7-7 STEEL BOYZ is an affiliate of Under the Radar Recruiting. We give athletes the opportunity to develop their abilities, grow as competitors, and pursue their dreams of playing at the next level.",
    tagline: "BUILT DIFFERENT. YOUR LEGACY STARTS HERE.",
  },
  seo: {
    titleTemplateSuffix: "STEEL BOYZ 7-7",
    defaultDescription:
      "STEEL BOYZ 7-7 offers 7-on-7 football, certified 1-on-1 player training, Hudl and social media reviews, and recruiting-focused support for high school athletes.",
    ogImage: "/images/site/hero-desktop.webp",
  },
  notifications: { emailEnabled: true, recipient: "sdstephens321@gmail.com" },
  privacy: {
    consentText:
      "I am the athlete's parent or legal guardian (or I am 18 or older), and I agree that STEEL BOYZ 7-7 may contact me about this inquiry.",
    formNotice:
      "We only use the details you share to respond to your inquiry. We never publish inquiry information, and we do not add you to marketing lists.",
    retentionDays: 365,
  },
};

export type SiteSettings = typeof DEFAULT_SETTINGS;

const contactCta = { label: "Contact Our Team", href: "/contact" };

export const DEFAULT_PAGES = {
  home: {
    hero: {
      line1: "BUILT",
      line2: "DIFFERENT",
      line3: "#ATD",
      subheadline: "YOUR LEGACY STARTS HERE!!",
      tagline: "Develop. Compete. Get Recruited.",
      description:
        "Elite 7-on-7 football, professional player training, and recruiting-focused support to help athletes develop their skills and pursue the next level.",
      image: "/images/site/hero-desktop.webp",
      mobileImage: "/images/site/hero-mobile.webp",
      primary: { label: "Explore Our Services", href: "/services" },
      secondary: { label: "About Our Program", href: "/about" },
      tertiary: { label: "Join the Movement", href: "#join" },
    },
    sectionOrder: ["features", "about", "services", "statement", "process", "teams", "leadership", "merch", "cta"],
    features: {
      visible: true,
      items: [
        { label: "7-7 Team Play", icon: "football", href: "/services#team-play" },
        { label: "1-1 Player Training", icon: "dumbbell", href: "/services#player-training" },
        { label: "Hudl / Social Media Review", icon: "video", href: "/services#media-review" },
        { label: "NIL Opportunities", icon: "handshake", href: "/services#nil-recruiting" },
        { label: "Recruiting Connections", icon: "users", href: "/services#nil-recruiting" },
      ],
    },
    about: {
      visible: true,
      eyebrow: "Who We Are",
      heading: "About 7-7",
      highlight: "STEEL BOYZ",
      body:
        "7-7 STEEL BOYZ is an affiliate of Under the Radar Recruiting FLPA. Our mission is to help young athletes develop their football skills, build confidence, compete at a higher level, and pursue opportunities to continue playing the game they love.\n\nThrough organized 7-on-7 football, professional training, athlete evaluation, and recruiting-focused resources, we support athletes as they work toward their goals.",
      image: "/images/site/about-helmet.webp",
      cta: { label: "Discover Our Story", href: "/about" },
    },
    services: {
      visible: true,
      eyebrow: "Our Services",
      heading: "Train Hard. Play Harder.",
      text: "Focused football development services designed to help athletes improve, compete, and prepare for future opportunities.",
    },
    statement: {
      visible: true,
      line1: "Not every athlete is built the same.",
      line2: "We train to be different.",
      text: "Growth comes from preparation, dedication, and the willingness to compete.",
      image: "/images/site/statement-bg.webp",
      cta: { label: "Start Your Journey", href: "/contact" },
    },
    process: {
      visible: true,
      eyebrow: "The Process",
      heading: "The Road to the Next Level",
      text: "A clear path built on work, reps, and accountability.",
      note: "Every athlete's path is different. Participation does not guarantee roster spots or recruiting opportunities.",
      steps: [
        { title: "Connect", text: "Contact the STEEL BOYZ team to learn about the program.", icon: "message" },
        { title: "Develop", text: "Work on football technique, athletic skills, and individual improvement.", icon: "dumbbell" },
        { title: "Compete", text: "Participate in training and appropriate competitive opportunities.", icon: "football" },
        { title: "Grow", text: "Continue building experience, discipline, and recruiting readiness.", icon: "trending" },
      ],
    },
    teams: {
      visible: true,
      eyebrow: "Age Groups",
      heading: "Our Football Programs",
      text: "STEEL BOYZ programs are organized by age group. Reach out to learn which program fits your athlete.",
    },
    leadership: {
      visible: true,
      eyebrow: "Leadership",
      heading: "Leadership That Drives Development",
      text: "The people building the STEEL BOYZ program.",
      cta: { label: "Meet Our Team", href: "/our-team" },
    },
    merch: {
      visible: true,
      eyebrow: "Merchandise",
      heading: "Rep the STEEL BOYZ",
      text: "Represent the brand on and off the field.",
      note: "Orders are handled directly by our team. Use Contact to Order and we will follow up with details.",
    },
    cta: {
      visible: true,
      heading: "Your Legacy Starts Here.",
      text: "Ready to learn more about STEEL BOYZ 7-7? Connect with our team to explore training, team participation, and development opportunities.",
      image: "/images/site/cta-stadium.webp",
      primary: contactCta,
      secondary: { label: "Explore Training", href: "/services#player-training" },
    },
    seo: {
      title: "STEEL BOYZ 7-7 | Built Different #ATD",
      description:
        "Elite 7-on-7 football, certified 1-on-1 player training, Hudl reviews, and recruiting-focused support for high school athletes. Your legacy starts here.",
      ogImage: "",
    },
  },
  about: {
    hero: {
      eyebrow: "About Us",
      heading: "More Than Football. It's a Legacy.",
      text: "A program built for athletes who are ready to put in the work.",
      image: "/images/site/hero-about.webp",
    },
    story: {
      visible: true,
      eyebrow: "Our Story",
      heading: "Built for Athletes Who Want More",
      body:
        "STEEL BOYZ 7-7 is a football program and an affiliate of Under the Radar Recruiting FLPA. We exist to give athletes a place to sharpen their skills, compete, and work toward their goals in the game.\n\nOur approach combines organized 7-on-7 team play, certified one-on-one training, film and profile reviews, and recruiting-focused resources, so athletes and their families have one place to start building.",
      image: "/images/site/about-helmet.webp",
    },
    mission: {
      visible: true,
      eyebrow: "Our Mission",
      heading: "Develop. Compete. Get Recruited.",
      body:
        "Help athletes strengthen their abilities, gain competitive experience, and pursue opportunities at the next level.",
    },
    values: {
      visible: true,
      eyebrow: "What We Stand For",
      heading: "The Standard",
      items: [
        { title: "Discipline", text: "Show up, do the work, and hold yourself to a higher standard every rep.", icon: "shield" },
        { title: "Development", text: "Steady improvement in technique, athleticism, and football IQ.", icon: "trending" },
        { title: "Competition", text: "Iron sharpens iron. We compete to get better, together.", icon: "flame" },
        { title: "Opportunity", text: "Helping athletes prepare for the chances they are working toward.", icon: "target" },
      ],
    },
    why: {
      visible: true,
      eyebrow: "Why STEEL BOYZ",
      heading: "Everything an Athlete Needs to Start Building",
      body: "Athletes get more out of their time when training, competition, and visibility work together.",
      image: "/images/site/why-steelboyz.webp",
      points: [
        { title: "Individual training", text: "Certified one-on-one sessions focused on technique and position-specific improvement." },
        { title: "Team competition", text: "7-on-7 play that builds teamwork, game awareness, and on-field experience." },
        { title: "Media reviews", text: "Hudl and social media reviews to sharpen how an athlete presents themselves." },
        { title: "Recruiting-focused resources", text: "Referrals and contacts that may be available to eligible athletes." },
      ],
    },
    journey: {
      visible: true,
      eyebrow: "The Athlete Journey",
      heading: "Four Steps. One Direction.",
      text: "How athletes move through the STEEL BOYZ program.",
      note: "Every athlete's path is different. Participation does not guarantee roster spots, scholarships, or recruiting opportunities.",
      steps: [
        { title: "Connect", text: "Families reach out to learn about programs, training, and the right fit for their athlete.", icon: "message" },
        { title: "Develop", text: "Athletes work on technique, athletic skills, and the details of their position.", icon: "dumbbell" },
        { title: "Compete", text: "Athletes put their work on the field through training and appropriate competitive opportunities.", icon: "football" },
        { title: "Grow", text: "Athletes keep building experience, discipline, and recruiting readiness season over season.", icon: "trending" },
      ],
    },
    cta: {
      heading: "Become Part of the STEEL BOYZ Journey",
      text: "Talk with our team about training, team play, and development opportunities.",
      button: contactCta,
    },
    seo: {
      title: "About Us",
      description: "Learn about STEEL BOYZ 7-7, an affiliate of Under the Radar Recruiting FLPA focused on athlete development and next-level opportunity.",
      ogImage: "",
    },
  },
  services: {
    hero: {
      eyebrow: "Services",
      heading: "Train. Compete. Elevate.",
      text: "Programs and development services for athletes ready to put in the work.",
      image: "/images/site/hero-services.webp",
    },
    intro: {
      eyebrow: "What We Offer",
      heading: "Development Services",
      text: "From team competition to individual training and film review, every service is built to help athletes improve and present their best football.",
    },
    disclaimer:
      "Recruiting outcomes, scholarship offers, and NIL opportunities are never guaranteed. Referrals and contacts depend on eligibility, athlete evaluation, and decisions made by third parties.",
    faq: {
      visible: true,
      heading: "Frequently Asked Questions",
      text: "Quick answers for athletes and parents.",
    },
    cta: {
      heading: "Ready to Get to Work?",
      text: "Tell us about your athlete and the service you are interested in. Our team will follow up.",
      button: contactCta,
    },
    seo: {
      title: "Services",
      description: "7-on-7 team play, certified 1-on-1 training ($35/hr), Hudl and social media reviews ($30), and NIL / recruiting connections for eligible athletes.",
      ogImage: "",
    },
  },
  team: {
    hero: {
      eyebrow: "Our Team",
      heading: "The People Behind the Program",
      text: "Leadership focused on athlete growth, development, and opportunity.",
      image: "/images/site/hero-team.webp",
    },
    leadership: {
      eyebrow: "Leadership",
      heading: "Program Leadership",
      text: "Reach our leadership team directly with questions about the program.",
    },
    programs: {
      eyebrow: "Programs",
      heading: "Age-Group Teams",
      text: "Program details are shared as each team is confirmed.",
    },
    cta: {
      heading: "Questions About a Program?",
      text: "Contact our team to learn more about age groups, training, and how to get involved.",
      button: contactCta,
    },
    seo: {
      title: "Our Team",
      description: "Meet the leadership of STEEL BOYZ 7-7 and explore the 18U, 16U, and 14U football programs.",
      ogImage: "",
    },
  },
  contact: {
    hero: {
      eyebrow: "Contact",
      heading: "Let's Build Your Legacy",
      text: "Reach out to learn about STEEL BOYZ programs, team opportunities, and individual training.",
      image: "/images/site/hero-contact.webp",
    },
    details: {
      heading: "Talk to Our Team",
      text: "Call, email, or send an inquiry. Parents and guardians are encouraged to reach out directly.",
    },
    form: {
      heading: "Send an Inquiry",
      text: "Share a few details and our team will follow up.",
      successMessage: "Thank you. Your inquiry has been received and our team will be in touch soon.",
    },
    seo: {
      title: "Contact",
      description: "Contact STEEL BOYZ 7-7 about 7-on-7 team play, 1-on-1 training, Hudl reviews, recruiting information, and merchandise.",
      ogImage: "",
    },
  },
};

export type PagesContent = typeof DEFAULT_PAGES;

export const DEFAULT_SERVICES = [
  {
    title: "7-on-7 Team Play",
    slug: "team-play",
    shortLabel: "7-7 Team Play",
    icon: "football",
    summary: "Competitive 7-on-7 football experiences designed to build teamwork, game awareness, and on-field performance.",
    description:
      "Our 7-on-7 teams give athletes organized competition focused on the passing game, coverage, communication, and decision-making. Athletes build chemistry with teammates, sharpen their football IQ, and gain on-field experience against competition.",
    benefits: ["Team competition and game reps", "Football development and game awareness", "Teamwork and communication", "On-field experience"],
    image: "/images/site/service-team-play.webp",
    price: null,
    priceLabel: "Contact for team fees",
    note: "Team fees vary by team. Contact us for details.",
    ctaLabel: "Inquire About Team Play",
    faqs: [],
    displayOrder: 1,
    active: true,
  },
  {
    title: "Certified One-on-One Training",
    slug: "player-training",
    shortLabel: "1-1 Player Training",
    icon: "dumbbell",
    summary: "Professionally certified individual training focused on technique, athletic development, and position-specific improvement.",
    description:
      "One-on-one sessions give athletes focused attention on the fundamentals of their position. Sessions target technique, footwork, and the specific skills each athlete needs to improve.",
    benefits: ["Individual skill development", "Football fundamentals", "Position-specific improvement", "Technique refinement"],
    image: "/images/site/service-training.webp",
    price: 35,
    priceLabel: "$35 / hour",
    note: "",
    ctaLabel: "Request Training",
    faqs: [],
    displayOrder: 2,
    active: true,
  },
  {
    title: "Hudl & Social Media Review",
    slug: "media-review",
    shortLabel: "Hudl / Social Media Review",
    icon: "video",
    summary: "Athlete video and social media profile reviews to help identify improvements in football-related presentation and recruiting visibility.",
    description:
      "We review an athlete's Hudl film and football-related social media presence and point out areas to improve, from clip selection to how the profile presents the athlete.",
    benefits: ["Film review", "Athlete profile presentation", "Improvement areas for recruiting-focused materials"],
    image: "/images/site/service-hudl.webp",
    price: 30,
    priceLabel: "$30 / review",
    note: "One review per year is complimentary for qualifying paid 7-on-7 team participants, subject to confirmation of eligibility.",
    ctaLabel: "Request a Review",
    faqs: [],
    displayOrder: 3,
    active: true,
  },
  {
    title: "NIL Referrals & Recruiting Connections",
    slug: "nil-recruiting",
    shortLabel: "NIL Opportunities",
    icon: "handshake",
    summary: "Referrals and connections may be available for eligible high-level athletes, including those evaluated at the 2–4 star level.",
    description:
      "For eligible athletes, we may be able to share information, referrals, and contacts related to recruiting and NIL. Eligibility is determined case by case.",
    benefits: ["Information on recruiting and NIL", "Referrals for eligible athletes", "Contacts where available"],
    image: "/images/site/service-nil.webp",
    price: null,
    priceLabel: "Contact for details",
    note: "Referrals are free for eligible athletes. Outcomes are not guaranteed.",
    ctaLabel: "Ask About Opportunities",
    faqs: [],
    displayOrder: 4,
    active: true,
  },
  {
    title: "Tryout Registration",
    slug: "tryouts",
    shortLabel: "Tryouts",
    icon: "clipboard",
    summary: "Register your athlete for STEEL BOYZ tryouts. Registration includes a free T-shirt unless advertised differently.",
    description:
      "Tryouts are the first step to joining a STEEL BOYZ 7-on-7 team. Contact us to register your athlete and receive tryout details for their age group.",
    benefits: ["Tryout entry for your athlete's age group", "Free STEEL BOYZ T-shirt (unless advertised differently)"],
    image: "/images/site/service-tryouts.webp",
    price: 15,
    priceLabel: "$15 registration",
    note: "Includes a free T-shirt unless advertised differently. Tryout dates are shared when announced.",
    ctaLabel: "Register for Tryouts",
    faqs: [],
    displayOrder: 5,
    active: true,
  },
];

export const DEFAULT_TEAMS = [
  { name: "18U STEEL BOYZ", ageGroup: "18U", coach: "Cameron Stephens", description: "Our 18U program, led by Coach Cameron Stephens. Contact us for program details.", image: "/images/site/team-18u.webp", status: "active", displayOrder: 1, active: true },
  { name: "16U STEEL BOYZ", ageGroup: "16U", coach: "", description: "Team details to be announced.", image: "/images/site/team-16u.webp", status: "tba", displayOrder: 2, active: true },
  { name: "14U STEEL BOYZ", ageGroup: "14U", coach: "", description: "Program still under development.", image: "/images/site/team-14u.webp", status: "development", displayOrder: 3, active: true },
];

export const DEFAULT_LEADERSHIP = [
  { name: "Scott Stephens", role: "Owner", bio: "", image: "", email: "sdstephens321@gmail.com", phone: "+1 727 992 4101", showOnHome: true, displayOrder: 1, active: true },
  { name: "Cameron Stephens", role: "Co-Owner / Operations Manager / 18U Coach", bio: "", image: "", email: "", phone: "+1 814 574 6469", showOnHome: true, displayOrder: 2, active: true },
];

export const DEFAULT_MERCHANDISE = [
  { name: "STEEL BOYZ Shirt", slug: "shirt", price: 25, description: "Black or white tee with the STEEL logo or the ATD-Built Different design.", image: "/images/merchandise/shirt.webp", illustrative: true, availability: "inquire", displayOrder: 1, active: true },
  { name: "STEEL BOYZ Polo", slug: "polo", price: 35, description: "Black performance polo with the STEEL logo.", image: "/images/merchandise/polo.webp", illustrative: true, availability: "inquire", displayOrder: 2, active: true },
  { name: "STEEL BOYZ Hat", slug: "hat", price: 30, description: "Official STEEL BOYZ cap.", image: "/images/merchandise/hat.webp", illustrative: true, availability: "inquire", displayOrder: 3, active: true },
  { name: "Team Uniform", slug: "uniform", price: 150, description: "Official STEEL BOYZ team uniform. Final price is determined by age group. Contact us for details.", image: "/images/merchandise/uniform-kit.webp", illustrative: true, availability: "inquire", displayOrder: 4, active: true },
];

export const DEFAULT_FAQS = [
  { question: "What age groups are supported?", answer: "STEEL BOYZ currently has an 18U team led by Coach Cameron Stephens. 16U team details are to be announced, and a 14U program is under development. Contact us to learn which option fits your athlete.", displayOrder: 1, active: true },
  { question: "How much does individual training cost?", answer: "Certified one-on-one player training is $35 per hour.", displayOrder: 2, active: true },
  { question: "How can athletes inquire about joining?", answer: "Send an inquiry through our Contact page or call Scott Stephens at +1 727 992 4101. Our team will follow up with next steps.", displayOrder: 3, active: true },
  { question: "Is video review available?", answer: "Yes. Hudl / social media reviews are $30 per review. One review per year is complimentary for qualifying paid 7-on-7 team participants, subject to confirmation of eligibility.", displayOrder: 4, active: true },
  { question: "Are recruiting opportunities guaranteed?", answer: "No. We provide training, competition, reviews, and, for eligible athletes, referrals and contacts. Recruiting outcomes, scholarships, and NIL opportunities are never guaranteed.", displayOrder: 5, active: true },
  { question: "How can parents contact the organization?", answer: "Parents and guardians can email sdstephens321@gmail.com, call Scott Stephens at +1 727 992 4101, call Cameron Stephens at +1 814 574 6469, or use the inquiry form on our Contact page.", displayOrder: 6, active: true },
  { question: "How much is tryout registration?", answer: "Tryout registration is $15 and includes a free T-shirt unless advertised differently.", displayOrder: 7, active: true },
  { question: "How much does a team uniform cost?", answer: "The team uniform is $150. Final pricing is determined by age group, so contact us for the exact amount for your athlete.", displayOrder: 8, active: true },
];
