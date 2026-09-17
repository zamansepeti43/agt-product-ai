const config = {
  appId: 'com.agtstudio.productai',
  appName: 'AGT Product AI',
  webDir: 'mobile-dist',
  server: {
    url: process.env.AGT_PRODUCT_AI_URL || undefined,
    cleartext: false,
  },
};

export default config;
