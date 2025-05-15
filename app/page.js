'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';

const GOOGLE_API_KEY = 'AIzaSyAf6pEnDG9xuJRyaSjbNzetmG2Qn2q2uYE';

export default function PharmacyShowcase() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const rowARef = useRef(null);
  const rowBRef = useRef(null);
  const rowAContentRef = useRef(null);
  const rowBContentRef = useRef(null);
  const chatContainerRef = useRef(null);
  const controls = useAnimationControls();

  // Scroll detection for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Improved auto-scroll implementation with manual control
  useEffect(() => {
    let scrollAPos = 0;
    let scrollBPos = 0;
    let isUserScrollingA = false;
    let isUserScrollingB = false;
    let scrollASpeed = 1;
    let scrollBSpeed = 1;
    let animationIdA;
    let animationIdB;
    let lastScrollTimeA = 0;
    let lastScrollTimeB = 0;

    const setupAutoScroll = (ref, contentRef, direction, isRowA) => {
      const element = ref.current;
      const content = contentRef.current;
      
      if (!element || !content) return;

      // Clone content for seamless looping
      content.innerHTML += content.innerHTML;
      
      const scroll = () => {
        if (isRowA) {
          if (!isUserScrollingA) {
            scrollAPos -= scrollASpeed;
            if (scrollAPos <= -content.scrollWidth / 2) {
              scrollAPos = 0;
            }
            element.scrollLeft = scrollAPos;
          }
          animationIdA = requestAnimationFrame(scroll);
        } else {
          if (!isUserScrollingB) {
            scrollBPos += scrollBSpeed;
            if (scrollBPos >= content.scrollWidth / 2) {
              scrollBPos = 0;
            }
            element.scrollLeft = scrollBPos;
          }
          animationIdB = requestAnimationFrame(scroll);
        }
      };

      scroll();

      // Handle manual scrolling
      const handleScroll = (e) => {
        if (isRowA) {
          isUserScrollingA = true;
          scrollAPos = e.target.scrollLeft;
          lastScrollTimeA = Date.now();
          
          // After 2 seconds of no scrolling, resume auto-scroll
          setTimeout(() => {
            if (Date.now() - lastScrollTimeA >= 2000) {
              isUserScrollingA = false;
            }
          }, 2000);
        } else {
          isUserScrollingB = true;
          scrollBPos = e.target.scrollLeft;
          lastScrollTimeB = Date.now();
          
          setTimeout(() => {
            if (Date.now() - lastScrollTimeB >= 2000) {
              isUserScrollingB = false;
            }
          }, 2000);
        }
      };

      // Pause on hover
      const handleMouseEnter = () => {
        if (isRowA) {
          scrollASpeed = 0.5;
        } else {
          scrollBSpeed = 0.5;
        }
      };

      const handleMouseLeave = () => {
        if (isRowA) {
          scrollASpeed = 1;
        } else {
          scrollBSpeed = 1;
        }
      };

      element.addEventListener('scroll', handleScroll);
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        if (isRowA) {
          cancelAnimationFrame(animationIdA);
        } else {
          cancelAnimationFrame(animationIdB);
        }
        element.removeEventListener('scroll', handleScroll);
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    };

    const cleanupA = setupAutoScroll(rowARef, rowAContentRef, 'left', true);
    const cleanupB = setupAutoScroll(rowBRef, rowBContentRef, 'right', false);

    return () => {
      if (cleanupA) cleanupA();
      if (cleanupB) cleanupB();
    };
  }, []);

  // Camera setup for AI image capture
  useEffect(() => {
    if (isCameraOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
          addAiMessage("AI Assistant", "Could not access camera. Please make sure you've granted camera permissions.", true);
          setIsCameraOpen(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  }, [isCameraOpen]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiMessages]);

  const addAiMessage = (sender, text, isError = false) => {
    setAiMessages(prev => [...prev, { sender, text, isError, timestamp: new Date().getTime() }]);
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMessage = aiInput;
    setAiInput('');
    addAiMessage("You", userMessage);
    setIsLoading(true);

    // Simulate typing effect
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate AI response (in a real app, you would call the Gemini API here)
    try {
      const responses = {
        english: [
          "This product appears to be a pain reliever containing ibuprofen. It's used for headaches, fever, and minor aches.",
          "The medication you're showing is an antibiotic. Please consult a doctor before using it.",
          "This is a vitamin supplement. It's generally safe but check the dosage instructions."
        ],
        kurdish: [
          "ئەم بەرهەمە دەرمانێکی دژە ئازارە کە ئایبۆپرۆفینی تێدایە. بۆ سەرئێشە و تا و ئازارە بچووکەکان بەکاردێت.",
          "ئەم دەرمانە دژە بەکتریایە. تکایە پێش بەکارهێنانی لە پزیشک بپرسەوە.",
          "ئەمە ڤیتامینێکی تەواوکەرە. بە گشتی سەلامەتە بەڵام ڕێنماییەکانی دۆزەخانە بپشکنە."
        ]
      };

      // Simulate thinking delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const randomResponse = responses.kurdish[Math.floor(Math.random() * responses.kurdish.length)];
      addAiMessage("AI Assistant", randomResponse);
    } catch (error) {
      addAiMessage("AI Assistant", "An error occurred while processing your request. Please try again.", true);
    } finally {
      setIsLoading(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // In a real app, you would send this image to the Gemini API
      addAiMessage("You", "[Image of product]");
      setIsLoading(true);
      
      setTimeout(() => {
        addAiMessage("AI Assistant", "ئەم وێنەیە دەرمانێکی دژە ئازار نیشان دەدات. تکایە وەسف و ڕێنماییەکانی بەکارهێنان بپرسە لەگەڵ پزیشکەکەت.");
        setIsLoading(false);
      }, 2000);
      
      setIsCameraOpen(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      addAiMessage("AI Assistant", "Please upload an image file.", true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      addAiMessage("You", "[Image of product]");
      setIsLoading(true);
      
      setTimeout(() => {
        addAiMessage("AI Assistant", "ئەم وێنەیە دەرمانێکی دژە ئازار نیشان دەدات. تکایە وەسف و ڕێنماییەکانی بەکارهێنان بپرسە لەگەڵ پزیشکەکەت.");
        setIsLoading(false);
      }, 2000);
    };
    reader.readAsDataURL(file);
    setIsImageUploadOpen(false);
  };

  const categories = [
    'All',
    'Medical Supplies',
    'Baby Care',
    'Personal Care',
    'Vitamins',
    'First Aid',
    'Sunblocks',
    'Skin Care',
    'Digestive Health',
    'Allergy Relief'
  ];

  const products = [
    {
      id: 1,
      name: 'Bubble Bath Set',
      category: 'Baby Care',
      price: 99,
      originalPrice: 150,
      image: '/bubble-bath.jpg',
      featured: true,
      description: 'Premium baby care set with organic ingredients. Hypoallergenic and tear-free formula perfect for sensitive baby skin. Contains natural chamomile and lavender extracts to soothe and relax your baby before bedtime.',
      rating: 4.8,
      reviewCount: 124
    },
    {
      id: 2,
      name: 'Educational Toy Set',
      category: 'Baby Care',
      price: 49,
      originalPrice: 79,
      image: '/toy-set.jpg',
      description: 'A set of educational toys for babies. Designed to stimulate cognitive development and motor skills. Made from 100% safe, BPA-free materials with bright colors to attract baby attention.',
      rating: 4.6,
      reviewCount: 89
    },
    {
      id: 3,
      name: 'Premium Feeding Set',
      category: 'Baby Care',
      price: 89,
      originalPrice: 120,
      image: '/feeding-set.jpg',
      description: 'Complete feeding set for babies. Includes 4 bottles, 8 nipples of different flow rates, bottle brush, and insulated carrying bag. Anti-colic design reduces air intake to prevent gas and discomfort.',
      rating: 4.9,
      reviewCount: 215
    },
    {
      id: 4,
      name: 'First Aid Kit Deluxe',
      category: 'First Aid',
      price: 29,
      originalPrice: 45,
      image: '/first-aid.jpg',
      description: 'Essential first aid kit for emergencies. Contains 112 pieces including bandages, antiseptic wipes, gauze pads, medical tape, scissors, tweezers, and first aid guide. Compact and portable design.',
      rating: 4.7,
      reviewCount: 342
    },
    {
      id: 5,
      name: 'Advanced Multivitamins',
      category: 'Vitamins',
      price: 19,
      originalPrice: 25,
      image: '/vitamins.jpg',
      description: 'Daily multivitamins for adults. Provides 100% of daily value for essential vitamins and minerals. Supports immune health, energy production, and overall wellbeing. Easy-to-swallow tablets.',
      rating: 4.5,
      reviewCount: 567
    },
    {
      id: 6,
      name: 'Antibacterial Hand Sanitizer',
      category: 'Personal Care',
      price: 8,
      originalPrice: 12,
      image: '/sanitizer.jpg',
      description: 'Alcohol-based hand sanitizer. Kills 99.99% of germs without water. Contains aloe vera to moisturize hands. Convenient travel size meets TSA requirements for carry-on luggage.',
      rating: 4.3,
      reviewCount: 1024
    },
    {
      id: 7,
      name: 'SPF 50 Sunblock Lotion',
      category: 'Sunblocks',
      price: 15,
      originalPrice: 20,
      image: '/sunblock.jpg',
      description: 'SPF 50 sunblock lotion for all skin types. Broad spectrum UVA/UVB protection. Water-resistant for up to 80 minutes. Non-greasy formula absorbs quickly without white residue.',
      rating: 4.6,
      reviewCount: 789
    },
    {
      id: 8,
      name: 'Organic Lavender Body Lotion',
      category: 'Skin Care',
      price: 12,
      originalPrice: 18,
      image: '/lotion.jpg',
      description: 'Nourishing body lotion with organic lavender essential oil. Soothes dry skin while promoting relaxation. Free from parabens, sulfates, and synthetic fragrances. Vegan and cruelty-free.',
      rating: 4.7,
      reviewCount: 432
    },
    {
      id: 9,
      name: 'Probiotic Digestive Support',
      category: 'Digestive Health',
      price: 24,
      originalPrice: 32,
      image: '/probiotic.jpg',
      description: 'Advanced probiotic formula with 50 billion CFUs per serving. Supports gut health and immune function. Contains 10 clinically studied strains. Shelf-stable formula requires no refrigeration.',
      rating: 4.8,
      reviewCount: 298
    },
    {
      id: 10,
      name: '24-Hour Allergy Relief',
      category: 'Allergy Relief',
      price: 14,
      originalPrice: 22,
      image: '/allergy.jpg',
      description: 'Non-drowsy allergy relief tablets. Provides 24-hour relief from sneezing, runny nose, itchy eyes, and throat. Suitable for indoor and outdoor allergies. One tablet per day dosage.',
      rating: 4.4,
      reviewCount: 876
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeCategory === 'All' || product.category === activeCategory)
  );

  const featuredProducts = products.filter(product => product.featured);
  const trendingProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const discountedProducts = [...products].filter(p => p.originalPrice).sort((a, b) => 
    ((b.originalPrice - b.price) / b.originalPrice) - ((a.originalPrice - a.price) / a.originalPrice)
  ).slice(0, 5);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans">
      <Head>
        <title>PharmaCare | Premium Pharmacy Products</title>
        <meta name="description" content="Everything you may need for your health and wellness" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sticky Navigation */}
      <motion.nav
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PharmaCare
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('products');
                }}
              >
                Products
              </a>
              <a 
                href="#" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('categories');
                }}
              >
                Categories
              </a>
              <a 
                href="#" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('ai-assistant');
                }}
              >
                AI Assistant
              </a>
              <a 
                href="#" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Contact
              </a>
              
              {/* Search Bar in Header */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white shadow-xl"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-3 space-y-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <div className="flex flex-col space-y-3">
                  <a 
                    href="#" 
                    className="text-gray-900 hover:text-blue-600 transition-colors font-medium py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('products');
                    }}
                  >
                    Products
                  </a>
                  <a 
                    href="#" 
                    className="text-gray-900 hover:text-blue-600 transition-colors font-medium py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('categories');
                    }}
                  >
                    Categories
                  </a>
                  <a 
                    href="#" 
                    className="text-gray-900 hover:text-blue-600 transition-colors font-medium py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('ai-assistant');
                    }}
                  >
                    AI Assistant
                  </a>
                  <a 
                    href="#" 
                    className="text-gray-900 hover:text-blue-600 transition-colors font-medium py-2"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Categories Bar */}
      <motion.div
        className="bg-white shadow-sm sticky top-16 z-40"
        id="categories"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 hide-scrollbar space-x-4">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  scrollToSection('products');
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hero Section with Carousel */}
      <motion.section
        className="relative bg-gradient-to-r from-blue-50 to-purple-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 5,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
          className="mySwiper h-[500px]"
        >
          <SwiperSlide className="!w-[80%]">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 flex items-center justify-center">
                <div className="p-10 text-white text-center max-w-4xl">
                  <motion.h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    EVERYTHING YOU MAY NEED
                  </motion.h1>
                  <motion.p
                    className="text-xl text-gray-200 max-w-3xl mx-auto mb-10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    Premium pharmacy products for your health and wellness
                  </motion.p>
                  <motion.button
                    className="px-8 py-3 bg-white text-blue-600 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToSection('products')}
                  >
                    Shop Now
                  </motion.button>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className="!w-[80%]">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-teal-600/90 flex items-center justify-center">
                <div className="p-10 text-white text-center max-w-4xl">
                  <motion.h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    QUALITY PRODUCTS
                  </motion.h1>
                  <motion.p
                    className="text-xl text-gray-200 max-w-3xl mx-auto mb-10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    We offer a wide range of high-quality products to meet your needs
                  </motion.p>
                  <motion.button
                    className="px-8 py-3 bg-white text-green-600 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToSection('trending')}
                  >
                    View Trending
                  </motion.button>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className="!w-[80%]">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-amber-600/90 flex items-center justify-center">
                <div className="p-10 text-white text-center max-w-4xl">
                  <motion.h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    BEST PRICES
                  </motion.h1>
                  <motion.p
                    className="text-xl text-gray-200 max-w-3xl mx-auto mb-10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    Get the best deals on all your pharmacy needs
                  </motion.p>
                  <motion.button
                    className="px-8 py-3 bg-white text-orange-600 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToSection('discounted')}
                  >
                    View Discounts
                  </motion.button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </motion.section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white" id="featured">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group cursor-pointer"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-full w-full flex items-center justify-center">
                    <span className="text-gray-500">Product Image</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                    Featured
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-blue-600">${product.price}</span>
                      {product.originalPrice && (
                        <span className="block text-sm text-gray-400 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Moving Rows Section - Improved */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trending Products Row */}
          <div className="mb-16" id="trending">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-8 text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Now</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
            </motion.div>
            
            <div 
              className="flex overflow-x-hidden py-4 scroll-smooth"
              ref={rowARef}
            >
              <div 
                className="flex space-x-6"
                ref={rowAContentRef}
              >
                {[...trendingProducts, ...trendingProducts].map((product, index) => (
                  <motion.div
                    key={`rowA-${index}`}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group cursor-pointer w-72 flex-shrink-0"
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedProduct(product)}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-full w-full flex items-center justify-center">
                        <span className="text-gray-500">Product Image</span>
                      </div>
                      <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        Trending
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-600">${product.price}</span>
                          {product.originalPrice && (
                            <span className="block text-sm text-gray-400 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Discounted Products Row */}
          <div id="discounted">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-8 text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Hot Discounts</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
            </motion.div>
            
            <div 
              className="flex overflow-x-hidden py-4 scroll-smooth"
              ref={rowBRef}
            >
              <div 
                className="flex space-x-6"
                ref={rowBContentRef}
              >
                {[...discountedProducts, ...discountedProducts].map((product, index) => (
                  <motion.div
                    key={`rowB-${index}`}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group cursor-pointer w-72 flex-shrink-0"
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedProduct(product)}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="bg-gradient-to-br from-amber-100 to-orange-100 h-full w-full flex items-center justify-center">
                        <span className="text-gray-500">Product Image</span>
                      </div>
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        {Math.round((product.originalPrice - product.price) / product.originalPrice * 100)}% OFF
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-600">${product.price}</span>
                          {product.originalPrice && (
                            <span className="block text-sm text-gray-400 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group cursor-pointer"
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-full w-full flex items-center justify-center">
                          <span className="text-gray-500">Product Image</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-blue-600">${product.price}</span>
                            {product.originalPrice && (
                              <span className="block text-sm text-gray-400 line-through">${product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-gray-500">
                    Try adjusting your search or filter to find what youre looking for.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Detail View */}
      {selectedProduct && (
        <motion.div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={() => setSelectedProduct(null)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-64 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                    <p className="text-gray-600">{selectedProduct.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-600">${selectedProduct.price}</span>
                    {selectedProduct.originalPrice && (
                      <span className="block text-sm text-gray-400 line-through">${selectedProduct.originalPrice}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(selectedProduct.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">({selectedProduct.reviewCount} reviews)</span>
                </div>
                
                <p className="text-gray-700 mb-6">{selectedProduct.description}</p>
                
                <div className="flex space-x-4">
                  <motion.button
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add to Cart
                  </motion.button>
                  <motion.button
                    className="flex-1 border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save for Later
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced AI Section */}
      <section className="py-16 bg-gray-50" id="ai-assistant">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Pharmacy Assistant</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Get instant information about any medication or health product in Kurdish or English</p>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4"></div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 ml-3">Ask about any medication</h3>
              </div>
              
              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="h-64 overflow-y-auto mb-6 border rounded-lg p-4 bg-gray-50 space-y-3"
              >
                {aiMessages.length > 0 ? (
                  aiMessages.map((message, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: message.sender === "You" ? 10 : -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.sender === "You" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${message.sender === "You" ? 
                          "bg-blue-600 text-white rounded-tr-none" : 
                          message.isError ? "bg-red-100 text-red-800 rounded-tl-none" : "bg-gray-200 text-gray-800 rounded-tl-none"}`}
                      >
                        <p className="font-medium text-sm">{message.sender}</p>
                        <p className="mt-1">{message.text}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <svg className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p>Start a conversation with our AI assistant</p>
                    <p className="text-sm mt-2">You can type your question or upload an image</p>
                  </div>
                )}
                {isLoading && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-tl-none max-w-xs">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Camera Preview */}
              {isCameraOpen && (
                <motion.div
                  className="mb-4 relative rounded-lg overflow-hidden border"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                    <motion.button
                      onClick={() => setIsCameraOpen(false)}
                      className="bg-gray-800/80 text-white p-2 rounded-full shadow-lg hover:bg-gray-900/90 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                    <motion.button
                      onClick={captureImage}
                      className="bg-white/80 text-gray-900 p-3 rounded-full shadow-lg hover:bg-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        if (videoRef.current && videoRef.current.srcObject) {
                          const stream = videoRef.current.srcObject;
                          const tracks = stream.getVideoTracks();
                          tracks.forEach(track => {
                            track.applyConstraints({
                              facingMode: track.getConstraints().facingMode === 'user' ? 'environment' : 'user'
                            });
                          });
                        }
                      }}
                      className="bg-gray-800/80 text-white p-2 rounded-full shadow-lg hover:bg-gray-900/90 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              {/* Image Upload Modal */}
              {isImageUploadOpen && (
                <motion.div
                  className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsImageUploadOpen(false)}
                >
                  <motion.div
                    className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Upload Product Image</h3>
                      <button
                        onClick={() => setIsImageUploadOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">Click to select an image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </div>
                      
                      <div className="flex justify-center">
                        <motion.button
                          onClick={() => {
                            setIsImageUploadOpen(false);
                            setIsCameraOpen(true);
                          }}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Use Camera Instead
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Input Form */}
              <form onSubmit={handleAiSubmit} className="flex space-x-2">
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask about any medication..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setIsImageUploadOpen(true)}
                    className="px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </motion.button>
                </div>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Product */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 text-white">
                <motion.div 
                  className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <span className="text-sm font-medium">Featured Product</span>
                </motion.div>
                <motion.h2
                  className="text-3xl font-bold mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  Bubble Bath Set
                </motion.h2>
                <motion.p
                  className="text-blue-100 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Premium baby care set with organic ingredients
                </motion.p>
                <motion.div
                  className="flex items-center mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <span className="text-3xl font-bold">$99</span>
                  <span className="ml-3 text-lg line-through text-blue-200">$150</span>
                  <span className="ml-3 bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-bold">33% OFF</span>
                </motion.div>
                <motion.div
                  className="flex space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <motion.button
                    className="flex-1 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium shadow-md hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Shop Now
                  </motion.button>
                  <motion.button
                    className="flex-1 border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Details
                  </motion.button>
                </motion.div>
              </div>
              <div className="hidden lg:block relative">
                <div className="absolute inset-0 bg-gradient-to-l from-blue-600/20 to-purple-600/20"></div>
                <div className="h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <motion.div
                    className="relative"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-64 h-64 bg-white rounded-full shadow-xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-500">Product Image</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: item * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-6">The products are amazing and the delivery was super fast. I will definitely shop here again!</p>
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-sm">JP</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">John P.</h4>
                    <p className="text-xs text-gray-500">Verified Customer</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">Subscribe to our newsletter for the latest products, promotions, and health tips.</p>
            
            <motion.form
              className="flex max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                required
              />
              <motion.button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-700 to-blue-700 text-white rounded-r-lg font-medium hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">PharmaCare</h3>
              <p className="text-gray-400 mb-4">Your trusted partner for premium pharmacy products and health solutions.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('products');
                    }}
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('categories');
                    }}
                  >
                    Categories
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('ai-assistant');
                    }}
                  >
                    AI Assistant
                  </a>
                </li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                {categories.slice(0, 6).map((category) => (
                  <li key={category}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveCategory(category);
                        scrollToSection('products');
                      }}
                    >
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  123 Pharmacy St, Health City
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +1 (234) 567-890
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@pharmacare.com
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p>&copy; {new Date().getFullYear()} PharmaCare. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}