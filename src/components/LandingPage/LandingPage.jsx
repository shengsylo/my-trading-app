import React, { useRef, useEffect, useState } from 'react';
import { Typography, Button, Row, Col, Space } from 'antd';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRightOutlined, SafetyCertificateOutlined, RocketOutlined, MobileOutlined, BookOutlined, UsergroupAddOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function LandingPage() {
  const containerRef = useRef(null);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, windowHeight], [0, windowHeight * 0.3]);
  const y2 = useTransform(scrollY, [0, windowHeight], [0, windowHeight * -0.3]);
  const opacity = useTransform(scrollY, [0, windowHeight * 0.5], [1, 0]);
  const scale = useTransform(scrollY, [0, windowHeight], [1, 0.8]);
  
  const springConfig = { damping: 30, stiffness: 200 };
  const scaleSpring = useSpring(scale, springConfig);
  const y1Spring = useSpring(y1, springConfig);
  const y2Spring = useSpring(y2, springConfig);

  return (
    <div ref={containerRef} className="bg-black text-white overflow-hidden pt-4 pb-3 mb-3">
      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden">
        <motion.div
          style={{ opacity }}
          className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black/40"
        />
        
        <div className="container mx-auto px-4 pt-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <Title level={1} className="text-8xl font-bold text-white mb-6">
              Trading
              <span className="block text-9xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Reimagined.
              </span>
            </Title>
            
            <Paragraph className="text-2xl text-gray-300 mb-8">
              Experience the future of financial markets.
            </Paragraph>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="primary"
                size="large"
                className="h-16 px-12 text-xl bg-white text-black border-none rounded-full"
              ><a className='text-decoration-none' href="/trading">Start Trading</a><ArrowRightOutlined />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ y: y1Spring, scale: scaleSpring }}
            className="mt-20 relative"
          >
            {/* Platform Preview */}
            <div className="aspect-[16/9] max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden shadow-2xl">
              <div className="w-full h-full bg-black/30 backdrop-blur-sm p-8">
                {/* Trading Interface Mockup */}
                <div className="grid grid-cols-3 gap-4 h-full">
                  <div className="col-span-2 bg-black/40 rounded-xl p-4">
                    <div className="h-3/4 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-lg" />
                    <div className="h-1/4 mt-4 grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/10 rounded-lg" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white/10 rounded-lg h-24" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="min-h-screen bg-black relative overflow-hidden">
        <motion.div
          style={{ y: y2Spring }}
          className="container mx-auto px-4 py-32"
        >
          <Row gutter={[48, 48]} className="items-center">
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              >
                <Title level={2} className="text-6xl font-bold text-white mb-8">
                  Lightning Fast
                  <span className="block text-blue-400">Execution</span>
                </Title>
                <Paragraph className="text-xl text-gray-400 mb-8">
                  Experience trades at the speed of light with our next-generation infrastructure.
                  Zero latency. Zero compromise.
                </Paragraph>
                <Space size="large">
                  <div className="flex items-center space-x-4">
                    <RocketOutlined className="text-4xl text-blue-400" />
                    <div>
                      <div className="text-xl font-bold">0.001s</div>
                      <div className="text-gray-400">Average Execution</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <SafetyCertificateOutlined className="text-4xl text-blue-400" />
                    <div>
                      <div className="text-xl font-bold">99.99%</div>
                      <div className="text-gray-400">Uptime</div>
                    </div>
                  </div>
                </Space>
              </motion.div>
            </Col>
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative"
              >
                {/* Animated Chart */}
                <div className="aspect-square bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl overflow-hidden backdrop-blur-xl">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <motion.path
                      d="M 0 50 Q 25 20, 50 50 T 100 50"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="0.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#C084FC" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </section>

      {/* AI Bot Trading Section */}
      <section className="min-h-screen bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-24"
          >
            <Title level={2} className="text-6xl font-bold text-white mb-8">
              AI Bot Trading
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Automate Your Success
              </span>
            </Title>
            <Paragraph className="text-xl text-gray-400 mb-8">
              Leverage the power of AI to execute trades on your behalf, optimizing your strategies for maximum profit.
            </Paragraph>
            <Button type="primary" size="large" className="h-16 px-12 text-xl bg-white text-black border-none rounded-full">
              Learn More <ArrowRightOutlined />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Real-Time Analytics Section */}
      <section className="min-h-screen bg-gradient-to-b from-black to-blue-900/20 relative">
        <div className="container mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-24"
          >
            <Title level={2} className="text-6xl font-bold text-white mb-8">
              Real-Time Analytics
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Insights at Your Fingertips
              </span>
            </Title>
            <Paragraph className="text-xl text-gray-400 mb-8">
              Access powerful analytics tools to track market trends and make informed decisions in real-time.
            </Paragraph>
            <Button type="primary" size="large" className="h-16 px-12 text-xl bg-white text-black border-none rounded-full">
              Explore Analytics <ArrowRightOutlined />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Community Section */}
      <section className="min-h-screen bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-24"
          >
            <Title level={2} className="text-6xl font-bold text-white mb-8">
              Join Our Community
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Connect and Collaborate
              </span>
            </Title>
            <Paragraph className="text-xl text-gray-400 mb-8">
              Engage with fellow traders, share insights, and grow together in our vibrant community.
            </Paragraph>
            <Button type="primary" size="large" className="h-16 px-12 text-xl bg-white text-black border-none rounded-full">
              Join Now <UsergroupAddOutlined />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Educational Resources Section */}
      <section className="min-h-screen bg-gradient-to-b from-black to-blue-900/20 relative">
        <div className="container mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-24"
          >
            <Title level={2} className="text-6xl font-bold text-white mb-8">
              Educational Resources
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Learn and Grow
              </span>
            </Title>
            <Paragraph className="text-xl text-gray-400 mb-8">
              Access tutorials, webinars, and articles to enhance your trading skills and knowledge.
            </Paragraph>
            <Button type="primary" size="large" className="h-16 px-12 text-xl bg-white text-black border-none rounded-full">
              Start Learning <BookOutlined />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-screen bg-gradient-to-b from-blue-900/20 to-black relative flex items-center">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <Title level={2} className="text-7xl font-bold text-white mb-8">
              Ready to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Transform Your Trading?
              </span>
            </Title>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type=" primary"
                size="large"
                className="h-16 px-12 text-xl bg-white text-black border-none rounded-full"
              >
                Get Started Now <ArrowRightOutlined />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;