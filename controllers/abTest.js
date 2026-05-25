const factory = require('./handlerFactory')
const ABTests = require('./../models/ABTests')
const catchAsync = require('../util/catchAsync')
const OpenAI = require('openai');

exports.getAllABTests = factory.getAll(ABTests)

exports.createABTests = factory.createOne(ABTests)

exports.getABTests = factory.getOne(ABTests)

exports.updateABTests = factory.updateOne(ABTests)

exports.deleteABTests = factory.deleteOne(ABTests)



exports.trackImpression = catchAsync( async (req, res, next) => {
    const { key, variantName } = req.body;
  
    if (!key || !variantName) {
      return res.status(400).json({ message: 'Missing key or variantName' });
    }
  
      const result = await ABTests.updateOne(
        { key, 'variants.name': variantName },
        { $inc: { 'variants.$.impressions': 1 } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'AB test variant not found' });
      }
  
      return res.status(200).json({ success: true });
 
  });


  exports.trackABTestClick = catchAsync( async (req, res, next) => {
    const { key, variantName } = req.body;
  
    if (!key || !variantName) {
      return res.status(400).json({ success: false, message: 'Missing key or variantName' });
    }
  
      const result = await ABTests.updateOne(
        { key, 'variants.name': variantName },
        { $inc: { 'variants.$.clicks': 1 } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ success: false, message: 'A/B test or variant not found' });
      }
  
      return res.status(200).json({ success: true, message: 'Click tracked' });

  });


  exports.trackABTestConversion = catchAsync( async (req, res, next) => {
    const { key, variantName } = req.body;
  
    if (!key || !variantName) {
      return res.status(400).json({ success: false, message: 'Missing key or variantName' });
    }
  
      const result = await ABTests.updateOne(
        { key, 'variants.name': variantName },
        { $inc: { 'variants.$.conversions': 1 } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ success: false, message: 'A/B test or variant not found' });
      }
  
      return res.status(200).json({ success: true, message: 'Conversion tracked' });
 
  });


  const { generateInsight } = require('../services/openAIService');


  exports.getABTestInsights = catchAsync( async (req, res, next) => {
    const test = await ABTests.findById(req.params.id).lean();
    if (!test) return res.status(404).json({ message: 'A/B Test not found' });
  
    const dataForAI = test.variants.map(v => {
      return `${v.name}: ${v.impressions} impressions, ${v.clicks} clicks, ${v.conversions} conversions`;
    }).join('\n');
  
    const prompt = `
    Analyze the following A/B test performance data and provide a short recommendation on which variant performs better and why:
    
    Test Key: ${test.key}
    Variants:
    ${dataForAI}
      `;
  
    const insight = await generateInsight(prompt, {
      system: 'You are a conversion optimization expert.',
      temperature: 0.5
    });
  
    res.json({ test, insight });
  });



