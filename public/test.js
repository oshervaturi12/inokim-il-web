  class ABTestManager {
    constructor(){
      console.group('Initializing AB Testing System');
      if (ABTestManager.instance) {
        console.log('Returning existing instance');
        console.groupEnd();
        return ABTestManager.instance;
      }
      try {
        this.setupCore();
        this.setupState();
        ABTestManager.instance = this;
        console.log('AB Testing System initialized successfully');
      } catch(err){
        console.error('Failed to init AB Testing:',err);
        throw err;
      } finally {
        console.groupEnd();
      }
    }

    setupCore(){
      console.group('Setting up core');
      this.core = new TrackingCore();
      this.assignmentManager = new AssignmentManager();
      // Our entire theme settings object
      this.settings = {"icon_stroke_width":2,"button_border_radius":30,"block_border_radius":"none","vertical_spacing":"large","heading_color":"#282828","text_color":"#000000","background":"#ffffff","secondary_background":"#f5f5f5","success_color":"#2e9e7b","error_color":"#de2a2a","header_background":"#fff","header_text_color":"#000000","footer_background":"#f6f6f6","footer_text_color":"#1e1e1e","primary_button_background":"#f90910","primary_button_text_color":"#ffffff","secondary_button_background":"#262626","secondary_button_text_color":"#ffffff","product_rating_color":"#f6a429","product_on_sale_accent":"#de2a2a","product_sold_out_accent":"#6f719b","product_custom_label_background":"#405de6","product_custom_label_2_background":"#f3ff34","product_in_stock_text_color":"#2e9e7b","product_low_stock_text_color":"#de2a2a","heading_font":{"error":"json not allowed for this object"},"heading_font_size":"medium","heading_text_transform":"uppercase","text_font":{"error":"json not allowed for this object"},"text_font_size":15,"currency_code_enabled":false,"show_image_zoom":true,"stagger_products_apparition":true,"stagger_blog_posts_apparition":true,"reveal_product_media":true,"round_color_swatches":true,"color_swatch_config":"","show_vendor":false,"show_secondary_image":true,"product_add_to_cart":false,"show_product_rating":false,"show_discount":true,"discount_mode":"saving","product_color_display":"hide","product_image_size":"square","search_enable_products":true,"search_enable_blog_posts":true,"search_enable_pages":false,"search_enable_collections":true,"search_unavailable_products":"last","cart_type":"message","cart_icon":"shopping_cart","cart_empty_button_link":"\/collections\/vehicle","cart_show_free_shipping_threshold":false,"cart_free_shipping_threshold":"50","social_facebook":"https:\/\/business.facebook.com\/inokimisrael\/?business_id=243557116074904","social_twitter":"","social_pinterest":"","social_instagram":"","social_vimeo":"","social_tumblr":"","social_youtube":"https:\/\/www.youtube.com\/@inokim","social_tiktok":"","social_linkedin":"","social_snapchat":"","social_fancy":"","social_wechat":"","social_reddit":"","social_line":"","social_spotify":"","favicon":"\/\/inokimil.myshopify.com\/cdn\/shop\/files\/favicon.png?v=1669885468","hw-enable-abt":true,"hw-api-endpoint":"https:\/\/sessions-db-api.vercel.app\/api\/","hw-api-key":"29b9c9d9bafbde03a91053ce2612683f3e48f6cb90ca8e121ef23d2959bbbc4d","hw-product-traffic":50,"hw-cart-traffic":0,"hw-checkout-traffic":0,"hw-global-traffic":50,"AB009":"test","AB009_location":"product","AB009_device":"mobile","AB009_name":"Product service package","AB009_variants_count":1,"AB008":"test","AB008_location":"global","AB008_device":"both","AB008_name":"Cart upsell display","AB008_variants_count":1,"checkout_logo_position":"left","checkout_logo_size":"medium","checkout_body_background_color":"#fff","checkout_input_background_color_mode":"white","checkout_sidebar_background_color":"#f5f5f5","checkout_heading_font":"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'","checkout_body_font":"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'","checkout_accent_color":"#282828","checkout_button_color":"#405de6","checkout_error_color":"#de2a2a","AB002":"v1","accent_color":"#405de6","customer_layout":"customer_area"};
      console.log('Settings loaded:', this.settings);
      console.groupEnd();
    }

    setupState(){
      console.group('Setting up state');
      this.allTests = [];
      const { userId, sessionId } = this.core.getTrackingIds();
      this.userId = userId;
      this.sessionId = sessionId;

      console.log('State:', { userId, sessionId });
      console.groupEnd();
    }

    async initialize(){
      console.group('Initializing Test System');
      try {
        // Clean up old assignments
        this.assignmentManager.cleanup();

        // 1) Gather tests from theme settings
        await this.loadActiveTestsFromSettings();

        // 2) Assign variants (only if user doesn't already have assignments)
        this.assignAllGroups();

        // 3) Apply classes to <body>
        this.applyAssignments();

        // 4) Track them once
        await this.trackTestAssignments();

        return true;
      } catch(err) {
        console.error('Failed to initialize:', err);
        return false;
      } finally {
        console.groupEnd();
      }
    }

    loadActiveTestsFromSettings(){
      console.group('Loading Tests from Theme Settings');
      try {
        const experimentKeys = Object.keys(this.settings)
          .filter(k => /^AB\d+$/.test(k));

        this.allTests = experimentKeys.map(testId => {
          const modeValue = this.settings[testId];  // e.g. 'test','v0','v1','v2'
          let forcedVariant = null;
          let testMode = 'test';

          if (modeValue === 'test') {
            testMode = 'test';
          } else if (modeValue.startsWith('v')) {
            forcedVariant = modeValue.replace('v',''); // '0','1','2'...
            testMode = 'forced';
          }

          const locKey = `${testId}_location`;
          const devKey = `${testId}_device`;
          const location = this.settings[locKey] || 'global';
          const device = this.settings[devKey] || 'both';

          const nameKey = `${testId}_name`;
          const testName = this.settings[nameKey] || '';

          const countKey = `${testId}_variants_count`;
          const variantsCount = parseInt(this.settings[countKey] || '1', 10) || 1;

          const possibleVars = [];
          for (let i=1; i<=variantsCount; i++){
            possibleVars.push(String(i));
          }

          return {
            id: testId,
            mode: testMode,
            forcedVariant,
            location,
            device,
            testName,
            possibleNonZeroVariants: possibleVars
          };
        });

        console.log('All tests from settings:', this.allTests);
      } catch(err){
        console.error('Error loading tests:', err);
      } finally {
        console.groupEnd();
      }
    }

    assignAllGroups() {
      console.group('Assigning variants for each group');
      const groupMap = {};
      this.allTests.forEach(t => {
        const g = t.location;
        groupMap[g] = groupMap[g] || [];
        groupMap[g].push(t);
      });

      Object.keys(groupMap).forEach(group => {
        const testsInGroup = groupMap[group];
        this.assignGroup(group, testsInGroup);
      });

      console.groupEnd();
    }

    assignGroup(group, tests) {
      console.group(`Assigning group="${group}":`, tests);

      const forcedTests = tests.filter(t => t.mode === 'forced');
      const unforcedTests = tests.filter(t => t.mode === 'test');

      // 1) forced logic
      forcedTests.forEach(ft => {
        const forcedVar = ft.forcedVariant || '0'; 
        const assignmentData = {
          variant: forcedVar,
          assigned_variant: forcedVar,
          tested_variant: (forcedVar === '0') ? '0' : null,
          type: (forcedVar==='0') ? 'control' : 'test',
          mode: (forcedVar==='0') ? 'forced-0' : 'forced',
          pageGroup: group,
          name: ft.testName || ''
        };
        this.setOrKeepAssignment(ft, assignmentData);
      });

      // 2) unforced logic
      if (unforcedTests.length === 0) {
        console.log(`No unforced tests for group=${group}`);
        console.groupEnd();
        return;
      }

      const trafficKey = `hw-${group}-traffic`;
      const trafficValStr = this.settings[trafficKey] || '0';
      const traffic = parseInt(trafficValStr,10) || 0;
      const fraction = traffic / 100; 

      console.log(`Group=${group}, fraction=${fraction}`);
      const rng = Math.random();
      console.log(`rng=${rng}, group=${group}`);

      if (rng >= fraction) {
        // user not in experiment => variant=0 for all unforced
        unforcedTests.forEach(t => {
          const assignmentData = {
            variant: '0',
            assigned_variant: '0',
            tested_variant: '0',
            type: 'control',
            mode: 'pure-control',
            pageGroup: group,
            name: t.testName || ''
          };
          this.setOrKeepAssignment(t, assignmentData);
        });
      } else {
        // user in experiment => pick 1 unforced => random variant among that test's [1..N]
        const chosenIndex = Math.floor(Math.random() * unforcedTests.length);
        unforcedTests.forEach((testObj, idx) => {
          if (idx === chosenIndex) {
            const arr = testObj.possibleNonZeroVariants || ['1'];
            const pick2 = Math.floor(Math.random() * arr.length);
            const finalVar = arr[pick2];
            console.log(`Test ${testObj.id} => chosen variant=${finalVar}`);

            const assignmentData = {
              variant: finalVar,
              assigned_variant: finalVar,
              tested_variant: finalVar,
              type: 'test',
              mode: 'probabilistic',
              pageGroup: group,
              name: testObj.testName || ''
            };
            this.setOrKeepAssignment(testObj, assignmentData);
          } else {
            // excluded => variant=0, tested_variant=null
            const assignmentData = {
              variant: '0',
              assigned_variant: '0',
              tested_variant: null,
              type: 'control',
              mode: 'excluded',
              pageGroup: group,
              name: testObj.testName || ''
            };
            this.setOrKeepAssignment(testObj, assignmentData);
          }
        });
      }

      console.groupEnd();
    }

    setOrKeepAssignment(testObj, data){
      const existing = this.assignmentManager.getAssignment(testObj.id);
      if (existing) {
        console.log(`Assignment for ${testObj.id} already exists; skipping`, existing);
        return;
      }
      this.assignmentManager.setAssignment(testObj.id, data);
    }

    applyAssignments(){
      console.group('Applying Assignments');
      if (!document.body) {
        console.warn('No document.body');
        console.groupEnd();
        return;
      }

      const currentTemplate = "product";
      const templateToGroup = {
        product: 'product',
        collection: 'collection',
        cart: 'cart',
        checkout: 'checkout',
        index: 'home'
      };
      const mappedGroup = templateToGroup[currentTemplate] || 'home';
      const relevantGroups = ['global', mappedGroup];

      console.log('Relevant groups for apply:', relevantGroups);

      const assts = this.assignmentManager.getAllAssignments() || [];
      const toApply = assts.filter(a => relevantGroups.includes(a.pageGroup));
      console.log('Assignments to apply:', toApply);

      const prefix = 'ab';
      toApply.forEach(a => {
        if (a.variant !== '0') {
          document.body.classList.add(
            `${prefix}-active`,
            `${prefix}-${a.testId}`,
            `${prefix}-${a.testId}-${a.variant}`
          );
          document.body.classList.add(`${prefix}-${a.pageGroup}`);
        } else {
          document.body.classList.add(`${prefix}-${a.testId}-0`);
        }
      });

      console.groupEnd();
    }

    async trackTestAssignments(){
      console.group('Tracking Test Assignments');
      try {
        if (!window.postgresReporter) {
          throw new Error('PostgreSQL reporter not found');
        }
        const assts = this.assignmentManager.getAllAssignments() || [];
        console.log('Tracking assignments:', assts);

        for (const a of assts) {
          await window.postgresReporter.trackAssignment({
            testId: a.testId,
            variant: a.variant,
            assignmentType: a.type,
            assignmentMode: a.mode,
            pageGroup: a.pageGroup,
            userId: this.userId,
            name: a.name,
            assigned_variant: a.assigned_variant,
            tested_variant: a.tested_variant
          });

          // dataLayer optional
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            abTest: {
              testId: a.testId,
              variant: a.variant,
              mode: a.mode
            }
          });
        }
        console.log('Test assignments tracked successfully');
      } catch(err){
        console.error('Failed to track test assignments:', err);
      } finally{
        console.groupEnd();
      }
    }
  }

  window.ABTestManager = ABTestManager;

  const waitForDeps=()=>{
    return new Promise((resolve,reject)=>{
      let attempts=0;
      const max=50;
      const check=()=>{
        attempts++;
        if(window.TrackingCore && document.body){
          console.log('Dependencies OK after',attempts,'attempts');
          resolve();
          return;
        }
        if(attempts>=max){
          reject(new Error('Deps not found after max attempts'));
          return;
        }
        if(document.readyState==='complete' && !window.TrackingCore){
          reject(new Error('No TrackingCore after page load'));
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    });
  };

  const initSystem=async()=>{
    console.group('Initializing System');
    try{
      await waitForDeps();
      console.log('Deps available, creating ABTestManager');
      const mgr=new ABTestManager();
      const ok=await mgr.initialize();
      console.log('AB Testing init complete:',{success:ok});
    } catch(err){
      console.error('Failed to init AB Testing System:',err);
    } finally{
      console.groupEnd();
    }
  };

  console.log('Starting AB Testing System initialization');
  initSystem();
})();


